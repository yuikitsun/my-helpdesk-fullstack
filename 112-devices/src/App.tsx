import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './features/auth/Login/Login'
import { Register } from './features/auth/Registation/Registration'
import { Toaster } from "sonner";
import { DashboardLayout } from './layout/DashboardLayout';
import { DashboardPage } from './features/devices/DashboardPage';
import { PendingUsers } from './features/admin/PendingUsers/PendingUsers';

function getUserRole(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Новый компонент — пускает дальше только admin / super_admin
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const isAuthenticated = !!localStorage.getItem("token");
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (role !== 'super_admin' && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
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

        {/* Новая страница — только для admin / super_admin */}
        <Route
          path="/admin/pending-users"
          element={
            <RequireAdmin>
              <DashboardLayout>
                <PendingUsers />
              </DashboardLayout>
            </RequireAdmin>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  )
}

export default App