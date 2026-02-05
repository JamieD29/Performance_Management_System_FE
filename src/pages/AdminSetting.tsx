import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Chip,
  Divider,
  Paper,
  ListItemButton,
  ListItemIcon,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

// Tách import Type
import type { SelectChangeEvent } from '@mui/material';

import {
  Dns,
  People,
  History,
  AdminPanelSettings,
  Add,
  Delete,
  Info,
  Edit,
  ArrowBack,
} from '@mui/icons-material';

import { api } from '../services/api';
// Vì user.roles bây giờ có thể là Object, ta dùng any hoặc sửa Type User sau.
// Tạm thời frontend xử lý linh hoạt.
import type { Domain, User } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

// ==========================================
// 1. COMPONENT: WHITELIST MANAGER (Giữ nguyên)
// ==========================================
const WhitelistManager = () => {
  // State lưu trạng thái của Modal xác nhận
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({
    open: false,
    id: null,
  });
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await api.get("/admin/domains");
      const data = response.data?.domains || response.data || [];
      setDomains(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddDomain = async () => {
    const rawDomain = domainInput.trim().toLowerCase();
    if (!rawDomain) return showMessage("error", "Please enter a domain");

    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(rawDomain))
      return showMessage("error", "Invalid domain format");

    if (domains.some((d) => d.domain.toLowerCase() === rawDomain)) {
      return showMessage("error", "Domain already exists");
    }

    setIsSaving(true);
    try {
      const response = await api.post("/admin/domains", { domain: rawDomain });
      const newDomain = response.data?.domain || response.data;
      setDomains([...domains, newDomain]);
      setDomainInput("");
      showMessage("success", `Added @${rawDomain}`);
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || "Failed to add");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    // Thay vì window.confirm, ta chỉ mở Modal và lưu ID lại
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.id;
    if (!id) return;

    setIsSaving(true); // Bật loading cho nút trong Modal
    try {
      await api.delete(`/admin/domains/${id}`);

      // Cập nhật lại danh sách domains
      setDomains(domains.filter((d) => d.id !== id));

      showMessage("success", "Domain removed");

      // Xóa xong thì đóng Modal
      setConfirmDelete({ open: false, id: null });
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || "Failed to delete");
    } finally {
      setIsSaving(false);
    }
  };

  // const handleDeleteDomain = async (id: string) => {
  //   if (!window.confirm("Remove this domain? Users will lose access.")) return;
  //   setIsSaving(true);
  //   try {
  //     await api.delete(`/admin/domains/${id}`);
  //     setDomains(domains.filter((d) => d.id !== id));
  //     showMessage("success", "Domain removed");
  //   } catch (err: any) {
  //     showMessage("error", err.response?.data?.message || "Failed to delete");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Card sx={{ mb: 3, boxShadow: "none", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Allowed Email Domains
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add email domains that are authorized to access the system.
          </Typography>

          <Box
            sx={{ mb: 3, display: "flex", gap: 2, alignItems: "flex-start" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="example.com"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
              helperText="Only lowercase letters, numbers, hyphens allowed"
              disabled={isSaving}
              sx={{
                "& .MuiFormHelperText-root": { marginLeft: 0, marginTop: 1 },
              }}
            />

            <Button
              variant="contained"
              onClick={handleAddDomain}
              disabled={isSaving || !domainInput.trim()}
              size="small"
              startIcon={!isSaving && <Add />}
              sx={{
                minWidth: 100,
                height: 40,
                whiteSpace: "nowrap",
                mt: "1px",
              }}
            >
              {isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "ADD"
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 1 }} />

          <List
            sx={{
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px solid #f1f5f9",
            }}
          >
            {domains.map((d) => (
              <ListItem key={d.id}>
                <ListItemText
                  primary={
                    <Chip label={`@${d.domain}`} color="primary" size="small" />
                  }
                  secondary={`Added: ${new Date(d.addedAt).toLocaleDateString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={() => handleOpenDelete(d.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {domains.length === 0 && (
              <Typography
                sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
              >
                No domains configured.
              </Typography>
            )}
          </List>

          <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Domain Policy
            </Typography>
            <Typography variant="body2">
              • You can add any valid domain (e.g. <strong>gmail.com</strong>,{" "}
              <strong>abc.com</strong>)<br />
              • Users with emails matching these domains will be allowed to log
              in.
              <br />• Removing a domain will immediately revoke access for those
              users.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
      {/* Đặt ở cuối hàm return của Component */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ ...confirmDelete, open: false })} // Đóng khi bấm Hủy/Click ra ngoài
        onConfirm={handleConfirmDelete} // Gọi hàm xóa thật sự khi bấm "Xác nhận"
        title="Xóa tên miền?"
        content="Hành động này sẽ xóa tên miền khỏi hệ thống. Người dùng thuộc tên miền này sẽ mất quyền truy cập."
        variant="danger"
        confirmText="Xóa ngay"
        isLoading={isSaving} // Truyền state loading vào để nút disable/quay vòng
      />
    </Box>
  );
};;

// ==========================================
// 2. COMPONENT: USER ROLE MANAGER (ĐÃ FIX LỖI OBJECT)
// ==========================================
const UserRoleManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    api
      .get('/users')
      .then((res) =>
        setUsers(Array.isArray(res.data) ? res.data : res.data.data || []),
      )
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/users/${selectedUser.id}/roles`, { roles: [newRole] });
      // Cập nhật lại UI.
      // Lưu ý: Backend trả về Object Role mới, nên để an toàn ta reload lại list
      // hoặc fake object role để hiển thị tạm.
      // Cách đơn giản nhất: Reload trang hoặc gọi lại fetchUsers, nhưng ở đây ta update tạm string.
      setUsers(
        users.map((u) => {
          if (u.id !== selectedUser.id) return u;
          // Hack UI: Cập nhật tạm thời roles dưới dạng object giả hoặc string để không phải reload
          // Logic render bên dưới đã handle được cả 2 loại.
          return { ...u, roles: [newRole] as any };
        }),
      );
      setRoleDialogOpen(false);
      alert('Role updated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed update');
    }
  };

  const getRoleColor = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'error';
    if (role === 'SYSTEM_ADMIN') return 'warning';
    if (role === 'DEAN') return 'primary';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        User Role Management
      </Typography>
      <Alert severity="warning" sx={{ mb: 3 }}>
        Only Super Admin can promote users.
      </Alert>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Job</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={user.avatarUrl}>
                        {user.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{user.name}</Typography>
                        <Typography variant="caption">{user.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.jobTitle || 'N/A'}</TableCell>
                  <TableCell>
                    {user.roles.map((r: any) => {
                      // 🔥 FIX QUAN TRỌNG: Check xem r là String hay Object
                      const roleSlug =
                        typeof r === 'string' ? r : r.slug || r.name;
                      return (
                        <Chip
                          key={roleSlug} // Dùng slug làm key thay vì object
                          label={roleSlug} // Render chuỗi text
                          size="small"
                          color={getRoleColor(roleSlug) as any}
                          sx={{ mr: 0.5 }}
                        />
                      );
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Role">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          // 🔥 FIX LOGIC LẤY DEFAULT ROLE CHO DIALOG
                          const firstRole = user.roles[0] as any;
                          const roleSlug =
                            typeof firstRole === 'string'
                              ? firstRole
                              : firstRole?.slug;
                          setNewRole(roleSlug || 'USER');
                          setRoleDialogOpen(true);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Edit Role: {selectedUser?.name}</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select
              value={newRole}
              label="Role"
              onChange={(e: SelectChangeEvent) => setNewRole(e.target.value)}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="DEAN">Dean</MenuItem>
              <MenuItem value="SYSTEM_ADMIN">System Admin</MenuItem>
              <MenuItem value="SUPER_ADMIN" sx={{ color: 'red' }}>
                Super Admin
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRole}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ==========================================
// 3. MAIN PAGE: ADMIN SETTINGS
// ==========================================
export default function AdminSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('whitelist');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userInfo = sessionStorage.getItem('user');
    if (userInfo) {
      const user: User = JSON.parse(userInfo);

      console.log('User Role Debug:', user.roles);

      const rawRoles = Array.isArray(user.roles) ? user.roles : [];
      // Normalize roles: Dù là String hay Object cũng đưa về String hết để check quyền
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
      {/* 1. ADMIN SIDEBAR */}
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

      {/* 2. ADMIN CONTENT AREA */}
      <Box sx={{ flexGrow: 1, p: 4, bgcolor: '#fff', overflow: 'auto' }}>
        <Container maxWidth="xl">
          {!shouldShowSidebar && (
            <Box
              sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}
            >
              <Typography variant="h5" fontWeight="bold">
                Admin Settings
              </Typography>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/dashboard')}
              >
                Back
              </Button>
            </Box>
          )}

          {shouldShowSidebar && (
            <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="h5" fontWeight="bold" color="#1e293b">
                {menuItems.find((i) => i.id === activeTab)?.label}
              </Typography>
            </Box>
          )}

          {activeTab === 'whitelist' && <WhitelistManager />}
          {activeTab === 'users' && <UserRoleManager />}
          {activeTab === 'logs' && (
            <Typography color="text.secondary">
              Logs system coming soon...
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
}
