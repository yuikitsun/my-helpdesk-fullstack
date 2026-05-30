import { useState } from "react";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    // Стейт открыт/закрыт сайдбар
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex w-full min-h-screen bg-slate-50/50 overflow-x-hidden">
            {/* Сайдбар принимает состояние видимости */}
            <AppSidebar isOpen={isSidebarOpen} />

            {/* Контентная часть плавно занимает всё место при закрытии сайдбара */}
            <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
                {/* Хедер принимает функцию клика по иконке */}
                <Header toggleSidebar={toggleSidebar} />

                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}