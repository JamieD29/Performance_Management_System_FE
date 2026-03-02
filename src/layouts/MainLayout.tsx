import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

const drawerWidth = 280;

export default function MainLayout() {
  const [openSidebar, setOpenSidebar] = useState(true);
  const handleToggleSidebar = () => setOpenSidebar(!openSidebar);

  let user: any = {};
  try {
    const userStr = sessionStorage.getItem('user');
    user = userStr ? JSON.parse(userStr) : {};
  } catch (e) {
    user = {};
  }

  return (
    // 🔥 SỬA 1: Root Box dùng height: '100vh' và overflow: 'hidden'
    // (Để khóa thanh cuộn của trình duyệt, chỉ cuộn nội dung bên trong thôi)
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#f1f5f9',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <CssBaseline />

      <Header onToggleSidebar={handleToggleSidebar} user={user} />

      <Sidebar mobileOpen={openSidebar} onClose={handleToggleSidebar} />

      {/* 🔥 SỬA 2: Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          width: '100%',
          marginLeft: openSidebar ? `0px` : `0px`,
          // Cho phép cuộn dọc (y) nếu nội dung dài, ẩn cuộn ngang (x)
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100vh', // Chiều cao full để scroll hoạt động
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar /> {/* Cái này để đẩy nội dung xuống dưới Header */}
        {/* Nội dung trang sẽ nằm ở đây và có thể scroll thoải mái */}
        <Outlet />
        {/* Hack nhẹ: Thêm chút padding bottom để scroll không bị sát đáy quá */}
        <Box sx={{ pb: 5 }} />
      </Box>
    </Box>
  );
}
