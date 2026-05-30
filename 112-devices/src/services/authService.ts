import { User } from "../types/auth";

const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
    register: async (data: User) => {
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

    login: async (data: Pick<User, 'email' | 'password'>) => {
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
    }
};