import { useState, useEffect } from "react";
import { Plus } from "lucide-react"; // иконка плюса
import { DashboardStats } from "./components/DashboardStats";
import { AddDeviceModal } from "../../components/AddDeviceModal";
import { deviceService } from "../../services/deviceService"; // Проверь этот путь к сервису
import { IDevice } from "../../types/device"; // Путь к типам устройств
import { DevicesTable } from "./components/DevicesTable";

export function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [devices, setDevices] = useState<IDevice[]>([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <div className="space-y-6">
            <DashboardStats devices={devices} loading={loading} />

            {/* Верхняя панель таблицы */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">All Devices</h2>
                        <p className="text-xs text-slate-500">Track and manage your device inventory</p>
                    </div>

                    {/* Кнопка "+ Add Device" */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors w-full sm:w-auto"
                    >
                        <Plus className="size-4" />
                        <span>Add Device</span>
                    </button>
                </div>

                <div className="text-slate-400 text-sm">
                    {loading ? (
                        <p>Loading infrastructure assets...</p>
                    ) : devices.length === 0 ? (
                        <p>No devices found. Click "Add Device" to register one.</p>
                    ) : (
                        <DevicesTable devices={devices} loading={loading} onRefresh={fetchDevices} />
                    )}
                </div>
            </div>

            <AddDeviceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDeviceAdded={fetchDevices}
            />
        </div>
    );
}