import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { performanceService } from '../../../services/performanceService';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Add, Delete, Flag } from '@mui/icons-material';

interface CreateOkrDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function CreateOkrDialog({
  open,
  onClose,
  onSave,
}: CreateOkrDialogProps) {
  // 1. State lưu dữ liệu Form
  const [title, setTitle] = useState('');
  const [cycleId, setCycleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [keyResults, setKeyResults] = useState([
    { id: Date.now().toString(), title: '', target: 0, unit: '' },
  ]);

  // 2. State lưu dữ liệu Động từ Backend (Data thật)
  const [departments, setDepartments] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);

  // 3. Chạy hàm lấy dữ liệu mỗi khi mở form
  useEffect(() => {
    if (open) {
      loadRealData();
    }
  }, [open]);

  const loadRealData = async () => {
    try {
      // Gọi API lấy Học kỳ
      const cycleData = await performanceService.getCycles();
      setCycles(cycleData);
      if (cycleData.length > 0) {
        setCycleId(cycleData[0].id); // Tự động chọn Học kỳ đầu tiên
      }

      // Gọi API lấy danh sách Bộ môn
      const deptRes = await api.get('/departments');
      // Xử lý tùy theo format API của mày (thường là .data hoặc .data.data)
      const deptList = deptRes.data?.data || deptRes.data || [];
      setDepartments(deptList);
      if (deptList.length > 0) {
        setDepartmentId(deptList[0].id); // Tự động chọn Bộ môn đầu tiên
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải dữ liệu Bộ môn / Học kỳ:', error);
    }
  };

  // Các hàm xử lý giao diện
  const handleAddKR = () =>
    setKeyResults([
      ...keyResults,
      { id: Date.now().toString(), title: '', target: 0, unit: '' },
    ]);
  const handleRemoveKR = (id: string) =>
    setKeyResults(keyResults.filter((kr) => kr.id !== id));
  const handleKRChange = (id: string, field: string, value: any) => {
    setKeyResults(
      keyResults.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr)),
    );
  };

  // Nút Submit
  const handleSubmit = () => {
    const payload = {
      title,
      cycleId,
      departmentId,
      type: 'DEPARTMENT',

      // 👇 ĐOẠN SỬA LÀ Ở ĐÂY: Lọc bỏ dòng trống, sau đó vứt luôn cái ID ảo đi, chỉ gửi ruột lên thôi
      keyResults: keyResults
        .filter((kr) => kr.title.trim() !== '')
        .map((kr) => ({
          title: kr.title,
          target: kr.target,
          unit: kr.unit,
          // Tuyệt đối không có trường "id" ở đây nữa!
        })),
    };

    onSave(payload);

    // Reset form sau khi gửi
    setTitle('');
    setKeyResults([
      { id: Date.now().toString(), title: '', target: 0, unit: '' },
    ]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: '#1e3a8a',
          fontWeight: 'bold',
        }}
      >
        <Flag /> Tạo Mục Tiêu (OKR) Bộ Môn
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        {/* --- PHẦN 1: THÔNG TIN OBJECTIVE (Đã được đưa ra ngoài vòng lặp KRs) --- */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              fullWidth
              label="Tên Mục tiêu (VD: Cải tiến chất lượng đào tạo...)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Giao cho Bộ môn</InputLabel>
              <Select
                value={departmentId}
                label="Giao cho Bộ môn"
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                {/* 🔄 Lặp data Bộ môn thật từ DB */}
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>Học kỳ áp dụng</InputLabel>
              <Select
                value={cycleId}
                label="Học kỳ áp dụng"
                onChange={(e) => setCycleId(e.target.value)}
              >
                {/* 🔄 Lặp data Học kỳ thật từ DB */}
                {cycles.map((cycle) => (
                  <MenuItem key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* --- PHẦN 2: DANH SÁCH KEY RESULTS --- */}
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.secondary"
          >
            Danh sách Kết quả then chốt (KRs)
          </Typography>
          <Button
            startIcon={<Add />}
            size="small"
            variant="outlined"
            onClick={handleAddKR}
          >
            Thêm KR
          </Button>
        </Box>

        <Box
          sx={{
            bgcolor: '#f8fafc',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e2e8f0',
          }}
        >
          {keyResults.map((kr, index) => (
            <Grid
              container
              spacing={2}
              sx={{ mb: 2, alignItems: 'center' }}
              key={kr.id}
            >
              <Grid size={{ xs: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.secondary"
                  align="center"
                >
                  KR {index + 1}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nội dung kết quả"
                  value={kr.title}
                  onChange={(e) =>
                    handleKRChange(kr.id, 'title', e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Mục tiêu số"
                  value={kr.target}
                  onChange={(e) =>
                    handleKRChange(kr.id, 'target', Number(e.target.value))
                  }
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Đơn vị (%, Bài...)"
                  value={kr.unit}
                  onChange={(e) =>
                    handleKRChange(kr.id, 'unit', e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveKR(kr.id)}
                  disabled={keyResults.length === 1}
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        {/* Nút lưu sẽ bị mờ nếu chưa chọn đủ Bộ môn, Học kỳ, Tên */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title || !departmentId || !cycleId}
        >
          Lưu OKR
        </Button>
      </DialogActions>
    </Dialog>
  );
}
