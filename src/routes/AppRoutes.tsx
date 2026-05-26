import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Lazy-loaded pages (code splitting — load on demand)
const Login = React.lazy(() => import('../pages/Auth/Login'));
const Dashboard = React.lazy(() => import('../pages/Dashboard/Dashboard'));
const AdminSettings = React.lazy(() => import('../pages/Admin/AdminSetting'));
const Department = React.lazy(() => import('../pages/Department/Department'));
const DepartmentOKR = React.lazy(
  () => import('../pages/DepartmentOKR/departmentOKR'),
);
const AuthCallback = React.lazy(() => import('../pages/Auth/AuthCallback'));
const NotFoundPage = React.lazy(
  () => import('../pages/ErrorPage/NotFoundPage'),
);
const ProfileSetting = React.lazy(
  () => import('../pages/ProfileSetting/ProfileSettingPage'),
);
const ProfileSetup = React.lazy(
  () => import('../pages/ProfileSetup/ProfileSetup'),
);
const DepartmentOverview = React.lazy(
  () => import('../pages/DepartmentOverview/DepartmentOverview'),
);
const MyOkrPage = React.lazy(() => import('../pages/MyOkr/MyOkrPage'));
const MyEvaluationPage = React.lazy(() => import('../pages/MyEvaluation/MyEvaluationPage'));
const DeanDashboard = React.lazy(() => import('../pages/DeanDashboard/DeanDashboard'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard/AdminDashboard'));

// Non-lazy (always needed for layout)
import MainLayout from '../layouts/MainLayout';

// 1. Hook check đăng nhập
function useAuth() {
  const authToken = localStorage.getItem('authToken');
  return !!authToken;
}

// 2. Component bảo vệ Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const rawRoles = user.roles || [];

  // Chuẩn hóa role linh hoạt (Object/String) và không phân biệt hoa thường
  const isAdmin =
    Array.isArray(rawRoles) &&
    rawRoles.some((r: any) => {
      const val = typeof r === 'string' ? r : r.slug || r.name || '';
      return val.toString().toUpperCase() === 'ADMIN';
    });

  if (!isAdmin) {
    console.warn('⛔ Access Denied: Not an Admin -> Redirecting to Dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// 2b. Component bảo vệ route quản lý (Admin HOẶC có chức vụ quản lý)
function ManagerRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const rawRoles = user.roles || [];

  const isAdmin =
    Array.isArray(rawRoles) &&
    rawRoles.some((r: any) => {
      const val = typeof r === 'string' ? r : r.slug || r.name || '';
      return val.toString().toUpperCase() === 'ADMIN';
    });

  const hasManagementPosition = !!user?.managementPosition;

  if (!isAdmin && !hasManagementPosition) {
    console.warn('⛔ Access Denied: No management position -> Redirecting to Dashboard');
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

  // Kiểm tra profile đã hoàn tất chưa
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Logic kiểm tra hoàn tất: hồ sơ đã đánh dấu xong HOẶC có đủ các thông tin cốt lõi
  const isProfileComplete = !!(
    user?.profileCompleted ||
    (user?.jobTitle && (user?.department?.id || user?.departmentID))
  );

  // Chỉ redirect nếu user chưa xong profile và ĐANG KHÔNG ở trang profile-setup
  if (user && !isProfileComplete && location.pathname !== '/profile-setup') {
    console.log('📋 Profile Incomplete -> Redirecting to Setup');
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

// Loading fallback for lazy-loaded pages
function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/my-okr" element={<MyOkrPage />} />
        <Route path="/my-evaluation" element={<MyEvaluationPage />} />

        {/* 3. GROUP BỘ MÔN (Chỉ cho Admin hoặc User có chức vụ quản lý) */}
        {/* Tổng quan */}
        {/* Dashboard Quản lý (Trưởng khoa) */}
        <Route path="/dean-dashboard" element={<ManagerRoute><DeanDashboard /></ManagerRoute>} />
        <Route path="/departments/overview" element={<ManagerRoute><DepartmentOverview /></ManagerRoute>} />
        {/* OKR Bộ môn */}
        <Route path="/departments/okr" element={<ManagerRoute><DepartmentOKR /></ManagerRoute>} />

        {/* 🔥 "NHÂN SỰ" - KẾT NỐI VÀO COMPONENT DEPARTMENT CŨ TẠI ĐÂY */}
        <Route path="/departments/users" element={<ManagerRoute><Department /></ManagerRoute>} />

        {/* 4. TRANG ADMIN (Bảo vệ 2 lớp) */}
        <Route
          path="/admin/settings"
          element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          }
        />

        {/* 4b. ADMIN DASHBOARD */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
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
    </Suspense>
  );
}
