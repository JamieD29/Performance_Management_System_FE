import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { api } from '../../services/api'; // ⚠️ Check đường dẫn api

interface AddDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // Hàm gọi lại khi thêm thành công để reload list
}

export default function AddDepartmentModal({
  open,
  onClose,
  onSuccess,
}: AddDepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validate cơ bản
    if (!formData.name || !formData.code) {
      setError('Tên và Mã bộ môn là bắt buộc');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/departments', formData);
      setFormData({ name: '', code: '', description: '' }); // Reset form
      onSuccess(); // Báo cho cha biết là xong rồi
      onClose(); // Đóng modal
    } catch (err: any) {
      // NestJS thường trả về message dạng mảng string, hoặc string đơn
      const errorMsg = err.response?.data?.message;

      if (Array.isArray(errorMsg)) {
        // Nếu là mảng nhiều lỗi -> Lấy cái đầu tiên cho gọn, hoặc nối lại
        setError(errorMsg[0]);
      } else {
        // Nếu là chuỗi đơn
        setError(errorMsg || 'Có lỗi xảy ra');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
        Thêm Bộ Môn Mới
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {/* Nếu error là mảng thì map ra, không thì hiện text */}
              {Array.isArray(error) ? (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {error.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              ) : (
                error
              )}
            </Alert>
          )}

          <TextField
            label="Tên bộ môn"
            name="name"
            required
            fullWidth
            value={formData.name}
            onChange={handleChange}
            placeholder="Ví dụ: Công nghệ phần mềm"
          />
          <TextField
            label="Mã bộ môn (Code)"
            name="code"
            required
            fullWidth
            value={formData.code}
            onChange={handleChange}
            placeholder="Ví dụ: SE, IT, CS..."
          />
          <TextField
            label="Mô tả"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
