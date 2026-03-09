import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Stack,
    Fade,
    Alert,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import {
    School as SchoolIcon,
    CheckCircle as CheckCircleIcon,
    NavigateNext as NavigateNextIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';

import type { DepartmentOption, ProfileFormData } from './types';
import { ACADEMIC_RANKS, DEGREES } from './constants';
import { PersonalInfoStep } from './components/PersonalInfoStep';
import { WorkInfoStep } from './components/WorkInfoStep';
import { ConfirmationDialog } from './components/ConfirmationDialog';

const steps = ['Thông tin cá nhân', 'Thông tin công tác'];

export default function ProfileSetup() {
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);

    // Form state
    const [formData, setFormData] = useState<ProfileFormData>({
        employeeId: '',
        fullName: '',
        dob: '',
        email: '',
        joinDate: '',
        departmentId: '',
        academicRank: '',
        degree: '',
        jobTitle: '',
    });

    // Data & UI state
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch departments and set initial user data on mount
    useEffect(() => {
        // Load initial user data from session
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData((prev) => ({
                    ...prev,
                    fullName: user.fullName || user.name || prev.fullName,
                    email: user.email || prev.email,
                }));
            } catch (e) {
                console.error('Failed to parse user from session', e);
            }
        }

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

    const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const isStep1Complete =
        formData.employeeId.trim() !== '' &&
        formData.fullName.trim() !== '' &&
        formData.dob !== '' &&
        formData.email.trim() !== '' &&
        formData.joinDate !== '';

    const isStep2Complete =
        formData.departmentId !== '' &&
        formData.academicRank !== '' &&
        formData.degree !== '' &&
        formData.jobTitle !== '';

    const handleNext = () => {
        if (activeStep === 0 && isStep1Complete) {
            setActiveStep((prev) => prev + 1);
        } else if (activeStep === 1 && isStep2Complete) {
            setConfirmOpen(true);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    // Labels cho hiển thị
    const selectedDeptName =
        departments.find((d) => d.id === formData.departmentId)?.name || '';
    const selectedRankLabel =
        ACADEMIC_RANKS.find((r) => r.value === formData.academicRank)?.label || '';
    const selectedDegreeLabel =
        DEGREES.find((d) => d.value === formData.degree)?.label || '';

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            // PATCH user profile (JWT token xác định user, không cần userId trong URL)
            // Gửi toàn bộ formData lên API (nếu có các trường API chưa hỗ trợ, chúng có thể bị bỏ qua bởi BE, nhưng cứ gửi đầy đủ)
            await api.patch('/users/profile', {
                ...formData,
                profileCompleted: true,
            });

            // Update session user
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                user.employeeId = formData.employeeId;
                user.jobTitle = formData.jobTitle;
                user.academicRank = formData.academicRank;
                user.degree = formData.degree;
                user.fullName = formData.fullName;
                user.name = formData.fullName; // Update name as it is what the system usually relies on
                user.email = formData.email;
                user.profileCompleted = true;
                user.department = { id: formData.departmentId, name: selectedDeptName };
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
                            {/* Stepper */}
                            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{ mb: 3, borderRadius: '10px' }}
                                    onClose={() => setError('')}
                                >
                                    {error}
                                </Alert>
                            )}

                            {activeStep === 0 && (
                                <PersonalInfoStep formData={formData} onChange={handleFieldChange} />
                            )}
                            {activeStep === 1 && (
                                <WorkInfoStep
                                    formData={formData}
                                    onChange={handleFieldChange}
                                    departments={departments}
                                    loadingDepts={loadingDepts}
                                />
                            )}

                            {/* Navigation Buttons */}
                            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                {activeStep > 0 && (
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={handleBack}
                                        startIcon={<ArrowBackIcon />}
                                        sx={{
                                            py: 1.6,
                                            borderRadius: '14px',
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            flex: 1,
                                            borderColor: 'rgba(25, 118, 210, 0.5)',
                                            color: '#1976d2',
                                            '&:hover': {
                                                borderColor: '#1976d2',
                                                bgcolor: 'rgba(25, 118, 210, 0.04)',
                                            },
                                        }}
                                    >
                                        Quay lại
                                    </Button>
                                )}
                                
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={handleNext}
                                    disabled={activeStep === 0 ? !isStep1Complete : !isStep2Complete}
                                    endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <NavigateNextIcon />}
                                    sx={{
                                        py: 1.6,
                                        borderRadius: '14px',
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        flex: activeStep === 0 ? '1 1 auto' : 2,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #00897b 100%)',
                                        boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)',
                                            background: 'linear-gradient(135deg, #1565c0 0%, #00796b 100%)',
                                        },
                                    }}
                                >
                                    {activeStep === steps.length - 1 ? 'Hoàn tất đăng ký' : 'Tiếp tục'}
                                </Button>
                            </Box>
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
            <ConfirmationDialog
                open={confirmOpen}
                onClose={() => !submitting && setConfirmOpen(false)}
                onSubmit={handleSubmit}
                submitting={submitting}
                formData={formData}
                selectedDeptName={selectedDeptName}
                selectedRankLabel={selectedRankLabel}
                selectedDegreeLabel={selectedDegreeLabel}
                jobTitle={formData.jobTitle}
            />
        </Box>
    );
}
