import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Pages
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import AdminSettings from '../pages/Admin/AdminSetting';
import Department from '../pages/Department/Department';
import DepartmentOKR from '../pages/DepartmentOKR/departmentOKR';
import AuthCallback from '../pages/Auth/AuthCallback';
import PerformancePage from '../pages/Performance/PerformancePage';
import ProfileSetup from '../pages/ProfileSetup/ProfileSetup';
import DepartmentReviewPage from '../pages/Performance/DepartmentReviewPage';

// Import Layouts
import MainLayout from '../layouts/MainLayout';
import DepartmentOverview from '../pages/DepartmentOverview/DepartmentOverview';
import NotFoundPage from '../pages/ErrorPage/NotFoundPage';
import ProfileSetting from '../pages/ProfileSetting/ProfileSettingPage';

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

  // Kiểm tra profile đã hoàn tất chưa → redirect nếu chưa
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isProfileComplete =
    user?.profileCompleted || (user?.jobTitle && user?.department?.id);
  if (user && !isProfileComplete && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

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
      {/* --- PROFILE SETUP (Protected, no layout) --- */}
      <Route
        path="/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
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
        <Route path="/profile" element={<ProfileSetting />} />
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
        <Route path="/departments/kpi" element={<DepartmentReviewPage />} />
        <Route path="/performance/evaluate" element={<PerformancePage />} />
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
      {/* ✅ Route dành cho trường hợp navigate('/404') */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />{' '}
    </Routes>
  );
}
