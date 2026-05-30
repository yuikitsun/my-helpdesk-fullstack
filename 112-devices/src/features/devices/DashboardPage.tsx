import { useState, useEffect } from "react";
import { Plus } from "lucide-react"; // иконка плюса
import { DashboardStats } from "./components/DashboardStats";
import { AddDeviceModal } from "../../components/AddDeviceModal";
import { deviceService } from "../../services/deviceService"; // Проверь этот путь к сервису
import { IDevice } from "../../types/device"; // Путь к типам устройств

export function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [devices, setDevices] = useState<IDevice[]>([]);
    const [loading, setLoading] = useState(true);

    // Функция загрузки данных с бэкенда
    const fetchDevices = async () => {
        try {
            setLoading(true);
            const data = await deviceService.getDevices();
            setDevices(data);
        } catch (error: any) {
            console.error("Failed to load devices:", error);
        } finally {
            setLoading(false);
        }
    };

    // Загружаем устройства при первом рендере страницы
    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <div className="space-y-6">
            {/* 1. Передаем реальные данные и состояние загрузки в карточки статистики */}
            <DashboardStats devices={devices} loading={loading} />

            {/* Верхняя панель таблицы */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">All Devices</h2>
                        <p className="text-xs text-slate-500">Track and manage your device inventory</p>
                    </div>

                    {/* Кнопка "+ Add Device" */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                        <Plus className="size-4" />
                        <span>Add Device</span>
                    </button>
                </div>

                {/* 2. Твоя таблица (не забудь передать в компонент таблицы devices={devices} и loading={loading}) */}
                {/* Например: <DevicesTable devices={devices} loading={loading} /> */}
                <div className="text-slate-400 text-sm">
                    {loading ? (
                        <p>Loading infrastructure assets...</p>
                    ) : devices.length === 0 ? (
                        <p>No devices found. Click "Add Device" to register one.</p>
                    ) : (
                        <p>Loaded {devices.length} devices from Neon DB.</p>
                    )}
                </div>
            </div>

            {/* 3. Модалка добавления девайса */}
            <AddDeviceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeviceAdded={fetchDevices} // Передаем функцию обновления списка вместо старого onAdd
            />
        </div>
    );
}