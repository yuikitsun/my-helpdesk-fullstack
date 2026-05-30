import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './features/auth/Login/Login'
import { Register } from './features/auth/Registation/Registration'
import { Toaster } from "sonner";
import { DashboardLayout } from './layout/DashboardLayout';
import { DashboardPage } from './features/devices/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Страница Devices (пока можно перенаправлять на тот же дашборд или сделать отдельную) */}
        <Route
          path="/devices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Временная заглушка для Tickets */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-xl font-bold">Страница тикетов (В разработке)</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Временная заглушка для Users */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-xl font-bold">Страница пользователей (В разработке)</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  )
}

export default App