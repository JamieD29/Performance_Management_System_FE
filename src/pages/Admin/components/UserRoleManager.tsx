import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Button,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Edit } from '@mui/icons-material';

import { api } from '../../../services/api';
import type { User } from '../../../types';

export default function UserRoleManager() {
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
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, roles: [newRole] as any } : u,
        ),
      );
      setRoleDialogOpen(false);
      alert('Role updated successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed update');
    }
  };

  const getRoleColor = (role: string) => {
    if (role === 'ADMIN') return 'error';
    return 'default';
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        User Role Management
      </Typography>
      <Alert severity="warning" sx={{ mb: 3 }}>
        Only Admin can promote users.
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
                      const roleSlug =
                        typeof r === 'string' ? r : r.slug || r.name;
                      return (
                        <Chip
                          key={roleSlug}
                          label={roleSlug}
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
                          const firstRole = user.roles[0] as any;
                          setNewRole(
                            (typeof firstRole === 'string'
                              ? firstRole
                              : firstRole?.slug) || 'USER',
                          );
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
              <MenuItem value="ADMIN" sx={{ color: 'red' }}>
                Admin
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
}
