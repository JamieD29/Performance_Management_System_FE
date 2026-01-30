import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminSettings from '../pages/AdminSetting';
import ProfileSettings from '../pages/ProfileSetting';
import Department from '../Department/Department'; // 👈 Component này sẽ dùng cho mục "Nhân sự"
import DepartmentOKR from '../pages/DepartmentOKR';
import AuthCallback from '../pages/AuthCallback';
import AcceptInvitation from '../components/AcceptInvitation';

// Import Layouts
import MainLayout from '../layouts/MainLayout';
import DepartmentOverview from '../pages/DepartmentOverview';

// 1. Hook check đăng nhập
function useAuth() {
  const authToken = sessionStorage.getItem('authToken');
  return !!authToken;
}

// 2. Component bảo vệ Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const roles = user.roles || [];

  console.log('👮 AdminRoute Check:', { roles });

  const isAdmin =
    roles.includes('SYSTEM_ADMIN') ||
    roles.includes('admin') ||
    roles.includes('SUPER_ADMIN');

  if (!isAdmin) {
    console.warn('⛔ Access Denied: Not an Admin -> Redirecting to Dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// 3. Component bảo vệ Route thường
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth();
  const location = useLocation();
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

// 4. Component Route công khai
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* --- CÁC ROUTE PHỤ --- */}
      <Route path="/auth/microsoft/callback" element={<AuthCallback />} />
      <Route path="/invite/accept/:token" element={<AcceptInvitation />} />

      {/* --- ROOT REDIRECT --- */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* --- LOGIN --- */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* --- MAIN LAYOUT GROUP (Đã đăng nhập) --- */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* 1. Dashboard Chính */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 2. Hồ sơ cá nhân */}
        <Route path="/profile" element={<ProfileSettings />} />
        <Route
          path="/my-okr"
          element={<div>Trang OKR cá nhân (Coming Soon)</div>}
        />

        {/* 3. GROUP BỘ MÔN (Theo Sidebar mới) */}
        {/* Tổng quan */}
        <Route path="/departments/overview" element={<DepartmentOverview />} />
        {/* OKR Bộ môn */}
        <Route path="/departments/okr" element={<DepartmentOKR />} />
        {/* KPI Bộ môn */}
        <Route
          path="/departments/kpi"
          element={<div>Trang KPI Bộ môn (Coming Soon)</div>}
        />

        {/* 🔥 "NHÂN SỰ" - KẾT NỐI VÀO COMPONENT DEPARTMENT CŨ TẠI ĐÂY */}
        <Route path="/departments/users" element={<Department />} />

        {/* 4. TRANG ADMIN (Bảo vệ 2 lớp) */}
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />

        {/* Route cũ (Giữ lại để tương thích nếu cần, hoặc xóa đi) */}
        <Route path="/admin/department" element={<Department />} />
      </Route>

      {/* --- CATCH ALL --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
