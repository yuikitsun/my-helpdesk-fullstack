import { Layers, CheckCircle2, Wrench, MonitorX } from "lucide-react";
import { IDevice } from "../../../types/device"; // Проверь путь к типам

interface DashboardStatsProps {
    devices: IDevice[];
    loading?: boolean;
}

export function DashboardStats({ devices, loading }: DashboardStatsProps) {
    const totalDevices = devices.length;
    const activeDevices = devices.filter(d => d.status === "Active").length;
    const maintenanceDevices = devices.filter(d => d.status === "In Maintenance").length;
    const offlineDevices = devices.filter(d => d.status === "Offline").length;

    const activePercentage = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 0;
    const maintenancePercentage = totalDevices > 0 ? Math.round((maintenanceDevices / totalDevices) * 100) : 0;

    const stats = [
        {
            title: "Total Devices",
            value: String(totalDevices),
            subtext: "Total registered assets",
            icon: Layers,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50",
        },
        {
            title: "Active Now",
            value: String(activeDevices),
            subtext: `${activePercentage}% online`,
            icon: CheckCircle2,
            iconColor: "text-green-600",
            iconBg: "bg-green-50",
        },
        {
            title: "In Maintenance",
            value: String(maintenanceDevices),
            subtext: `${maintenancePercentage}% of fleet`,
            icon: Wrench,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-50",
        },
        {
            title: "Offline Devices",
            value: String(offlineDevices),
            subtext: offlineDevices > 0 ? "Need attention" : "All clear",
            icon: MonitorX,
            iconColor: "text-red-600",
            iconBg: "bg-red-50",
            subtextColor: offlineDevices > 0 ? "text-red-500 font-medium" : "text-slate-400",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[135px]"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                        <div className={`p-2 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                            <stat.icon className={`size-4 ${stat.iconColor}`} />
                        </div>
                    </div>

                    <div>
                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-8 w-16 bg-slate-200 rounded-lg"></div>
                                <div className="h-3 w-24 bg-slate-100 rounded"></div>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-3xl font-semibold text-slate-900 tracking-tight mb-1">
                                    {stat.value}
                                </h3>
                                <p className={`text-xs ${stat.subtextColor || "text-slate-400"}`}>
                                    {stat.subtext}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}