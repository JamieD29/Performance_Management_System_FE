import { useState, useRef } from 'react';
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
  Popover,
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

// ==========================================
// CONSTANTS
// ==========================================
export const DRAWER_WIDTH = 280;
export const COLLAPSED_DRAWER_WIDTH = 72;

// Smooth transition config
const TRANSITION_DURATION = '0.35s';
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const SMOOTH_TRANSITION = `all ${TRANSITION_DURATION} ${TRANSITION_EASING}`;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  mobileOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [openPersonal, setOpenPersonal] = useState(true);
  const [openDept, setOpenDept] = useState(true);

  // Popover state for collapsed sub-menus
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverGroup, setPopoverGroup] = useState<'personal' | 'dept' | null>(null);
  const popoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ==========================================
  // 1. USER & ROLE
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

  const isManager = userRoles.includes('ADMIN');

  const departmentName = user.department?.name || 'Bộ môn';

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
    handlePopoverClose();
  };

  const isActive = (path: string) => location.pathname === path;

  // Popover handlers
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, group: 'personal' | 'dept') => {
    if (!collapsed) return;
    if (popoverTimeout.current) clearTimeout(popoverTimeout.current);
    setPopoverAnchor(event.currentTarget);
    setPopoverGroup(group);
  };

  const handlePopoverClose = () => {
    popoverTimeout.current = setTimeout(() => {
      setPopoverAnchor(null);
      setPopoverGroup(null);
    }, 150);
  };

  const handlePopoverEnter = () => {
    if (popoverTimeout.current) clearTimeout(popoverTimeout.current);
  };

  // ==========================================
  // 2. COLOR PALETTE
  // ==========================================
  const colors = {
    bg: '#0F2854',
    bgLight: '#1C4D8D',
    bgDark: '#081736',
    accent1: '#1C4D8D',
    accent2: '#BDE8F5',
    accent3: '#BDE8F5',
    accent4: '#FFD60A',
    text: 'rgba(255, 255, 255, 0.88)',
    textMuted: 'rgba(255, 255, 255, 0.55)',
    textBright: '#ffffff',
    divider: 'rgba(255, 255, 255, 0.15)',
    hoverBg: 'rgba(255, 255, 255, 0.12)',
    activeBg: 'rgba(255, 255, 255, 0.2)',
    activeGlow: '0 2px 12px rgba(0, 0, 0, 0.15)',
  };

  // ==========================================
  // 3. STYLING
  // ==========================================
  const currentWidth = collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

  const getItemStyles = (path: string) => ({
    borderRadius: '12px',
    minHeight: 46,
    mb: 0.5,
    mx: 0.5,
    px: collapsed ? 1.5 : 2,
    justifyContent: collapsed ? 'center' : 'flex-start',
    color: isActive(path) ? colors.textBright : colors.text,
    bgcolor: isActive(path) ? colors.activeBg : 'transparent',
    boxShadow: isActive(path) ? colors.activeGlow : 'none',
    fontWeight: isActive(path) ? 600 : 400,
    transition: SMOOTH_TRANSITION,
    position: 'relative' as const,
    overflow: 'hidden',
    '&:hover': {
      bgcolor: isActive(path) ? colors.activeBg : colors.hoverBg,
      color: colors.textBright,
      transform: collapsed ? 'none' : 'translateX(3px)',
      '& .MuiListItemIcon-root': {
        color: colors.textBright,
      },
    },
    '&::before': isActive(path)
      ? {
        content: '""',
        position: 'absolute',
        left: 0,
        top: '15%',
        bottom: '15%',
        width: '3px',
        borderRadius: '0 4px 4px 0',
        bgcolor: colors.accent3,
        boxShadow: `0 0 8px ${colors.accent3}`,
      }
      : {},
  });

  const getIconStyles = (path: string) => ({
    color: isActive(path) ? '#0F2854' : colors.accent2,
    minWidth: collapsed ? 'unset' : 38,
    mr: collapsed ? 0 : 1,
    transition: `color ${TRANSITION_DURATION} ease`,
  });

  const groupHeaderStyles = {
    borderRadius: '12px',
    mb: 0.5,
    mx: 0.5,
    px: collapsed ? 1.5 : 2,
    justifyContent: collapsed ? 'center' : 'flex-start',
    color: colors.textBright,
    transition: SMOOTH_TRANSITION,
    '&:hover': {
      bgcolor: colors.hoverBg,
    },
  };

  const sectionLabelSx = {
    display: collapsed ? 'none' : 'block',
    px: 2,
    pt: 2.5,
    pb: 0.5,
    fontSize: '0.78rem',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: colors.accent2,
  };

  const sidebarBg = {
    bgcolor: colors.bg,
    borderRight: 'none',
  };

  // Popover item styles
  const popoverItemSx = (path: string) => ({
    borderRadius: '8px',
    mx: 0.5,
    mb: 0.3,
    color: isActive(path) ? '#1C4D8D' : '#334155',
    bgcolor: isActive(path) ? '#e8f0fe' : 'transparent',
    fontWeight: isActive(path) ? 600 : 400,
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: '#f1f5f9',
      color: '#1C4D8D',
    },
  });

  // ==========================================
  // 4. POPOVER SUB-MENUS (collapsed mode)
  // ==========================================
  const personalSubItems = [
    { label: 'Hồ sơ của tôi', path: '/profile', icon: <FileText size={18} /> },
    { label: 'OKR Của tôi', path: '/performance/evaluate', icon: <ClipboardCheck size={18} /> },
  ];

  const deptSubItems = [
    { label: 'Tổng quan', path: '/departments/overview', icon: <LayoutDashboard size={18} /> },
    { label: 'OKR Bộ môn', path: '/departments/okr', icon: <Target size={18} /> },
    { label: 'KPI Bộ môn', path: '/departments/kpi', icon: <BarChart3 size={18} /> },
    ...(isManager
      ? [{ label: 'Nhân sự', path: '/departments/users', icon: <Users size={18} /> }]
      : []),
  ];

  const renderPopover = () => (
    <Popover
      open={Boolean(popoverAnchor) && Boolean(popoverGroup)}
      anchorEl={popoverAnchor}
      onClose={handlePopoverClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableRestoreFocus
      slotProps={{
        paper: {
          onMouseEnter: handlePopoverEnter,
          onMouseLeave: handlePopoverClose,
          sx: {
            ml: 1,
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid #e2e8f0',
            minWidth: 200,
            py: 0.5,
          },
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          px: 2,
          pt: 1,
          pb: 0.5,
          display: 'block',
          color: '#0F2854',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        }}
      >
        {popoverGroup === 'personal' ? 'Quản lý cá nhân' : departmentName}
      </Typography>
      <List dense sx={{ px: 0.5 }}>
        {(popoverGroup === 'personal' ? personalSubItems : deptSubItems).map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            sx={popoverItemSx(item.path)}
          >
            <ListItemIcon sx={{ color: isActive(item.path) ? '#1C4D8D' : '#94a3b8', minWidth: 32 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.88rem', fontWeight: isActive(item.path) ? 600 : 400 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Popover>
  );

  // ==========================================
  // 5. DRAWER CONTENT
  // ==========================================
  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: colors.bg,
        transition: `width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
        overflow: 'hidden',
      }}
    >
      {/* ─── HEADER ─── */}
      <Toolbar
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: collapsed ? 2 : 3,
          flexShrink: 0,
        }}
      >
        <Tooltip
          title="Click để thu nhỏ/mở rộng"
          placement="right"
          arrow
          enterDelay={800}
        >
          <Box
            onClick={onToggleCollapse}
            sx={{
              width: collapsed ? 44 : 60,
              height: collapsed ? 44 : 60,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: collapsed ? '12px' : '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: collapsed ? 0 : 1.5,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              transition: SMOOTH_TRANSITION,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.28)',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.97)',
              },
            }}
          >
            <GraduationCap size={collapsed ? 22 : 30} color="#ffffff" />
          </Box>
        </Tooltip>

        {/* Text with fade transition */}
        <Box
          sx={{
            overflow: 'hidden',
            maxHeight: collapsed ? 0 : 50,
            opacity: collapsed ? 0 : 1,
            transition: `max-height ${TRANSITION_DURATION} ${TRANSITION_EASING}, opacity 0.25s ease`,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: colors.textBright,
              letterSpacing: '-0.01em',
              fontSize: '1.05rem',
              whiteSpace: 'nowrap',
            }}
          >
            VNU-HCMUS
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.accent3,
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
            }}
          >
            Performance Management
          </Typography>
        </Box>
      </Toolbar>

      <Divider
        sx={{
          mx: collapsed ? 1 : 2,
          borderColor: colors.divider,
          transition: `margin ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
        }}
      />

      {/* ─── MENU LIST ─── */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: collapsed ? 0.5 : 1.5,
          pt: 2,
          transition: `padding ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
          '&::-webkit-scrollbar': { width: 3 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.35)' },
          },
        }}
      >
        <List component="nav" sx={{ px: 0 }}>
          {/* ── Dashboard ── */}
          <Box sx={{ px: collapsed ? 0.5 : 1, mb: 3 }}>
            <Tooltip title={collapsed ? 'Dashboard' : ''} placement="right" arrow>
              <ListItemButton
                onClick={() => handleNavigate('/dashboard')}
                sx={{
                  ...getItemStyles('/dashboard'),
                  bgcolor: isActive('/dashboard') ? '#BDE8F5' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive('/dashboard') ? colors.bg : colors.textBright,
                  boxShadow: isActive('/dashboard') ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  mb: 0,
                  mx: 0,
                  py: 1.2,
                  zIndex: 1,
                  '& .MuiListItemIcon-root': {
                    color: isActive('/dashboard') ? colors.bg : colors.accent2,
                  },
                  '&:hover': {
                    bgcolor: isActive('/dashboard') ? '#BDE8F5' : 'rgba(255, 255, 255, 0.2)',
                    transform: collapsed ? 'none' : 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                    '& .MuiListItemIcon-root': {
                      color: isActive('/dashboard') ? colors.bg : colors.textBright,
                    },
                  },
                  '&::before': { display: 'none' }
                }}
              >
                <ListItemIcon sx={{ ...getIconStyles('/dashboard'), color: 'inherit' }}>
                  <LayoutDashboard size={21} />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  sx={{
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : 'auto',
                    transition: `opacity 0.2s ease, width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  primaryTypographyProps={{
                    fontWeight: isActive('/dashboard') ? 700 : 600,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </Box>

          {/* ── NHÓM CÁ NHÂN ── */}
          <Box sx={{
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            mb: 2,
            mx: collapsed ? 0.5 : 1,
            py: 1,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <Typography variant="overline" sx={{ ...sectionLabelSx, px: 1.5, pt: 0, pb: 1, color: colors.accent3 }}>
              Cá nhân
            </Typography>

            {collapsed && <Divider sx={{ mx: 1, my: 1, borderColor: colors.divider }} />}

            <Tooltip title={collapsed ? 'Quản lý cá nhân' : ''} placement="right" arrow>
              <ListItemButton
                onClick={(e) => {
                  if (collapsed) {
                    handlePopoverOpen(e, 'personal');
                  } else {
                    setOpenPersonal(!openPersonal);
                  }
                }}
                sx={groupHeaderStyles}
              >
                <ListItemIcon
                  sx={{
                    color: colors.accent2,
                    minWidth: collapsed ? 'unset' : 38,
                    mr: collapsed ? 0 : 1,
                    transition: `color ${TRANSITION_DURATION} ease`,
                  }}
                >
                  <User size={21} />
                </ListItemIcon>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : 'auto',
                    overflow: 'hidden',
                    transition: `opacity 0.2s ease, width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                  }}
                >
                  <ListItemText
                    primary="Quản lý cá nhân"
                    primaryTypographyProps={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: colors.textBright,
                      whiteSpace: 'nowrap',
                    }}
                  />
                  {openPersonal ? (
                    <ChevronUp size={16} color={colors.textMuted} />
                  ) : (
                    <ChevronDown size={16} color={colors.textMuted} />
                  )}
                </Box>
              </ListItemButton>
            </Tooltip>

            {!collapsed && (
              <Collapse in={openPersonal} timeout={300} unmountOnExit>
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
                      primaryTypographyProps={{ fontSize: '0.92rem' }}
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
                      primaryTypographyProps={{ fontSize: '0.92rem' }}
                    />
                  </ListItemButton>
                </List>
              </Collapse>
            )}
          </Box>

          {/* ── NHÓM BỘ MÔN ── */}
          <Box sx={{
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            mb: 2,
            mx: collapsed ? 0.5 : 1,
            py: 1,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <Typography variant="overline" sx={{ ...sectionLabelSx, px: 1.5, pt: 0, pb: 1, color: colors.accent2 }}>
              Bộ môn
            </Typography>

            {collapsed && <Divider sx={{ mx: 1, my: 1, borderColor: colors.divider }} />}

            <Tooltip title={collapsed ? departmentName : ''} placement="right" arrow>
              <ListItemButton
                onClick={(e) => {
                  if (collapsed) {
                    handlePopoverOpen(e, 'dept');
                  } else {
                    setOpenDept(!openDept);
                  }
                }}
                sx={groupHeaderStyles}
              >
                <ListItemIcon
                  sx={{
                    color: colors.accent2,
                    minWidth: collapsed ? 'unset' : 38,
                    mr: collapsed ? 0 : 1,
                    transition: `color ${TRANSITION_DURATION} ease`,
                  }}
                >
                  <Building2 size={21} />
                </ListItemIcon>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : 'auto',
                    overflow: 'hidden',
                    transition: `opacity 0.2s ease, width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                  }}
                >
                  <ListItemText
                    primary={departmentName}
                    primaryTypographyProps={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: colors.textBright,
                      noWrap: true,
                    }}
                  />
                  {openDept ? (
                    <ChevronUp size={16} color={colors.textMuted} />
                  ) : (
                    <ChevronDown size={16} color={colors.textMuted} />
                  )}
                </Box>
              </ListItemButton>
            </Tooltip>

            {!collapsed && (
              <Collapse in={openDept} timeout={300} unmountOnExit>
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
                      primaryTypographyProps={{ fontSize: '0.92rem' }}
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
                      primaryTypographyProps={{ fontSize: '0.92rem' }}
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
                      primaryTypographyProps={{ fontSize: '0.92rem' }}
                    />
                  </ListItemButton>

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
                        primaryTypographyProps={{ fontSize: '0.92rem' }}
                      />
                    </ListItemButton>
                  )}
                </List>
              </Collapse>
            )}
          </Box>

          {/* ── DOCS ── */}
          <Box sx={{
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            mb: 2,
            mx: collapsed ? 0.5 : 1,
            py: 1,
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={collapsed ? 'Research & Docs' : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => handleNavigate('/docs')}
                  sx={getItemStyles('/docs')}
                >
                  <ListItemIcon sx={getIconStyles('/docs')}>
                    <BookOpen size={21} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Research & Docs"
                    sx={{
                      opacity: collapsed ? 0 : 1,
                      width: collapsed ? 0 : 'auto',
                      transition: `opacity 0.2s ease, width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                    primaryTypographyProps={{
                      fontWeight: isActive('/docs') ? 600 : 500,
                      fontSize: '0.95rem',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </Box>
        </List>
      </Box>

      {/* ─── FOOTER ─── */}
      <Box sx={{ p: collapsed ? 1 : 2, mt: 'auto', transition: `padding ${TRANSITION_DURATION} ${TRANSITION_EASING}` }}>
        <Divider sx={{ borderColor: colors.divider, mb: 1.5 }} />
        <Tooltip title={collapsed ? 'IT Support' : ''} placement="right" arrow>
          <ListItemButton
            sx={{
              borderRadius: '12px',
              color: colors.textMuted,
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 1.5 : 2,
              transition: SMOOTH_TRANSITION,
              '&:hover': {
                bgcolor: colors.hoverBg,
                color: colors.textBright,
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: collapsed ? 'unset' : 38,
                mr: collapsed ? 0 : 1,
              }}
            >
              <HelpCircle size={20} />
            </ListItemIcon>
            <ListItemText
              primary="IT Support"
              sx={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
                transition: `opacity 0.2s ease, width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              primaryTypographyProps={{ fontSize: '0.92rem' }}
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          width: { sm: currentWidth },
          flexShrink: { sm: 0 },
          transition: `width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              ...sidebarBg,
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentWidth,
              transition: `width ${TRANSITION_DURATION} ${TRANSITION_EASING}`,
              ...sidebarBg,
              border: 'none',
              overflowX: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Floating popover for collapsed sub-menus */}
      {renderPopover()}
    </>
  );
}
