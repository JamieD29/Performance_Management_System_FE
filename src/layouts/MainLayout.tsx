import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';

import Header from '../components/layout/Header';
import Sidebar, { DRAWER_WIDTH, COLLAPSED_DRAWER_WIDTH } from '../components/layout/Sidebar';
import NotificationToast from '../components/common/NotificationToast';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleToggleMobile = () => setMobileOpen(!mobileOpen);
  const handleToggleCollapse = () => setCollapsed(!collapsed);

  const currentWidth = collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

  let user: any = {};
  try {
    const userStr = sessionStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : {};
  } catch (e) {
    user = {};
  }

  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#f1f5f9',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <CssBaseline />

      <Header
        onToggleSidebar={handleToggleMobile}
        user={user}
        sidebarWidth={currentWidth}
      />

      <Sidebar
        mobileOpen={mobileOpen}
        onClose={handleToggleMobile}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100vh',
          transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar />
        <Outlet />
        <Box sx={{ pb: 5 }} />
      </Box>

      {/* Notification Toast — góc phải dưới */}
      <NotificationToast />
    </Box>
  );
}
