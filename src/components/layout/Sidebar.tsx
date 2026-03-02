import { useState } from 'react';
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
  Tooltip,
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
  ClipboardCheck,
} from 'lucide-react';

const drawerWidth = 280;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openPersonal, setOpenPersonal] = useState(true);
  const [openDept, setOpenDept] = useState(true);

  // ==========================================
  // 1. XỬ LÝ DỮ LIỆU USER & ROLE
  // ==========================================
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const rawRoles = user.roles || [];

  const userRoles = Array.isArray(rawRoles)
    ? rawRoles.map((r: any) => {
      const val = typeof r === 'string' ? r : r.slug || r.name || '';
      return val.toString().toUpperCase();
    })
    : [];

  const isManager =
    userRoles.includes('SUPER_ADMIN') ||
    userRoles.includes('SYSTEM_ADMIN') ||
    userRoles.includes('DEAN');

  const departmentName = user.department?.name || 'Bộ môn';

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  // ==========================================
  // 2. STYLING — Sáng, nhẹ nhàng, thân thiện
  // ==========================================

  // Tab item styles - active rõ ràng, hover mượt
  const getItemStyles = (path: string) => ({
    borderRadius: '12px',
    minHeight: 44,
    mb: 0.5,
    mx: 0.5,
    color: isActive(path) ? '#1565c0' : '#475569',
    bgcolor: isActive(path) ? '#e3f2fd' : 'transparent',
    fontWeight: isActive(path) ? 600 : 400,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    '&:hover': {
      bgcolor: isActive(path) ? '#e3f2fd' : '#f1f5f9',
      color: '#1565c0',
      transform: 'translateX(4px)',
      '& .MuiListItemIcon-root': {
        color: '#1565c0',
      },
    },
    '&::before': isActive(path)
      ? {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: '4px',
        borderRadius: '0 4px 4px 0',
        bgcolor: '#1976d2',
      }
      : {},
  });

  const getIconStyles = (path: string) => ({
    color: isActive(path) ? '#1976d2' : '#94a3b8',
    minWidth: 38,
    transition: 'color 0.25s ease',
  });

  // Group header styles
  const groupHeaderStyles = {
    borderRadius: '12px',
    mb: 0.5,
    mx: 0.5,
    color: '#334155',
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: '#f8fafc',
    },
  };

  const sidebarStyles = {
    bgcolor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#ffffff' }}>
      {/* HEADER — Logo trường */}
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
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
            boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)',
          }}
        >
          <GraduationCap size={30} color="#ffffff" />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: '#1e3a5f',
            letterSpacing: '-0.01em',
          }}
        >
          VNU-HCMUS
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.3 }}
        >
          Performance Management
        </Typography>
      </Toolbar>

      <Divider sx={{ mx: 2, borderColor: '#e2e8f0' }} />

      {/* MENU LIST */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 1.5,
          pt: 2,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: 2,
          },
        }}
      >
        <List component="nav" sx={{ px: 0 }}>
          {/* Dashboard */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => handleNavigate('/dashboard')}
              sx={getItemStyles('/dashboard')}
            >
              <ListItemIcon sx={getIconStyles('/dashboard')}>
                <LayoutDashboard size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  fontWeight: isActive('/dashboard') ? 600 : 500,
                  fontSize: '0.9rem',
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* NHÓM CÁ NHÂN */}
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              px: 2,
              pt: 2,
              pb: 0.5,
              color: '#94a3b8',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            Cá nhân
          </Typography>

          <ListItemButton
            onClick={() => setOpenPersonal(!openPersonal)}
            sx={groupHeaderStyles}
          >
            <ListItemIcon sx={{ color: '#64748b', minWidth: 38 }}>
              <User size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Quản lý cá nhân"
              primaryTypographyProps={{
                fontWeight: 600,
                fontSize: '0.88rem',
                color: '#334155',
              }}
            />
            {openPersonal ? (
              <ChevronUp size={16} color="#94a3b8" />
            ) : (
              <ChevronDown size={16} color="#94a3b8" />
            )}
          </ListItemButton>

          <Collapse in={openPersonal} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ ...getItemStyles('/profile'), pl: 4 }}
                onClick={() => handleNavigate('/profile')}
              >
                <ListItemIcon sx={getIconStyles('/profile')}>
                  <FileText size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="Hồ sơ của tôi"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>

              <ListItemButton
                sx={{ ...getItemStyles('/performance/evaluate'), pl: 4 }}
                onClick={() => handleNavigate('/performance/evaluate')}
              >
                <ListItemIcon sx={getIconStyles('/performance/evaluate')}>
                  <ClipboardCheck size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="OKR Của tôi"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>
            </List>
          </Collapse>

          {/* NHÓM BỘ MÔN */}
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              px: 2,
              pt: 2,
              pb: 0.5,
              color: '#94a3b8',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            Bộ môn
          </Typography>

          <Tooltip title={departmentName} placement="right" arrow>
            <ListItemButton
              onClick={() => setOpenDept(!openDept)}
              sx={groupHeaderStyles}
            >
              <ListItemIcon sx={{ color: '#64748b', minWidth: 38 }}>
                <Building2 size={20} />
              </ListItemIcon>
              <ListItemText
                primary={departmentName}
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  color: '#334155',
                  noWrap: true,
                }}
              />
              {openDept ? (
                <ChevronUp size={16} color="#94a3b8" />
              ) : (
                <ChevronDown size={16} color="#94a3b8" />
              )}
            </ListItemButton>
          </Tooltip>

          <Collapse in={openDept} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ ...getItemStyles('/departments/overview'), pl: 4 }}
                onClick={() => handleNavigate('/departments/overview')}
              >
                <ListItemIcon sx={getIconStyles('/departments/overview')}>
                  <LayoutDashboard size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="Tổng quan"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>

              <ListItemButton
                sx={{ ...getItemStyles('/departments/okr'), pl: 4 }}
                onClick={() => handleNavigate('/departments/okr')}
              >
                <ListItemIcon sx={getIconStyles('/departments/okr')}>
                  <Target size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="OKR Bộ môn"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>

              <ListItemButton
                sx={{ ...getItemStyles('/departments/kpi'), pl: 4 }}
                onClick={() => handleNavigate('/departments/kpi')}
              >
                <ListItemIcon sx={getIconStyles('/departments/kpi')}>
                  <BarChart3 size={18} />
                </ListItemIcon>
                <ListItemText
                  primary="KPI Bộ môn"
                  primaryTypographyProps={{ fontSize: '0.85rem' }}
                />
              </ListItemButton>

              {/* Nhân sự (Chỉ hiện cho Manager) */}
              {isManager && (
                <ListItemButton
                  sx={{ ...getItemStyles('/departments/users'), pl: 4 }}
                  onClick={() => handleNavigate('/departments/users')}
                >
                  <ListItemIcon sx={getIconStyles('/departments/users')}>
                    <Users size={18} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Nhân sự"
                    primaryTypographyProps={{ fontSize: '0.85rem' }}
                  />
                </ListItemButton>
              )}
            </List>
          </Collapse>

          {/* DOCS */}
          <Divider sx={{ mx: 1, my: 1.5, borderColor: '#f1f5f9' }} />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={() => handleNavigate('/docs')}
              sx={getItemStyles('/docs')}
            >
              <ListItemIcon sx={getIconStyles('/docs')}>
                <BookOpen size={20} />
              </ListItemIcon>
              <ListItemText
                primary="Research & Docs"
                primaryTypographyProps={{
                  fontWeight: isActive('/docs') ? 600 : 500,
                  fontSize: '0.9rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* FOOTER */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ borderColor: '#e2e8f0', mb: 1.5 }} />
        <ListItemButton
          sx={{
            borderRadius: '12px',
            color: '#64748b',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#f1f5f9',
              color: '#1565c0',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
            <HelpCircle size={20} />
          </ListItemIcon>
          <ListItemText
            primary="IT Support"
            primaryTypographyProps={{ fontSize: '0.85rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

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
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            ...sidebarStyles,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
