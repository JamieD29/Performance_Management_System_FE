import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material';
import {
  Plus,
  Play,
  Pause,
  Calendar,
    RefreshCcw,
  Database,
} from 'lucide-react';
import axios from 'axios';
import { api } from '../../../services/api';

const RESOURCE_PATH = '/performance';

export default function CycleManagement() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await api.get(`${RESOURCE_PATH}/cycles`);
      setCycles(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔥 HÀM MỚI: GỌI API INIT DATA
  const handleInitData = async () => {
    // 1. Hỏi cho chắc, lỡ sếp bấm nhầm
    if (
      !window.confirm(
        '⚠️ CẢNH BÁO: Hành động này sẽ tạo lại dữ liệu mẫu (Kỳ học, Template KPI).\n\nBạn có chắc chắn muốn chạy không?',
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // 2. Gọi API Init của mày
      await api.post(`${RESOURCE_PATH}/init`);


  const handleCreate = async () => {
    try {
      await api.post(`${RESOURCE_PATH}/admin/cycles`, formData);
      setOpen(false);
      fetchCycles();
      alert('Tạo kỳ thành công!');
    } catch (error) {
      alert('Lỗi khi tạo kỳ!');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.put(`${RESOURCE_PATH}/admin/cycles/${id}/status`, {
        status: newStatus,
      });
      fetchCycles();
    } catch (error) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  return (
    <Box>
      <Box className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Quản lý Kỳ Đánh Giá</h3>

        <Box className="flex gap-2">
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpen(true)}
          >
            Tạo kỳ mới
          </Button>
        </Box>
      </Box>

      {/* ... (Phần Table bên dưới giữ nguyên không đổi) ... */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell>Tên Kỳ</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cycles.length > 0 ? (
              cycles.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      {cycle.startDate
                        ? new Date(cycle.startDate).toLocaleDateString('vi-VN')
                        : '...'}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cycle.status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
                      color={cycle.status === 'OPEN' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color={cycle.status === 'OPEN' ? 'error' : 'success'}
                      startIcon={
                        cycle.status === 'OPEN' ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )
                      }
                      onClick={() => toggleStatus(cycle.id, cycle.status)}
                    >
                      {cycle.status === 'OPEN' ? 'Đóng kỳ' : 'Mở lại'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  className="py-8 text-gray-400"
                >
                  Chưa có kỳ đánh giá nào. Bấm nút{' '}
                  <strong>"Khởi tạo Dữ liệu mẫu"</strong> ở trên để bắt đầu!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL TẠO MỚI (Giữ nguyên) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tạo Kỳ Đánh Giá Mới</DialogTitle>
        <DialogContent className="flex flex-col gap-4 py-4">
          <TextField
            label="Tên kỳ (VD: Học kỳ 2 - 2026)"
            fullWidth
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="flex gap-4">
            <TextField
              type="date"
              label="Ngày bắt đầu"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
            <TextField
              type="date"
              label="Ngày kết thúc"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Lưu lại
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
