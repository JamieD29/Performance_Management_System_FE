import { useProfileValidation } from '../../../hooks/useProfileValidation';
import { useState } from 'react';
import { Stack, TextField, Box, Typography } from '@mui/material';
import { Badge as BadgeIcon, Event as EventIcon, Email as EmailIcon, Person as PersonIcon, AssignmentInd as AssignmentIndIcon } from '@mui/icons-material';
import { AnimatedField } from './AnimatedField';
import type { ProfileFormData } from '../types';

interface PersonalInfoStepProps {
    formData: ProfileFormData;
    onChange: (field: keyof ProfileFormData, value: string) => void;
}

export function PersonalInfoStep({ formData, onChange }: PersonalInfoStepProps) {
    const { validateAgeAtJoinDate } = useProfileValidation();
    const [localErrors, setLocalErrors] = useState({ dob: '', joinDate: '' });

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;


    const handleJoinDateChange = (val: string) => {
        onChange('joinDate', val);
        if (formData.dob && val) {
            const { joinDateError } = validateAgeAtJoinDate(formData.dob, val);
            setLocalErrors({ dob: '', joinDate: joinDateError });
        } else {
            setLocalErrors(prev => ({ ...prev, joinDate: '' }));
        }
    };

    const handleDobChange = (val: string) => {
        onChange('dob', val);
        if (val && formData.joinDate) {
            const { dobError } = validateAgeAtJoinDate(val, formData.joinDate);
            setLocalErrors({ dob: dobError, joinDate: '' });
        } else {
            setLocalErrors(prev => ({ ...prev, dob: '' }));
        }
    };

    return (
        <Stack spacing={2.5}>
            {/* Mã cán bộ */}
            <AnimatedField delay={100}>
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                    <Box
                        sx={{
                            display: 'flex',
                            p: 0.8,
                            borderRadius: '10px',
                            bgcolor: '#f3e5f5',
                            color: '#7b1fa2',
                        }}
                    >
                        <AssignmentIndIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                        Mã cán bộ
                    </Typography>
                </Stack>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập mã cán bộ"
                    value={formData.employeeId}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d{1,4}$/.test(val)) {
                            onChange('employeeId', val);
                        }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                        }
                    }}
                />
            </AnimatedField>

            {/* 1. Họ và tên */}
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
                        <PersonIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                        Họ và tên
                    </Typography>
                </Stack>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^[\p{L}\s]+$/u.test(val)) {
                            onChange('fullName', val);
                        }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                        }
                    }}
                />
            </AnimatedField>

            {/* 2. Ngày tháng năm sinh */}
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
                        <EventIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                        Ngày tháng năm sinh
                    </Typography>
                </Stack>
                <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: todayStr }}
                    error={!!localErrors.dob}
                    helperText={localErrors.dob}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                        }
                    }}
                />
            </AnimatedField>

            {/* 3. Email */}
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
                        <EmailIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600} color="#37474f">
                        Email liên lạc
                    </Typography>
                </Stack>
                <TextField
                    fullWidth
                    size="small"
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    value={formData.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    InputProps={{
                        readOnly: true,
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f5f5f5', // Khóa lại
                            borderRadius: '10px',
                            color: '#78909c'
                        }
                    }}
                />
            </AnimatedField>

            {/* 4. Ngày vào trường */}
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
                        Ngày vào trường
                    </Typography>
                </Stack>
                <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleJoinDateChange(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: todayStr }}
                    error={!!localErrors.joinDate}
                    helperText={localErrors.joinDate}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                        }
                    }}
                />
            </AnimatedField>
        </Stack>
    );
}
