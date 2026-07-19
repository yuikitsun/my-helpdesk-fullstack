import { useMemo, useState } from "react";
import { Search, Laptop, RefreshCw, Filter } from "lucide-react";
import { DeviceQRCode } from "./DeviceQRCode";
import { IDevice } from "../../types/device";

interface DevicesTableProps {
    devices: IDevice[];
    loading?: boolean;
    onRefresh?: () => void;
}

const statusStyles: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700",
    "In Maintenance": "bg-amber-50 text-amber-700",
    Offline: "bg-red-50 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
    const style = statusStyles[status] || "bg-slate-100 text-slate-600";
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}

export function DevicesTable({ devices, loading, onRefresh }: DevicesTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [typeFilter, setTypeFilter] = useState("All Types");

    const uniqueTypes = useMemo(() => {
        const types = new Set(devices.map(d => d.type).filter(Boolean));
        return Array.from(types);
    }, [devices]);

    const filteredDevices = useMemo(() => {
        return devices.filter(d => {
            const q = search.toLowerCase();
            const matchesSearch =
                !q ||
                d.name?.toLowerCase().includes(q) ||
                d.owner?.toLowerCase().includes(q) ||
                d.location?.toLowerCase().includes(q);

            const matchesStatus = statusFilter === "All Status" || d.status === statusFilter;
            const matchesType = typeFilter === "All Types" || d.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [devices, search, statusFilter, typeFilter]);

    return (
        <div className="bg-white border border-slate-200 rounded-xl">
            {/* Верхняя панель: заголовок + refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-bold text-slate-900">All Devices</h2>
                    <p className="text-xs text-slate-500">Track and manage your device inventory</p>
                </div>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto"
                    >
                        <RefreshCw className="size-4" />
                        Refresh
                    </button>
                )}
            </div>

            {/* Поиск и фильтры */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 pb-0 sm:pb-0">
                <div className="relative flex-1">
                    <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search devices, users, or locations..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400"
                >
                    <option>All Status</option>
                    <option value="Active">Active</option>
                    <option value="In Maintenance">In Maintenance</option>
                    <option value="Offline">Offline</option>
                </select>
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-400"
                >
                    <option>All Types</option>
                    {uniqueTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Таблица */}
            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="py-12 text-center text-sm text-slate-400">Loading devices...</div>
                ) : filteredDevices.length === 0 ? (
                    <div className="py-12 text-center text-sm text-slate-400">
                        {devices.length === 0
                            ? 'No devices found. Click "Add Device" to register one.'
                            : "No devices match your search or filters."}
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-sm min-w-[640px]">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                                    <th className="font-medium py-2 px-4 sm:px-0">Device</th>
                                    <th className="font-medium py-2 px-2">Assigned To</th>
                                    <th className="font-medium py-2 px-2">Status</th>
                                    <th className="font-medium py-2 px-2">Location</th>
                                    <th className="font-medium py-2 px-2">QR Code</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredDevices.map(device => (
                                    <tr key={device.id} className="hover:bg-slate-50/50">
                                        <td className="py-3 px-4 sm:px-0">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <Laptop className="size-4 text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 truncate">{device.name}</p>
                                                    <p className="text-xs text-slate-400">
                                                        {device.id} · {device.type}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-slate-700">{device.owner || "Not Assigned"}</td>
                                        <td className="py-3 px-2">
                                            <StatusBadge status={device.status} />
                                        </td>
                                        <td className="py-3 px-2 text-slate-500">{device.location || "—"}</td>
                                        <td className="py-3 px-2">
                                            <DeviceQRCode device={device} size={48} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}