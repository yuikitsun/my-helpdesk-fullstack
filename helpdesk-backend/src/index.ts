import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') }); // ищем .env рядом с этим файлом, а не в cwd
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables.');
}

app.use(cors());
app.use(express.json());

interface AuthRequest extends Request {
    userId?: number;
}

// --- AUTH MIDDLEWARE ---
const checkAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: "Access denied. You are not authorized." });
            return;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};

// --- ROLE MIDDLEWARE ---
function requireRole(...roles: string[]) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.userId) {
            res.status(401).json({ message: "Not authenticated." });
            return;
        }
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || !roles.includes(user.role)) {
            res.status(403).json({ message: "Insufficient permissions." });
            return;
        }
        next();
    };
}

// --- REGISTER ---
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            res.status(400).json({ message: "Please fill in all required fields." });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: "This email is already taken." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: 'employee',
                status: 'pending',
            },
        });

        res.status(201).json({ message: "Registration submitted. Awaiting admin approval." });
    } catch (error) {
        res.status(500).json({ message: "Server error during registration." });
    }
});

// --- LOGIN ---
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: "Invalid email or password." });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid email or password." });
            return;
        }

        if (user.status === 'pending') {
            res.status(403).json({ message: "Your account is awaiting admin approval." });
            return;
        }
        if (user.status === 'rejected') {
            res.status(403).json({ message: "Access denied for this account." });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: "Login successful.",
            token,
            user: {
                email: user.email,
                fullName: `${user.firstName} ${user.lastName}`,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
});

// --- GET ALL USERS (только admin / super_admin) ---
app.get('/api/users', checkAuth, requireRole('super_admin', 'admin'), async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                status: true,
                _count: {
                    select: { devices: true }
                }
            },
            orderBy: {
                firstName: 'asc'
            }
        });

        res.json(users);
    } catch (error) {
        console.error("Prisma error fetching users:", error);
        res.status(500).json({ error: 'Server error while fetching users.' });
    }
});

// --- GET PENDING USERS (заявки на регистрацию) ---
app.get('/api/admin/pending-users', checkAuth, requireRole('super_admin', 'admin'), async (req: AuthRequest, res: Response) => {
    try {
        const pending = await prisma.user.findMany({
            where: { status: 'pending' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        res.json(pending);
    } catch (error) {
        console.error("Prisma error fetching pending users:", error);
        res.status(500).json({ message: "Server error fetching pending users." });
    }
});

// --- APPROVE USER ---
app.post('/api/admin/approve/:id', checkAuth, requireRole('super_admin', 'admin'), async (req: AuthRequest, res: Response) => {
    try {
        const targetId = Number(req.params.id);
        if (Number.isNaN(targetId)) {
            res.status(400).json({ message: "Invalid user id." });
            return;
        }

        const user = await prisma.user.update({
            where: { id: targetId },
            data: {
                status: 'active',
                approvedBy: req.userId,
                approvedAt: new Date(),
            },
            select: { id: true, email: true, status: true },
        });

        res.json(user);
    } catch (error) {
        console.error("Prisma error approving user:", error);
        res.status(500).json({ message: "Server error approving user." });
    }
});

// --- REJECT USER ---
app.post('/api/admin/reject/:id', checkAuth, requireRole('super_admin', 'admin'), async (req: AuthRequest, res: Response) => {
    try {
        const targetId = Number(req.params.id);
        if (Number.isNaN(targetId)) {
            res.status(400).json({ message: "Invalid user id." });
            return;
        }

        const user = await prisma.user.update({
            where: { id: targetId },
            data: { status: 'rejected' },
            select: { id: true, email: true, status: true },
        });

        res.json(user);
    } catch (error) {
        console.error("Prisma error rejecting user:", error);
        res.status(500).json({ message: "Server error rejecting user." });
    }
});

// --- GET DEVICES ---
app.get('/api/devices', checkAuth, async (req: AuthRequest, res: Response) => {
    try {
        // Подтягиваем девайсы вместе с данными пользователя, которому они назначены
        const devices = await prisma.device.findMany({
            include: {
                assignedTo: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        const formattedDevices = devices.map(device => {
            // Если девайс привязан к userId, склеиваем имя. Если нет — пишем "Not Assigned" (на складе)
            const ownerName = device.assignedTo
                ? `${device.assignedTo.firstName} ${device.assignedTo.lastName}`
                : "Not Assigned";

            return {
                id: device.id,
                name: device.title,
                owner: ownerName, // Фронтенд получит красивое имя сотрудника из БД
                status: device.status,
                type: device.type,
                location: device.location || "",
                notes: device.notes || "",
                specs: device.cpu || device.ram ? { cpu: device.cpu || "", ram: device.ram || "" } : undefined
            };
        });

        res.json(formattedDevices);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ message: "Server error while fetching devices." });
    }
});

// --- ADD DEVICE ---
app.post('/api/devices', checkAuth, async (req: AuthRequest, res: Response) => {
    try {
        // Из body нам больше НЕ нужно поле owner для записи в саму модель Device
        const { name, status, type, specs, location, notes, userId } = req.body;

        const generatedId = `DEV-${Math.floor(1000 + Math.random() * 9000)}`;
        const parsedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

        // Создаем запись в базе данных строго по схеме из schema.prisma
        const newDevice = await prisma.device.create({
            data: {
                id: generatedId,
                title: name,
                type,
                status,
                cpu: specs?.cpu || null,
                ram: specs?.ram || null,
                location: location || null,
                notes: notes || null,
                userId: (parsedUserId && !isNaN(parsedUserId)) ? parsedUserId : null
            },
            // Сразу подтягиваем инфо о юзере, чтобы вернуть правильный формат на фронт
            include: {
                assignedTo: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        // Формируем ответ, который ожидает фронтенд
        const displayOwner = newDevice.assignedTo
            ? `${newDevice.assignedTo.firstName} ${newDevice.assignedTo.lastName}`
            : "Not Assigned";

        res.status(201).json({
            id: newDevice.id,
            name: newDevice.title,
            owner: displayOwner,
            status: newDevice.status,
            type: newDevice.type,
            location: newDevice.location,
            notes: newDevice.notes,
            specs: newDevice.cpu || newDevice.ram ? { cpu: newDevice.cpu || "", ram: newDevice.ram || "" } : undefined
        });
    } catch (error) {
        console.error("Prisma error creating device:", error);
        res.status(500).json({ error: 'Server error while adding device.' });
    }
});

app.listen(5000, () => {
    console.log('🚀 HelpDesk Pro backend successfully running on http://localhost:5000');
});