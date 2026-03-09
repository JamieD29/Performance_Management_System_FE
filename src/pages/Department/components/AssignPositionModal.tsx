import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Alert,
} from '@mui/material';
import { Badge } from '@mui/icons-material';
import { api } from '../../../services/api';

interface ManagementPosition {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    managementPosition?: ManagementPosition | null;
}

interface AssignPositionModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

export default function AssignPositionModal({
    open,
    onClose,
    user,
    onSuccess,
}: AssignPositionModalProps) {
    const [positions, setPositions] = useState<ManagementPosition[]>([]);
    const [selectedPositionId, setSelectedPositionId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Load danh sách chức vụ
    useEffect(() => {
        if (open) {
            setError('');
            setLoading(true);
            api
                .get('/management-positions')
                .then((res) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    setPositions(data);
                    // Set giá trị hiện tại
                    setSelectedPositionId(user?.managementPosition?.id || '');
                })
                .catch(() => setError('Không thể tải danh sách chức vụ'))
                .finally(() => setLoading(false));
        }
    }, [open, user]);

    const handleSave = async () => {
        if (!user) return;
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/users/${user.id}/management-position`, {
                positionId: selectedPositionId || null,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemovePosition = async () => {
        if (!user) return;
        if (!window.confirm(`Gỡ chức vụ quản lý của "${user.name}"?`)) return;
        setSubmitting(true);
        setError('');
        try {
            await api.put(`/users/${user.id}/management-position`, {
                positionId: null,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge />
                Gán chức vụ quản lý
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2, mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Gán chức vụ quản lý cho: <strong>{user.name}</strong> ({user.email})
                    </Typography>
                    {user.managementPosition && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Chức vụ hiện tại:
                            </Typography>
                            <Chip
                                label={user.managementPosition.name}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>
                    )}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={28} />
                    </Box>
                ) : positions.length === 0 ? (
                    <Alert severity="warning">
                        Chưa có chức vụ quản lý nào. Vui lòng vào Admin Settings → Chức vụ quản lý để tạo trước.
                    </Alert>
                ) : (
                    <FormControl fullWidth>
                        <InputLabel>Chọn chức vụ</InputLabel>
                        <Select
                            value={selectedPositionId}
                            onChange={(e) => setSelectedPositionId(e.target.value)}
                            label="Chọn chức vụ"
                        >
                            <MenuItem value="">
                                <em>— Không có chức vụ —</em>
                            </MenuItem>
                            {positions.map((pos) => (
                                <MenuItem key={pos.id} value={pos.id}>
                                    <Box>
                                        <Typography variant="body2" fontWeight={500}>
                                            {pos.name}
                                        </Typography>
                                        {pos.description && (
                                            <Typography variant="caption" color="text.secondary">
                                                {pos.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
                <Box>
                    {user.managementPosition && (
                        <Button
                            color="error"
                            onClick={handleRemovePosition}
                            disabled={submitting}
                            sx={{ textTransform: 'none' }}
                        >
                            Gỡ chức vụ
                        </Button>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} sx={{ textTransform: 'none' }}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={submitting || positions.length === 0}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            bgcolor: '#1e3a8a',
                            '&:hover': { bgcolor: '#1e40af' },
                        }}
                    >
                        {submitting ? <CircularProgress size={20} /> : 'Lưu'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
