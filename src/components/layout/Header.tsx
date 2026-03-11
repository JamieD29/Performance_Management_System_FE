import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  AdminPanelSettings,
  Settings,
} from '@mui/icons-material';

interface HeaderProps {
  onToggleSidebar: () => void;
  user: any;
  sidebarWidth?: number;
}

export default function Header({ onToggleSidebar, user, sidebarWidth = 280 }: HeaderProps) {
  const navigate = useNavigate();
  // const theme = useTheme(); // <-- Có thể xóa dòng này nếu không dùng theme ở chỗ khác
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const rawRoles = Array.isArray(user.roles) ? user.roles : [];

  // Nếu là Object { slug: 'ADMIN' } -> lấy 'ADMIN'
  // Nếu là String 'ADMIN' -> giữ nguyên
  const normalizedRoles = rawRoles.map((r: any) =>
    (typeof r === 'string' ? r : r?.slug || r?.name || '').toString(),
  );

  // 3. Check quyền (Thêm ADMIN vào danh sách VIP)
  const isAdmin = normalizedRoles.includes('ADMIN');

  // Hiển thị chức vụ quản lý hoặc chức danh nghề nghiệp
  const displayRole = user?.managementPosition?.name || user?.jobTitle || 'User';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Lỗi báo Backend (bỏ qua)');
    } finally {
      // 1. Dọn sạch ổ cứng
      sessionStorage.clear();
      localStorage.clear();
      if (typeof setAnchorEl === 'function') setAnchorEl(null);

      // 2. DÙNG SETTIMEOUT ĐỂ ÉP CHUYỂN TRANG BẤT CHẤP LỖI REACT
      setTimeout(() => {
        window.location.href = '/login';
      }, 100); // Trễ 0.1s để văng khỏi call stack bị lỗi
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#ffffff',
        color: '#1e293b',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        width: { sm: `calc(100% - ${sidebarWidth}px)` },
        ml: { sm: `${sidebarWidth}px` },
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2, display: { sm: 'none' } }} // 🔥 Chỉ hiện nút Menu trên Mobile. Desktop thì ẩn đi (vì Sidebar luôn hiện rồi)
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: '#1e3a8a',
          }}
        >
          HCMUS{' '}
          <Typography
            component="span"
            sx={{ color: '#64748b', fontWeight: 400 }}
          >
            | Performance Management System
          </Typography>
        </Typography>

        <Button
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            textTransform: 'none',
            color: 'text.primary',
            borderRadius: '50px',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            p: '4px 16px 4px 6px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: '#f1f5f9',
              borderColor: '#cbd5e1',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Avatar
            src={user?.avatar}
            sx={{
              width: 38,
              height: 38,
              mr: 1.5,
              border: '2px solid #ffffff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              bgcolor: user?.avatar ? 'transparent' : '#3b82f6',
              fontWeight: 'bold',
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>

          <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: '#1e293b' }}
            >
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.7rem' }}
            >
              {displayRole}
            </Typography>
          </Box>
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
            },
          }}
        >
          <MenuItem
            onClick={() => navigate('/profile')}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: '8px',
              mx: 0.5,
              mb: 0.3,
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#f1f5f9' },
            }}
          >
            <Settings fontSize="small" sx={{ mr: 1.5, color: '#64748b' }} />
            <Typography variant="body2" fontWeight={500}>Hồ sơ cá nhân</Typography>
          </MenuItem>
          {isAdmin && (
            <MenuItem
              onClick={() => navigate('/admin/settings')}
              sx={{
                py: 1.2,
                px: 2,
                borderRadius: '8px',
                mx: 0.5,
                mb: 0.3,
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: '#f1f5f9' },
              }}
            >
              <AdminPanelSettings fontSize="small" sx={{ mr: 1.5, color: '#64748b' }} />
              <Typography variant="body2" fontWeight={500}>Admin Portal</Typography>
            </MenuItem>
          )}
          <Divider sx={{ mx: 1, my: 0.5 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: '8px',
              mx: 0.5,
              color: '#ef4444',
              transition: 'all 0.2s ease',
              '&:hover': { bgcolor: '#fef2f2' },
            }}
          >
            <Logout fontSize="small" sx={{ mr: 1.5 }} />
            <Typography variant="body2" fontWeight={500}>Đăng xuất</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
