import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Badge,
    Groups,
} from '@mui/icons-material';
import { api } from '../../../services/api';

interface ManagementPosition {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt: string;
}

export default function ManagementPositionManager() {
    const [positions, setPositions] = useState<ManagementPosition[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPosition, setEditingPosition] = useState<ManagementPosition | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [submitting, setSubmitting] = useState(false);

    const fetchPositions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/management-positions');
            setPositions(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Lỗi tải chức vụ:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '');
    };

    const handleOpenCreate = () => {
        setEditingPosition(null);
        setFormData({ name: '', slug: '', description: '' });
        setDialogOpen(true);
    };

    const handleOpenEdit = (pos: ManagementPosition) => {
        setEditingPosition(pos);
        setFormData({
            name: pos.name,
            slug: pos.slug,
            description: pos.description || '',
        });
        setDialogOpen(true);
    };

    const handleNameChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            name: value,
            slug: editingPosition ? prev.slug : generateSlug(value),
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        setSubmitting(true);
        try {
            if (editingPosition) {
                await api.patch(`/management-positions/${editingPosition.id}`, formData);
                setSnackbar({ open: true, message: `Đã cập nhật chức vụ "${formData.name}"`, severity: 'success' });
            } else {
                await api.post('/management-positions', formData);
                setSnackbar({ open: true, message: `Đã tạo chức vụ "${formData.name}"`, severity: 'success' });
            }
            setDialogOpen(false);
            fetchPositions();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (pos: ManagementPosition) => {
        if (!window.confirm(`Xóa chức vụ "${pos.name}"?\n\nTất cả nhân sự đang giữ chức vụ này sẽ bị gỡ chức vụ.`)) return;
        try {
            await api.delete(`/management-positions/${pos.id}`);
            setSnackbar({ open: true, message: `Đã xóa chức vụ "${pos.name}"`, severity: 'success' });
            fetchPositions();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Xóa thất bại';
            setSnackbar({ open: true, message: msg, severity: 'error' });
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Định nghĩa các chức vụ quản lý cấp cao cho bộ môn / khoa. Các chức vụ này sẽ được gán cho nhân sự trong tab Nhân sự.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreate}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        bgcolor: '#1e3a8a',
                        '&:hover': { bgcolor: '#1e40af' },
                    }}
                >
                    Thêm chức vụ
                </Button>
            </Box>

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}
            >
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>CHỨC VỤ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>SLUG</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>MÔ TẢ</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569' }}>THAO TÁC</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : positions.length > 0 ? (
                            positions.map((pos) => (
                                <TableRow key={pos.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Badge sx={{ color: '#1e3a8a', fontSize: 20 }} />
                                            <Typography variant="body2" fontWeight={600}>
                                                {pos.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={pos.slug}
                                            size="small"
                                            sx={{
                                                bgcolor: '#eff6ff',
                                                color: '#1e3a8a',
                                                fontWeight: 500,
                                                fontSize: 11,
                                                fontFamily: 'monospace',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                                            {pos.description || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Chỉnh sửa">
                                            <IconButton size="small" onClick={() => handleOpenEdit(pos)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Xóa">
                                            <IconButton size="small" color="error" onClick={() => handleDelete(pos)}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                    <Groups sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                                    <Typography>Chưa có chức vụ quản lý nào. Bấm "Thêm chức vụ" để tạo mới.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Thêm/Sửa */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                    {editingPosition ? 'Chỉnh sửa chức vụ' : 'Thêm chức vụ quản lý mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        <TextField
                            label="Tên chức vụ"
                            placeholder="VD: Trưởng khoa, Phó bộ môn..."
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            fullWidth
                            required
                            autoFocus
                        />
                        <TextField
                            label="Slug (mã định danh)"
                            placeholder="Tự động tạo từ tên"
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toUpperCase() }))}
                            fullWidth
                            helperText="Mã duy nhất, dùng trong code. Tự động tạo từ tên chức vụ."
                            InputProps={{
                                style: { fontFamily: 'monospace' },
                            }}
                        />
                        <TextField
                            label="Mô tả (tuỳ chọn)"
                            placeholder="VD: Quản lý toàn bộ hoạt động của khoa..."
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!formData.name.trim() || submitting}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            bgcolor: '#1e3a8a',
                            '&:hover': { bgcolor: '#1e40af' },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} /> : editingPosition ? 'Lưu thay đổi' : 'Tạo chức vụ'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
