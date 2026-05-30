import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_helpdesk_123';

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
            data: { firstName, lastName, email, password: hashedPassword },
        });

        res.status(201).json({ message: "Registration successful!" });
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

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            message: "Login successful.",
            token,
            user: {
                email: user.email,
                fullName: `${user.firstName} ${user.lastName}`
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login." });
    }
});

// --- GET DEVICES ---
app.get('/api/devices', checkAuth, async (req: AuthRequest, res: Response) => {
    try {
        const devices = await prisma.device.findMany();
        const formattedDevices = devices.map(device => ({
            id: device.id,
            name: device.name,
            owner: device.owner,
            status: device.status,
            type: device.type,
            location: device.location,
            notes: device.notes,
            specs: device.cpu || device.ram ? { cpu: device.cpu || "", ram: device.ram || "" } : undefined
        }));
        res.json(formattedDevices);
    } catch (error) {
        res.status(500).json({ message: "Server error while fetching devices." });
    }
});

// --- ADD DEVICE ---
app.post('/api/devices', checkAuth, async (req: AuthRequest, res: Response) => {
    try {
        const { name, owner, status, type, specs, location, notes } = req.body;

        // 1. Валидация обязательных полей
        if (!name || !owner) {
            return res.status(400).json({ message: "Device name and owner are required fields." });
        }

        // 2. Автоматическая генерация ID в формате DEV-001, DEV-002 и т.д.
        const count = await prisma.device.count();
        const nextNumber = count + 1;
        // Паддинг до 3 символов (1 -> "001", 12 -> "012", 284 -> "284")
        const generatedId = `DEV-${String(nextNumber).padStart(3, '0')}`;

        // 3. Создание записи в базе
        const newDevice = await prisma.device.create({
            data: {
                id: generatedId, // Передаем сгенерированный ID в базу
                name,
                owner,
                status: status || "Active",
                type,
                // Безопасно вытаскиваем процессоры и память из объекта specs
                cpu: specs && typeof specs === 'object' ? specs.cpu || null : null,
                ram: specs && typeof specs === 'object' ? specs.ram || null : null,
                // Если location пустой, пишем дефолтную строку, так как в схеме поле обязательное!
                location: location && location.trim() ? location : "Office A",
                notes: notes || null,
            },
        });

        return res.status(201).json(newDevice);
    } catch (error: any) {
        // Обязательно смотрим лог в терминале бэкенда, если что-то пойдет не так
        console.error("❌ Detailed Prisma error:", error);
        return res.status(500).json({
            message: "Server error while adding device.",
            error: error.message
        });
    }
});

app.listen(5000, () => {
    console.log('🚀 HelpDesk Pro backend successfully running on http://localhost:5000');
});