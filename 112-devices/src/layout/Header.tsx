import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getInitials } from "../lib/utils"; // Проверь путь до твоего utils.ts

interface HeaderProps {
    toggleSidebar: () => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": { title: "Device Inventory", subtitle: "Manage and monitor all IT assets" },
    "/tickets": { title: "Tickets", subtitle: "Track and resolve support requests" },
    "/users": { title: "Users", subtitle: "Manage user accounts and access" },
    "/admin/pending-users": { title: "Pending Users", subtitle: "Review and approve employee registration requests" },
};

export function Header({ toggleSidebar }: HeaderProps) {
    const location = useLocation();
    const { title, subtitle } = pageTitles[location.pathname] || {
        title: "Device Inventory",
        subtitle: "Manage and monitor all IT assets",
    };

    // Достаем имя, сохраненное при логине, или берем дефолтное
    const userFullName = localStorage.getItem("userFullName") || "Admin";
    const initials = getInitials(userFullName);

    return (
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5 bg-white">
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-l text-slate-950 tracking-tight leading-tight">{title}</h1>
                    <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
                </div>
            </div>

            {/* Правая часть: Поиск, Уведомления, Чистый Аватар с новыми инициалами */}
            <div className="flex items-center gap-2">
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                    <Search className="size-5" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
                    <Bell className="size-5" />
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full" />
                </button>

                <div className="h-5 w-px bg-slate-200 mx-2" />

                {/* Выводим сгенерированные инициалы */}
                <div
                    className="flex items-center justify-center size-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-sm select-none"
                    title={userFullName}
                >
                    {initials}
                </div>
            </div>
        </header>
    );
}