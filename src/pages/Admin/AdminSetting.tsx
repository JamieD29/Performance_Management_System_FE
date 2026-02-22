import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  Divider,
  Paper,
  ListItemButton,
  ListItemIcon,
  Container,
  ListItemText,
} from '@mui/material';
import {
  Dns,
  People,
  History,
  AdminPanelSettings,
  ArrowBack,
  CalendarToday,
} from '@mui/icons-material';

// 1. SỬA ĐƯỜNG DẪN: Lùi 2 cấp (Admin -> pages -> src/types)
import type { User } from '../../types';

// 2. SỬA ĐƯỜNG DẪN: Lùi 1 cấp ra pages, rồi vào Performance
import CycleManagement from '../Performance/components/CycleManagement';

// 3. SỬA ĐƯỜNG DẪN: Vì AdminSetting giờ đang ở CÙNG THƯ MỤC CHA với components
import WhitelistManager from './components/WhitelistManager';
import UserRoleManager from './components/UserRoleManager';
import SystemLogs from './components/SystemLogs';

export default function AdminSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cycles');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userInfo = sessionStorage.getItem('user');
    if (userInfo) {
      const user: User = JSON.parse(userInfo);
      const rawRoles = Array.isArray(user.roles) ? user.roles : [];
      const normalizedRoles = rawRoles.map((r: any) =>
        (typeof r === 'string' ? r : r?.slug || r?.name || '').toString(),
      );

      const checkSuper = normalizedRoles.includes('SUPER_ADMIN');
      const checkAccess = normalizedRoles.some((r: string) =>
        ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'admin'].includes(r),
      );

      if (!checkAccess) {
        navigate('/dashboard');
        return;
      }
      setIsAdmin(true);
      setIsSuperAdmin(checkSuper);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!isAdmin) return null;

  const menuItems = [
    {
      id: 'cycles',
      label: 'Evaluation Cycles',
      icon: <CalendarToday />,
      restricted: false,
    },
    {
      id: 'whitelist',
      label: 'Whitelist Domain',
      icon: <Dns />,
      restricted: false,
    },
    { id: 'users', label: 'User Roles', icon: <People />, restricted: true },
    { id: 'logs', label: 'System Logs', icon: <History />, restricted: true },
  ];

  const availableMenuItems = menuItems.filter(
    (item) => !item.restricted || isSuperAdmin,
  );
  const shouldShowSidebar = isSuperAdmin || availableMenuItems.length > 1;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        minHeight: '85vh',
        bgcolor: '#f8fafc',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* SIDEBAR */}
      {shouldShowSidebar && (
        <Paper
          elevation={0}
          sx={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid #e2e8f0',
            bgcolor: '#fff',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}
            >
              <AdminPanelSettings color="primary" />
              <Typography variant="subtitle1" fontWeight="bold" color="#1e3a8a">
                Admin Portal
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              System Configuration
            </Typography>
          </Box>
          <Divider />

          <List sx={{ p: 2, flexGrow: 1 }}>
            <ListItemButton
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 2, borderRadius: 2, bgcolor: '#f1f5f9' }}
            >
              <ListItemIcon>
                <ArrowBack fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Back Dashboard"
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>

            <Typography
              variant="overline"
              sx={{ px: 1, color: 'text.secondary', fontWeight: 'bold' }}
            >
              Modules
            </Typography>

            {availableMenuItems.map((item) => (
              <ListItemButton
                key={item.id}
                selected={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: '#eff6ff',
                    color: '#1e3a8a',
                    '& .MuiListItemIcon-root': { color: '#1e3a8a' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      {/* CONTENT AREA */}
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: '#fff', overflow: 'auto' }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
            <Typography variant="h5" fontWeight="bold" color="#1e293b">
              {menuItems.find((i) => i.id === activeTab)?.label}
            </Typography>
          </Box>

          {/* RENDER COMPONENT TƯƠNG ỨNG TỪ CÁC FILE ĐÃ TÁCH */}
          {activeTab === 'cycles' && <CycleManagement />}
          {activeTab === 'whitelist' && <WhitelistManager />}
          {activeTab === 'users' && <UserRoleManager />}
          {activeTab === 'logs' && <SystemLogs />}
        </Container>
      </Box>
    </Box>
  );
}
