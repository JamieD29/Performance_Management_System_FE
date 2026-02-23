import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // 👈 Dùng Grid2 chuẩn MUI v6
import { Search, Info, Refresh } from '@mui/icons-material';
import { api } from '../../../services/api'; // Đường dẫn api chuẩn

// --- INTERFACE ---
interface SystemLog {
  id: string;
  action: string; // CREATE, UPDATE, DELETE, LOGIN...
  resource: string; // DEPARTMENT, USER, ROLE...
  message: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  // Hàm gọi API lấy log từ Backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/system-logs');
      const logData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLogs(res.data);
    } catch (error) {
      console.error('Lỗi khi tải nhật ký hệ thống:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động load khi vào trang
  useEffect(() => {
    fetchLogs();
  }, []);

  // Format màu sắc cho đẹp
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'LOGIN':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
      case 'LOGOUT':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) =>
    status === 'SUCCESS' ? 'success' : 'error';

  // Logic lọc dữ liệu theo Search và Loại thao tác
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = filterAction === 'ALL' || log.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <Box>
      {/* HEADER TÌM KIẾM & LỌC */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm theo nội dung, tên, email người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại thao tác</InputLabel>
              <Select
                value={filterAction}
                label="Loại thao tác"
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <MenuItem value="ALL">Tất cả thao tác</MenuItem>
                <MenuItem value="CREATE">Tạo mới (CREATE)</MenuItem>
                <MenuItem value="UPDATE">Cập nhật (UPDATE)</MenuItem>
                <MenuItem value="DELETE">Xóa (DELETE)</MenuItem>
                <MenuItem value="LOGIN">Đăng nhập (LOGIN)</MenuItem>
                <MenuItem value="LOGOUT">Đăng xuất (LOGOUT)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{ xs: 12, md: 2 }}
            sx={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLogs}
              fullWidth
            >
              Làm mới
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* BẢNG DỮ LIỆU */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #e2e8f0' }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell width="15%">Thời gian</TableCell>
              <TableCell width="20%">Người thực hiện</TableCell>
              <TableCell width="15%">Hành động</TableCell>
              <TableCell width="35%">Chi tiết</TableCell>
              <TableCell width="10%" align="center">
                Trạng thái
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 5, color: 'text.secondary' }}
                >
                  Chưa có nhật ký nào được ghi nhận.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} hover sx={{ '& td': { py: 1.5 } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {log.user?.name || 'Hệ thống'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.user?.email || 'System Action'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={getActionColor(log.action) as any}
                      sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.message}</Typography>
                    {/* <Typography variant="caption" color="text.secondary">
                      Chức năng của: {log.resource}
                    </Typography> */}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={log.status}
                      size="small"
                      variant="outlined"
                      color={getStatusColor(log.status) as any}
                      sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
