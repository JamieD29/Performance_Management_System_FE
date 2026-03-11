import { useState, useEffect } from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
    permissionLevel?: 'SYSTEM' | 'KHOA' | 'DON_VI' | 'NONE';
    createdAt: string;
}

export default function ManagementPositionManager() {
    const [positions, setPositions] = useState<ManagementPosition[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPosition, setEditingPosition] = useState<ManagementPosition | null>(null);
    const [formData, setFormData] = useState({ name: '', slug: '', description: '', permissionLevel: 'NONE' });
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
        setFormData({ name: '', slug: '', description: '', permissionLevel: 'NONE' });
        setDialogOpen(true);
    };

    const handleOpenEdit = (pos: ManagementPosition) => {
        setEditingPosition(pos);
        setFormData({
            name: pos.name,
            slug: pos.slug,
            description: pos.description || '',
            permissionLevel: pos.permissionLevel || 'NONE',
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

    const getPermissionLabel = (level?: string) => {
        switch (level) {
            case 'SYSTEM': return 'Cấp Hệ Thống / BGH';
            case 'KHOA': return 'Cấp Khoa';
            case 'DON_VI': return 'Cấp Đơn vị (Bộ môn/Phòng)';
            default: return 'Không cấp quyền';
        }
    };

    const getPermissionColor = (level?: string) => {
        switch (level) {
            case 'SYSTEM': return '#9f1239'; // Cấp cao nhất
            case 'KHOA': return '#1d4ed8'; // Cấp Khoa
            case 'DON_VI': return '#047857'; // Cấp Bộ môn
            default: return '#64748b'; // Không quyền
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2 }}>
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
                        px: 2,
                        py: 0.5,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
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
                sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}
            >
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>CHỨC VỤ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>SLUG</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>MỨC QUYỀN HẠN</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>MÔ TẢ</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#475569' }}>THAO TÁC</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : positions.length > 0 ? (
                            positions.map((pos) => (
                                <TableRow key={pos.id} hover>
                                    <TableCell sx={{ py: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Badge sx={{ color: '#1e3a8a', fontSize: 18 }} />
                                            <Typography variant="body2" fontWeight={600}>
                                                {pos.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ py: 1 }}>
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
                                    <TableCell sx={{ py: 1 }}>
                                        <Chip
                                            label={getPermissionLabel(pos.permissionLevel)}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                color: getPermissionColor(pos.permissionLevel),
                                                borderColor: getPermissionColor(pos.permissionLevel),
                                                fontWeight: 600,
                                                fontSize: 11,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, fontSize: '0.85rem' }}>
                                            {pos.description || '—'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right" sx={{ py: 1 }}>
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
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    <Groups sx={{ fontSize: 32, mb: 1, opacity: 0.3 }} />
                                    <Typography variant="body2">Chưa có chức vụ quản lý nào. Bấm "Thêm chức vụ" để tạo mới.</Typography>
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
                        <FormControl fullWidth>
                            <InputLabel>Mức quản lý / Quyền hạn (Permission Level)</InputLabel>
                            <Select
                                value={formData.permissionLevel}
                                label="Mức quản lý / Quyền hạn (Permission Level)"
                                onChange={(e) => setFormData((prev) => ({ ...prev, permissionLevel: e.target.value }))}
                            >
                                <MenuItem value="NONE">
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Không cấp quyền</Typography>
                                        <Typography variant="caption" color="text.secondary">Chỉ hiển thị như một nhãn danh dự, không can thiệp hệ thống</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="DON_VI">
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Cấp Đơn vị (Bộ môn/Phòng ban)</Typography>
                                        <Typography variant="caption" color="text.secondary">Được quản lý nhân sự thuộc nội bộ phòng/bộ môn quản lý chức vụ</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="KHOA">
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} color="#1d4ed8">Cấp Khoa (Ban CN Khoa)</Typography>
                                        <Typography variant="caption" color="text.secondary">Thấy toàn bộ danh sách khoa, không gán quyền</Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="SYSTEM">
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} color="error">Cấp Hệ thống (BGH/BGD)</Typography>
                                        <Typography variant="caption" color="text.secondary">View all</Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
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
