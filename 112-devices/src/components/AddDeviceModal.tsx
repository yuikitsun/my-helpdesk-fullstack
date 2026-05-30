import { X } from "lucide-react";
import { useState } from "react";
import { deviceService, CreateDeviceInput } from "../services/deviceService"; // Проверь этот путь к сервису
import { alertService } from "../lib/alerts"; // Если у тебя есть централизованный сервис для алертов, если нет - можно юзать просто alert() или создать его

interface AddDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeviceAdded: () => void; // Меняем на коллбэк для обновления списка в родителе после успешной отправки
}

export function AddDeviceModal({ isOpen, onClose, onDeviceAdded }: AddDeviceModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        owner: "",
        status: "Active" as "Active" | "In Maintenance" | "Offline",
        type: "Laptop",
        cpu: "",
        ram: "",
        location: "",
        notes: "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Формируем объект для бэкенда
        const finalData: CreateDeviceInput = {
            name: formData.name,
            owner: formData.owner,
            status: formData.status,
            type: formData.type,
            location: formData.location,
            notes: formData.notes.trim() || undefined,
            specs: formData.cpu.trim() || formData.ram.trim() ? {
                cpu: formData.cpu.trim(),
                ram: formData.ram.trim()
            } : undefined
        };

        // 2. Сама функция отправки через try/catch
        try {
            const response = await deviceService.addDevice(finalData);

            // Если всё прошло успешно:
            alertService.success(`Device "${response.name}" successfully added!`);

            //onDeviceAdded(); // Триггерим обновление списка в главном дашборде
            onClose();       // Закрываем модалку

            // Сбрасываем форму
            setFormData({
                name: "",
                owner: "",
                status: "Active",
                type: "Laptop",
                cpu: "",
                ram: "",
                location: "",
                notes: "",
            });
        } catch (error: any) {
            // Если бэкенд вернул ошибку (например, нет токена или упала база)
            console.error("Error adding device:", error);
            alertService.error(`Error: ${error.message || "Failed to add device to server"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 animate-in fade-in duration-200">
            {/* Контейнер модалки */}
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">

                {/* Шапка */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Add new device</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Fill in the details to register a new device in the inventory.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

                    {/* Device Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Device name *</label>
                        <input
                            type="text"
                            required
                            disabled={loading}
                            placeholder="e.g. MacBook Pro 16"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-slate-50/50 disabled:opacity-60"
                        />
                    </div>

                    {/* Device Type & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Device type</label>
                            <select
                                value={formData.type}
                                disabled={loading}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white disabled:opacity-60"
                            >
                                <option value="Laptop">Laptop</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Server">Server</option>
                                <option value="Smartphone">Smartphone</option>
                                <option value="Tablet">Tablet</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Status</label>
                            <select
                                value={formData.status}
                                disabled={loading}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white disabled:opacity-60"
                            >
                                <option value="Active">Active</option>
                                <option value="In Maintenance">In Maintenance</option>
                                <option value="Offline">Offline</option>
                            </select>
                        </div>
                    </div>

                    {/* Assigned to (Owner) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Assigned to *</label>
                        <input
                            type="text"
                            required
                            disabled={loading}
                            placeholder="e.g. Sarah Chen"
                            value={formData.owner}
                            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-slate-50/50 disabled:opacity-60"
                        />
                    </div>

                    {/* Specs: CPU & RAM */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">CPU Specs</label>
                            <input
                                type="text"
                                disabled={loading}
                                placeholder="e.g. M2 Pro, Core i7"
                                value={formData.cpu}
                                onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-slate-50/50 disabled:opacity-60"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">RAM Specs</label>
                            <input
                                type="text"
                                disabled={loading}
                                placeholder="e.g. 16GB, 32GB"
                                value={formData.ram}
                                onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-slate-50/50 disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Location & Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Location</label>
                            <input
                                type="text"
                                disabled={loading}
                                placeholder="e.g. Office A, Remote"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-slate-50/50 disabled:opacity-60"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">Notes / OS</label>
                            <input
                                type="text"
                                disabled={loading}
                                placeholder="e.g. macOS 14.2"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-slate-400 bg-slate-50/50 disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Подвал с кнопками */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-slate-950 hover:bg-slate-900 rounded-lg shadow-sm transition-colors disabled:bg-slate-700 flex items-center justify-center gap-2"
                        >
                            {loading ? "Adding..." : "Add device"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}