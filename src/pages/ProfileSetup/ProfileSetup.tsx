// src/pages/ProfileSetup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Stack,
    Fade,
    Grow,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Divider,
    Chip,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
    School as SchoolIcon,
    Business as BusinessIcon,
    WorkspacePremium as WorkspacePremiumIcon,
    MenuBook as MenuBookIcon,
    Badge as BadgeIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';

// --- Interfaces ---
interface DepartmentOption {
    id: string;
    name: string;
    code: string;
}

// --- Constants ---
const ACADEMIC_RANKS = [
    { value: 'Giáo sư', label: 'Giáo sư (GS)' },
    { value: 'Phó giáo sư', label: 'Phó Giáo sư (PGS)' },
    { value: 'Không', label: 'Không có học hàm' },
];

const DEGREES = [
    { value: 'Tiến sĩ', label: 'Tiến sĩ (TS)' },
    { value: 'Thạc sĩ', label: 'Thạc sĩ (ThS)' },
    { value: 'Cử nhân', label: 'Cử nhân (CN)' },
];

const JOB_TITLES = [
    { value: 'Trưởng khoa', label: 'Trưởng khoa' },
    { value: 'Phó khoa', label: 'Phó khoa' },
    { value: 'Trưởng bộ môn', label: 'Trưởng bộ môn' },
    { value: 'Giảng viên chính', label: 'Giảng viên chính' },
    { value: 'Giảng viên', label: 'Giảng viên' },
    { value: 'Trợ giảng', label: 'Trợ giảng' },
    { value: 'Chuyên viên', label: 'Chuyên viên' },
    { value: 'Nghiên cứu viên', label: 'Nghiên cứu viên' },
    { value: 'Giáo vụ', label: 'Giáo vụ' },
    { value: 'Kỹ thuật viên', label: 'Kỹ thuật viên' },
    { value: 'Nhân viên hỗ trợ', label: 'Nhân viên hỗ trợ' },
];

// --- Reusable animated dropdown card ---
function AnimatedField({
    delay,
    children,
}: {
    delay: number;
    children: React.ReactNode;
}) {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <Grow in={show} timeout={600}>
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: '14px',
                    border: '1px solid rgba(25, 118, 210, 0.12)',
                    bgcolor: 'rgba(255,255,255,0.85)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(25, 118, 210, 0.15)',
                        borderColor: 'rgba(25, 118, 210, 0.35)',
                    },
                }}
            >
                {children}
            </Paper>
        </Grow>
    );
}

export default function ProfileSetup() {
    const navigate = useNavigate();

    // Form state
    const [departmentId, setDepartmentId] = useState('');
    const [academicRank, setAcademicRank] = useState('');
    const [degree, setDegree] = useState('');
    const [jobTitle, setJobTitle] = useState('');

    // Data & UI state
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch departments on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get('/departments');
                const data = Array.isArray(res.data) ? res.data : res.data.data || [];
                setDepartments(data);
            } catch (err) {
                console.error('Failed to load departments:', err);
                setError('Không thể tải danh sách bộ môn. Vui lòng thử lại.');
            } finally {
                setLoadingDepts(false);
            }
        })();
    }, []);

    const isFormComplete =
        departmentId !== '' &&
        academicRank !== '' &&
        degree !== '' &&
        jobTitle !== '';

    // Labels cho hiển thị
    const selectedDeptName =
        departments.find((d) => d.id === departmentId)?.name || '';
    const selectedRankLabel =
        ACADEMIC_RANKS.find((r) => r.value === academicRank)?.label || '';
    const selectedDegreeLabel =
        DEGREES.find((d) => d.value === degree)?.label || '';

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            // PATCH user profile (JWT token xác định user, không cần userId trong URL)
            await api.patch('/users/profile', {
                departmentId,
                academicRank,
                degree,
                jobTitle,
                profileCompleted: true,
            });

            // Update session user
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                user.jobTitle = jobTitle;
                user.academicRank = academicRank;
                user.degree = degree;
                user.profileCompleted = true;
                user.department = { id: departmentId, name: selectedDeptName };
                sessionStorage.setItem('user', JSON.stringify(user));
            }

            setConfirmOpen(false);
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            console.error('Profile setup failed:', err);
            setError(
                err?.response?.data?.message ||
                'Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại.',
            );
            setConfirmOpen(false);
        } finally {
            setSubmitting(false);
        }
    };

    // --- Common dropdown style ---
    const selectSx = {
        borderRadius: '10px',
        bgcolor: '#fff',
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(25, 118, 210, 0.2)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
        },
    };

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                    'linear-gradient(135deg, #e3f2fd 0%, #e0f2f1 35%, #f3e5f5 70%, #e8eaf6 100%)',
                position: 'relative',
                overflowX: 'hidden',
                overflowY: 'auto',
                boxSizing: 'border-box',
                py: 4,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
        >
            {/* Decorative circles */}
            <Box
                sx={{
                    position: 'fixed',
                    top: -120,
                    right: -120,
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(25,118,210,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'fixed',
                    bottom: -100,
                    left: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(0,137,123,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <Fade in timeout={700}>
                <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                    <Stack spacing={3} alignItems="center">
                        {/* Header */}
                        <Fade in timeout={500}>
                            <Box sx={{ textAlign: 'center', mb: 1 }}>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        p: 2,
                                        borderRadius: '20px',
                                        background:
                                            'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                                        color: '#fff',
                                        mb: 2,
                                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                                    }}
                                >
                                    <SchoolIcon sx={{ fontSize: 44 }} />
                                </Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: '#1a237e',
                                        mb: 0.5,
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    Thiết lập hồ sơ
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ color: '#546e7a', maxWidth: 400, mx: 'auto' }}
                                >
                                    Vui lòng cung cấp thông tin cá nhân để hoàn tất đăng ký vào
                                    hệ thống
                                </Typography>
                            </Box>
                        </Fade>

                        {/* Main Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                p: { xs: 3, sm: 4 },
                                borderRadius: '20px',
                                bgcolor: 'rgba(255, 255, 255, 0.75)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.6)',
                                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{ mb: 3, borderRadius: '10px' }}
                                    onClose={() => setError('')}
                                >
                                    {error}
                                </Alert>
                            )}

                            <Stack spacing={2.5}>
                                {/* 1. Bộ môn */}
                                <AnimatedField delay={200}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                p: 0.8,
                                                borderRadius: '10px',
                                                bgcolor: '#e3f2fd',
                                                color: '#1565c0',
                                            }}
                                        >
                                            <BusinessIcon fontSize="small" />
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                                            Bộ môn đang tác nghiệp
                                        </Typography>
                                    </Stack>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Chọn bộ môn</InputLabel>
                                        <Select
                                            value={departmentId}
                                            label="Chọn bộ môn"
                                            onChange={(e: SelectChangeEvent) =>
                                                setDepartmentId(e.target.value)
                                            }
                                            sx={selectSx}
                                            disabled={loadingDepts}
                                        >
                                            {loadingDepts ? (
                                                <MenuItem disabled>
                                                    <CircularProgress size={18} sx={{ mr: 1 }} /> Đang tải...
                                                </MenuItem>
                                            ) : (
                                                departments.map((dept) => (
                                                    <MenuItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>
                                </AnimatedField>

                                {/* 2. Học hàm */}
                                <AnimatedField delay={400}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                p: 0.8,
                                                borderRadius: '10px',
                                                bgcolor: '#fce4ec',
                                                color: '#c62828',
                                            }}
                                        >
                                            <WorkspacePremiumIcon fontSize="small" />
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                                            Học hàm
                                        </Typography>
                                    </Stack>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Chọn học hàm</InputLabel>
                                        <Select
                                            value={academicRank}
                                            label="Chọn học hàm"
                                            onChange={(e: SelectChangeEvent) =>
                                                setAcademicRank(e.target.value)
                                            }
                                            sx={selectSx}
                                        >
                                            {ACADEMIC_RANKS.map((r) => (
                                                <MenuItem key={r.value} value={r.value}>
                                                    {r.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </AnimatedField>

                                {/* 3. Học vị */}
                                <AnimatedField delay={600}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                p: 0.8,
                                                borderRadius: '10px',
                                                bgcolor: '#e8f5e9',
                                                color: '#2e7d32',
                                            }}
                                        >
                                            <MenuBookIcon fontSize="small" />
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                                            Học vị hiện tại
                                        </Typography>
                                    </Stack>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Chọn học vị</InputLabel>
                                        <Select
                                            value={degree}
                                            label="Chọn học vị"
                                            onChange={(e: SelectChangeEvent) =>
                                                setDegree(e.target.value)
                                            }
                                            sx={selectSx}
                                        >
                                            {DEGREES.map((d) => (
                                                <MenuItem key={d.value} value={d.value}>
                                                    {d.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </AnimatedField>

                                {/* 4. Chức vụ */}
                                <AnimatedField delay={800}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                p: 0.8,
                                                borderRadius: '10px',
                                                bgcolor: '#fff3e0',
                                                color: '#e65100',
                                            }}
                                        >
                                            <BadgeIcon fontSize="small" />
                                        </Box>
                                        <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                                            Chức vụ
                                        </Typography>
                                    </Stack>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Chọn chức vụ</InputLabel>
                                        <Select
                                            value={jobTitle}
                                            label="Chọn chức vụ"
                                            onChange={(e: SelectChangeEvent) =>
                                                setJobTitle(e.target.value)
                                            }
                                            sx={selectSx}
                                        >
                                            {JOB_TITLES.map((j) => (
                                                <MenuItem key={j.value} value={j.value}>
                                                    {j.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </AnimatedField>
                            </Stack>

                            {/* Submit Button */}
                            <Grow in={isFormComplete} timeout={500}>
                                <Box sx={{ mt: 4 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        onClick={() => setConfirmOpen(true)}
                                        disabled={!isFormComplete}
                                        startIcon={<CheckCircleIcon />}
                                        sx={{
                                            py: 1.6,
                                            borderRadius: '14px',
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            background:
                                                'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                                            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                                                background:
                                                    'linear-gradient(135deg, #1565c0 0%, #00796b 100%)',
                                            },
                                        }}
                                    >
                                        Hoàn tất đăng ký
                                    </Button>
                                </Box>
                            </Grow>
                        </Paper>

                        {/* Footer */}
                        <Typography
                            variant="caption"
                            sx={{ color: '#78909c', fontSize: '0.8rem' }}
                        >
                            © {new Date().getFullYear()} University of Science — VNUHCM •
                            OKR & KPI Management
                        </Typography>
                    </Stack>
                </Container>
            </Fade>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => !submitting && setConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '18px',
                        p: 1,
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        fontWeight: 700,
                        color: '#e65100',
                    }}
                >
                    <WarningIcon sx={{ color: '#ff9800', fontSize: 28 }} />
                    Xác nhận thông tin
                </DialogTitle>
                <DialogContent>
                    <Typography
                        variant="body2"
                        sx={{ color: '#546e7a', mb: 2.5 }}
                    >
                        Vui lòng kiểm tra kỹ các thông tin dưới đây trước khi xác nhận.
                        Thông tin này sẽ được sử dụng để đăng ký nhân sự vào hệ thống.
                    </Typography>

                    <Stack spacing={2}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: '12px',
                                bgcolor: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#78909c', fontWeight: 500 }}
                                    >
                                        📍 Bộ môn
                                    </Typography>
                                    <Chip
                                        label={selectedDeptName}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                                <Divider />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#78909c', fontWeight: 500 }}
                                    >
                                        🏅 Học hàm
                                    </Typography>
                                    <Chip
                                        label={selectedRankLabel}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#fce4ec',
                                            color: '#c62828',
                                        }}
                                    />
                                </Box>
                                <Divider />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#78909c', fontWeight: 500 }}
                                    >
                                        🎓 Học vị
                                    </Typography>
                                    <Chip
                                        label={selectedDegreeLabel}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#e8f5e9',
                                            color: '#2e7d32',
                                        }}
                                    />
                                </Box>
                                <Divider />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ color: '#78909c', fontWeight: 500 }}
                                    >
                                        💼 Chức vụ
                                    </Typography>
                                    <Chip
                                        label={jobTitle}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            bgcolor: '#fff3e0',
                                            color: '#e65100',
                                        }}
                                    />
                                </Box>
                            </Stack>
                        </Box>

                        <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                            Bạn xác nhận các thông tin trên là <strong>chính xác</strong>?
                            Hệ thống sẽ ghi nhận và phân bổ bạn vào bộ môn tương ứng.
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        disabled={submitting}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            px: 3,
                            color: '#546e7a',
                        }}
                    >
                        Quay lại chỉnh sửa
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={submitting}
                        startIcon={
                            submitting ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <CheckCircleIcon />
                            )
                        }
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 600,
                            background:
                                'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                            '&:hover': {
                                background:
                                    'linear-gradient(135deg, #1565c0 0%, #00796b 100%)',
                            },
                        }}
                    >
                        {submitting ? 'Đang xử lý...' : 'Xác nhận & Hoàn tất'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
