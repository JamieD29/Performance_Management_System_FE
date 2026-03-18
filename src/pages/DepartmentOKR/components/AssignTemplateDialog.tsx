import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Radio,
} from '@mui/material';
import { Send, PersonSearch } from '@mui/icons-material';
import { api } from '../../../services/api';
import { performanceService } from '../../../services/performanceService';

interface AssignTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: any; // The template being assigned
}

export default function AssignTemplateDialog({
  open,
  onClose,
  template,
}: AssignTemplateDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      // Fetch all users with details
      const usersRes = await api.get('/users');
      setUsers(usersRes.data || []);

      // Fetch departments
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data?.data || deptRes.data || []);

      // Fetch evaluation cycles
      const cyclesData = await performanceService.getCycles();
      setCycles(cyclesData || []);
    } catch (error) {
      console.error('Error loading data for assignment', error);
    }
  };

  const filteredUsers = filterDept
    ? users.filter((u: any) => u.department?.id === filterDept)
    : users;

  const handleAssign = async () => {
    if (!selectedUserId || !selectedCycleId) {
      alert('Vui lòng chọn User và Kỳ đánh giá!');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/okr-templates/${template.id}/apply`, {
        userId: selectedUserId,
        cycleId: selectedCycleId,
        deadline: deadline || undefined,
      });
      alert('✅ Đã giao OKR Template cho User thành công! User sẽ nhận được OKR ở trạng thái chờ duyệt.');
      onClose();
    } catch (error) {
      console.error('Error assigning template', error);
      alert('❌ Có lỗi xảy ra khi giao template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ color: '#1e3a8a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Send />
        Giao Template OKR cho Nhân sự
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ mt: 1 }}>
        {/* Template Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
          <Typography variant="subtitle2" color="text.secondary">Template được chọn:</Typography>
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a">{template?.title}</Typography>
          {template?.jobTitle && <Chip label={template.jobTitle} size="small" color="primary" sx={{ mt: 0.5, mr: 1 }} />}
        </Box>

        {/* Cycle & Deadline Selection */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Kỳ đánh giá *</InputLabel>
            <Select
              value={selectedCycleId}
              label="Kỳ đánh giá *"
              onChange={(e) => setSelectedCycleId(e.target.value)}
            >
              {cycles.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Deadline (tùy chọn)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* User Selection */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PersonSearch color="primary" />
          <Typography variant="h6" fontWeight="bold">Chọn Nhân sự để giao</Typography>
          <FormControl sx={{ minWidth: 200, ml: 'auto' }}>
            <InputLabel>Lọc theo Bộ môn</InputLabel>
            <Select
              value={filterDept}
              label="Lọc theo Bộ môn"
              onChange={(e) => setFilterDept(e.target.value)}
              size="small"
            >
              <MenuItem value="">-- Tất cả --</MenuItem>
              {departments.map((d: any) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: '#f1f5f9', fontWeight: 'bold' } }}>
                <TableCell width={50}></TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Bộ môn</TableCell>
                <TableCell>Chức vụ quản lý</TableCell>
                <TableCell>Chức danh nghề nghiệp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    Không tìm thấy nhân sự nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow
                    key={user.id}
                    hover
                    selected={selectedUserId === user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Radio
                        checked={selectedUserId === user.id}
                        onChange={() => setSelectedUserId(user.id)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={user.avatarUrl} sx={{ width: 28, height: 28 }}>
                          {(user.name || user.email)?.[0]?.toUpperCase()}
                        </Avatar>
                        {user.name || '(Chưa đặt tên)'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{user.email}</TableCell>
                    <TableCell>
                      {user.department?.name ? (
                        <Chip label={user.department.name} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.managementPosition?.name ? (
                        <Chip label={user.managementPosition.name} size="small" color="secondary" />
                      ) : (
                        <Typography variant="caption" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.jobTitle || <Typography variant="caption" color="text.secondary">—</Typography>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {selectedUserId && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1, border: '1px solid #bbf7d0' }}>
            <Typography variant="body2" color="success.main">
              ✅ Đã chọn: <strong>{filteredUsers.find(u => u.id === selectedUserId)?.name || filteredUsers.find(u => u.id === selectedUserId)?.email}</strong>
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedUserId || !selectedCycleId || loading}
          startIcon={<Send />}
        >
          {loading ? 'Đang giao...' : 'Giao OKR cho Nhân sự'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
