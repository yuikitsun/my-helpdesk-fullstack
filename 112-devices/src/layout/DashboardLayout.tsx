import { useEffect, useState } from "react";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    // На мобиле (< 768px) сайдбар закрыт по умолчанию, на десктопе — открыт
    const [isSidebarOpen, setIsSidebarOpen] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 768 : true
    );

    // Если пользователь развернул окно/повернул телефон — подстраиваемся
    useEffect(() => {
        function handleResize() {
            setIsSidebarOpen(window.innerWidth >= 768);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex w-full min-h-screen bg-slate-50/50 overflow-x-hidden">
            <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Затемнение фона на мобиле, когда сайдбар открыт поверх контента */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
                <Header toggleSidebar={toggleSidebar} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}