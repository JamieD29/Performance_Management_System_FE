import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Tooltip, // Import thêm Tooltip cho đẹp
} from '@mui/material';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  HelpCircle,
  GraduationCap,
  User,
  Target,
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';

const drawerWidth = 280;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // State điều khiển menu
  const [openPersonal, setOpenPersonal] = useState(true);
  const [openDept, setOpenDept] = useState(true);

  // ==========================================
  // 👇 1. XỬ LÝ DỮ LIỆU USER & ROLE
  // ==========================================
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const rawRoles = user.roles || [];

  // Chuẩn hóa role
  const userRoles = Array.isArray(rawRoles)
    ? rawRoles.map((r: any) => (typeof r === 'string' ? r : r.slug || r.name))
    : [];

  // Xác định Manager
  const isManager =
    userRoles.includes('SUPER_ADMIN') ||
    userRoles.includes('SYSTEM_ADMIN') ||
    userRoles.includes('DEAN');

  // 🔥 LOGIC HIỂN THỊ TÊN BỘ MÔN
  // Nếu user có thuộc tính department -> Lấy tên. Nếu không -> "Bộ môn"
  // (Lưu ý: Backend login phải trả về relation department nhé)
  const departmentName = user.department?.name || 'Bộ môn';

  // ==========================================

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  // Style chung cho item
  const getItemStyles = (path: string) => ({
    borderRadius: 2,
    minHeight: 48,
    color: 'white',
    bgcolor: isActive(path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
    borderLeft: isActive(path) ? '4px solid #60a5fa' : '4px solid transparent',
  });

  const getIconStyles = (path: string) => ({
    color: isActive(path) ? '#60a5fa' : 'inherit',
    minWidth: 40,
  });

  // Nội dung bên trong Sidebar
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 1. HEADER */}
      <Toolbar
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 3,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <GraduationCap size={32} color="#1e3a8a" />
        </Box>
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'white' }}>
          VNU-HCMUS
        </Typography>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

      {/* 2. MENU LIST */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        <List component="nav">
          {/* Dashboard */}
          <ListItem disablePadding sx={{ display: 'block', mb: 1 }}>
            <ListItemButton
              onClick={() => handleNavigate('/')}
              sx={getItemStyles('/')}
            >
              <ListItemIcon sx={getIconStyles('/')}>
                <LayoutDashboard size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>

          {/* Cá nhân */}
          <ListItemButton
            onClick={() => setOpenPersonal(!openPersonal)}
            sx={{ borderRadius: 2, mb: 0.5, color: 'white' }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <User size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Cá nhân"
              primaryTypographyProps={{ fontWeight: 'bold' }}
            />
            {openPersonal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </ListItemButton>

          <Collapse in={openPersonal} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ ...getItemStyles('/profile'), pl: 4, mb: 1 }}
                onClick={() => handleNavigate('/profile')}
              >
                <ListItemIcon sx={getIconStyles('/profile')}>
                  <FileText size={18} />
                </ListItemIcon>
                <ListItemText primary="Hồ sơ của tôi" />
              </ListItemButton>
              <ListItemButton
                sx={{ ...getItemStyles('/my-okr'), pl: 4, mb: 1 }}
                onClick={() => handleNavigate('/my-okr')}
              >
                <ListItemIcon sx={getIconStyles('/my-okr')}>
                  <Target size={18} />
                </ListItemIcon>
                <ListItemText primary="OKR của tôi" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* 🔥 BỘ MÔN (Đã sửa tên động) */}
          <Tooltip title={departmentName} placement="right" arrow>
            <ListItemButton
              onClick={() => setOpenDept(!openDept)}
              sx={{ borderRadius: 2, mb: 0.5, color: 'white' }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Building2 size={20} />
              </ListItemIcon>
              <ListItemText
                primary={departmentName} // 👈 Tên bộ môn ở đây
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  noWrap: true, // Nếu tên dài quá thì hiện ...
                }}
              />
              {openDept ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </ListItemButton>
          </Tooltip>

          <Collapse in={openDept} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ ...getItemStyles('/departments/overview'), pl: 4, mb: 1 }}
                onClick={() => handleNavigate('/departments/overview')}
              >
                <ListItemIcon sx={getIconStyles('/departments/overview')}>
                  <LayoutDashboard size={18} />
                </ListItemIcon>
                <ListItemText primary="Tổng quan" />
              </ListItemButton>
              <ListItemButton
                sx={{ ...getItemStyles('/departments/okr'), pl: 4, mb: 1 }}
                onClick={() => handleNavigate('/departments/okr')}
              >
                <ListItemIcon sx={getIconStyles('/departments/okr')}>
                  <Target size={18} />
                </ListItemIcon>
                <ListItemText primary="OKR Bộ môn" />
              </ListItemButton>
              <ListItemButton
                sx={{ ...getItemStyles('/departments/kpi'), pl: 4, mb: 1 }}
                onClick={() => handleNavigate('/departments/kpi')}
              >
                <ListItemIcon sx={getIconStyles('/departments/kpi')}>
                  <BarChart3 size={18} />
                </ListItemIcon>
                <ListItemText primary="KPI Bộ môn" />
              </ListItemButton>

              {/* Chỉ hiện Nhân sự nếu là Manager */}
              {isManager && (
                <ListItemButton
                  sx={{ ...getItemStyles('/departments/users'), pl: 4, mb: 1 }}
                  onClick={() => handleNavigate('/departments/users')}
                >
                  <ListItemIcon sx={getIconStyles('/departments/users')}>
                    <Users size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Nhân sự" />
                </ListItemButton>
              )}
            </List>
          </Collapse>

          {/* Research & Docs */}
          <ListItem disablePadding sx={{ display: 'block', mb: 1, mt: 1 }}>
            <ListItemButton
              onClick={() => handleNavigate('/docs')}
              sx={getItemStyles('/docs')}
            >
              <ListItemIcon sx={getIconStyles('/docs')}>
                <BookOpen size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Research & Docs"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* 3. FOOTER */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        <ListItemButton sx={{ borderRadius: 2, color: 'white' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <HelpCircle size={20} />
          </ListItemIcon>
          <ListItemText primary="IT Support" />
        </ListItemButton>
      </Box>
    </Box>
  );

  const sidebarStyles = {
    bgcolor: '#1e3a8a',
    background: 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)',
    color: 'white',
    borderRight: 'none',
  };

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            ...sidebarStyles,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            ...sidebarStyles,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
