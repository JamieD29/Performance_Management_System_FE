import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
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
const UserDetailPage = React.lazy(() => import('../pages/UserDetail/UserDetailPage'));

// Non-lazy (always needed for layout)
import MainLayout from '../layouts/MainLayout';

// 1. Authentication check hook
function useAuth() {
  const authToken = localStorage.getItem('authToken');
  return !!authToken;
}

// 2. Route guard component for Admin
function AdminRoute({ children }: { children: React.ReactNode }) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const rawRoles = user.roles || [];

  // Normalize role flexibly (Object/String) and make it case-insensitive
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

// 2b. Route guard component for managers (Admin OR has a management position)
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


// 3. Route guard component for regular protected routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth();
  const location = useLocation();
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;

  // Check if profile is completed
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Completion check logic: profile marked completed OR has enough core information
  const isProfileComplete = !!(
    user?.profileCompleted ||
    (user?.jobTitle && (user?.department?.id || user?.departmentID))
  );

  // Only redirect if user profile is incomplete and NOT currently on profile-setup page
  if (user && !isProfileComplete && location.pathname !== '/profile-setup') {
    console.log('📋 Profile Incomplete -> Redirecting to Setup');
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
}

// 4. Public Route guard component
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuth();
  const [searchParams] = useSearchParams();

  // 🔑 If URL contains a new accessToken (from OAuth callback), DO NOT redirect.
  // Allow Login.tsx to handle it and overwrite the old token/user in localStorage.
  // This happens when the user goes back to the account selection page and selects a different account.
  const hasNewToken = !!searchParams.get('accessToken');

  if (isAuthenticated && !hasNewToken) return <Navigate to="/dashboard" replace />;
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
      {/* --- AUXILIARY ROUTES --- */}
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
      {/* --- MAIN LAYOUT GROUP (Authenticated) --- */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* 1. Main Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 2. Personal Profile */}
        <Route path="/profile" element={<ProfileSetting />} />
        <Route path="/my-okr" element={<MyOkrPage />} />
        <Route path="/my-evaluation" element={<MyEvaluationPage />} />

        {/* 3. DEPARTMENT GROUP (Only for Admin or Manager) */}
        {/* Overview */}
        <Route path="/dean-dashboard" element={<ManagerRoute><DeanDashboard /></ManagerRoute>} />
        <Route path="/departments/overview" element={<ManagerRoute><DepartmentOverview /></ManagerRoute>} />
        {/* Department OKR */}
        <Route path="/departments/okr" element={<ManagerRoute><DepartmentOKR /></ManagerRoute>} />

        {/* 🔥 "PERSONNEL" - INTEGRATED WITH OLD DEPARTMENT COMPONENT HERE */}
        <Route path="/departments/users" element={<ManagerRoute><Department /></ManagerRoute>} />
        <Route path="/departments/users/:userId" element={<ManagerRoute><UserDetailPage /></ManagerRoute>} />

        {/* 4. ADMIN PAGE (Dual layer protection) */}
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

        {/* Legacy Route (Retained for compatibility if needed, or delete) */}
        <Route path="/admin/department" element={<Department />} />
      </Route>
      {/* --- CATCH ALL --- */}
      {/* ✅ Route for navigate('/404') case */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />{' '}
    </Routes>
    </Suspense>
  );
}
