import { Server, Laptop, Bell, Smartphone, LogOut } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";

// Теперь у каждого элемента ЕСТЬ чёткий path и нормальная иконка-компонент
const navItems = [
    { label: "Dashboard", icon: Server, path: "/dashboard" },
    { label: "Devices", icon: Laptop, path: "/devices" },
    { label: "Tickets", icon: Bell, path: "/tickets" },
    { label: "Users", icon: Smartphone, path: "/users" },
];

interface AppSidebarProps {
    isOpen: boolean;
}

export function AppSidebar({ isOpen }: AppSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <aside
            className={`border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${isOpen ? "w-64" : "w-0 border-r-0"
                }`}
        >
            <div className="w-64 flex flex-col h-full">
                {/* Логотип */}
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                    <div className="rounded-lg bg-blue-600 p-2 flex items-center justify-center text-white">
                        <Server className="size-5" />
                    </div>
                    <div>
                        <h2 className=" text-slate-950 text-l leading-none mb-1">HelpDesk Pro</h2>
                        <p className="text-xs text-slate-500 font-medium">IT Management</p>
                    </div>
                </div>

                {/* Навигация — теперь чистая, без лишних проверок типов */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={index}
                                to={item.path} // Теперь TS уверен, что тут строка, и не ругается!
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <item.icon className={`size-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Логаут */}
                <div className="p-4 border-t border-slate-100 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                    >
                        <LogOut className="size-4 text-red-500" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}