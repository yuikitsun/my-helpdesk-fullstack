import { IDevice } from "../types/device"; // Исправили циклический импорт!

const API_URL = "http://localhost:5000/api"; // Твой URL бэкенда

// Хелпер для получения заголовков с токеном авторизации
const getAuthHeaders = () => {
    const token = localStorage.getItem("token"); // Ну или где ты хранишь JWT токен после логина
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
};

export type CreateDeviceInput = Omit<IDevice, "id">;

export const deviceService = {
    // 1. Получить все устройства
    async getDevices(): Promise<IDevice[]> {
        const response = await fetch(`${API_URL}/devices`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to fetch devices");
        }

        return response.json();
    },

    // 2. Добавить новое устройство (Дописываем этот метод!)
    async addDevice(deviceData: CreateDeviceInput): Promise<IDevice> {
        const response = await fetch(`${API_URL}/devices`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(deviceData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to add device");
        }

        return response.json();
    }
};