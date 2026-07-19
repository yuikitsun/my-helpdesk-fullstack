import { RegisterPayload, User } from "../types/auth";

const API_URL = 'http://localhost:5000/api/auth';
const BASE_API_URL = 'http://localhost:5000/api'; // Базовый URL для остальных эндпоинтов

export const authService = {
    register: async (data: RegisterPayload) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Registration failed');
        }

        return result;
    },

    // Use explicit type for login payload to avoid TypeScript errors if User doesn't include 'password'
    login: async (data: { email: string; password: string }) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Invalid email or password');
        }

        // Если вход успешный и бэк прислал токен — сохраняем его в localStorage
        if (result.token) {
            localStorage.setItem("token", result.token);
        }

        return result;
    },

    // Метод для удобного логаута (очистки токена)
    logout: () => {
        localStorage.removeItem("token");
    },

    // --- НОВЫЙ МЕТОД ДЛЯ ПОЛУЧЕНИЯ СПИСКА ПОЛЬЗОВАТЕЛЕЙ ---
    getUsers: async () => {
        // Достаем сохраненный токен
        const token = localStorage.getItem("token");

        const response = await fetch(`${BASE_API_URL}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Передаем токен в заголовке Authorization, чтобы пройти проверку checkAuth на бэке
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch users');
        }

        return result; // Возвращает массив пользователей [{ id, name, email }, ...]
    },
    // --- ПОЛУЧИТЬ СПИСОК ЗАЯВОК НА РЕГИСТРАЦИЮ (pending) ---
    getPendingUsers: async () => {
        const token = localStorage.getItem("token");

        const response = await fetch(`${BASE_API_URL}/admin/pending-users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to fetch pending users');
        }

        return result;
    },

    // --- ОДОБРИТЬ ПОЛЬЗОВАТЕЛЯ ---
    approveUser: async (id: number) => {
        const token = localStorage.getItem("token");

        const response = await fetch(`${BASE_API_URL}/admin/approve/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to approve user');
        }

        return result;
    },

    // --- ОТКЛОНИТЬ ПОЛЬЗОВАТЕЛЯ ---
    rejectUser: async (id: number) => {
        const token = localStorage.getItem("token");

        const response = await fetch(`${BASE_API_URL}/admin/reject/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to reject user');
        }

        return result;
    }
};
