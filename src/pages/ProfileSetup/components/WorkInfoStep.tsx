import { Stack, Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { Business as BusinessIcon, WorkspacePremium as WorkspacePremiumIcon, MenuBook as MenuBookIcon, Badge as BadgeIcon } from '@mui/icons-material';
import { AnimatedField } from './AnimatedField';
import { ACADEMIC_RANKS, DEGREES, JOB_TITLES } from '../constants';
import type { DepartmentOption, ProfileFormData } from '../types';

interface WorkInfoStepProps {
    formData: ProfileFormData;
    onChange: (field: keyof ProfileFormData, value: string) => void;
    departments: DepartmentOption[];
    loadingDepts: boolean;
}

export function WorkInfoStep({ formData, onChange, departments, loadingDepts }: WorkInfoStepProps) {
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
        <Stack spacing={2.5}>
            {/* 1. Đơn vị công tác */}
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
                        Đơn vị công tác
                    </Typography>
                </Stack>
                <FormControl fullWidth size="small">
                    <InputLabel>Chọn đơn vị công tác</InputLabel>
                    <Select
                        value={formData.departmentId}
                        label="Chọn đơn vị công tác"
                        onChange={(e: SelectChangeEvent) => onChange('departmentId', e.target.value)}
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

            {/* 2. Học vị */}
            <AnimatedField delay={400}>
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
                        Học vị
                    </Typography>
                </Stack>
                <FormControl fullWidth size="small">
                    <InputLabel>Chọn học vị</InputLabel>
                    <Select
                        value={formData.degree}
                        label="Chọn học vị"
                        onChange={(e: SelectChangeEvent) => {
                            onChange('degree', e.target.value);
                            if (e.target.value !== 'Tiến sĩ') {
                                onChange('academicRank', 'Không');
                            }
                        }}
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

            {/* 3. Học hàm */}
            <AnimatedField delay={600}>
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
                        value={formData.academicRank}
                        label="Chọn học hàm"
                        onChange={(e: SelectChangeEvent) => onChange('academicRank', e.target.value)}
                        sx={selectSx}
                        disabled={formData.degree !== 'Tiến sĩ'}
                    >
                        {ACADEMIC_RANKS.map((r) => (
                            <MenuItem key={r.value} value={r.value}>
                                {r.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </AnimatedField>

            {/* 4. Chức danh nghề nghiệp */}
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
                        Chức danh nghề nghiệp
                    </Typography>
                </Stack>
                <FormControl fullWidth size="small">
                    <InputLabel>Chọn chức danh nghề nghiệp</InputLabel>
                    <Select
                        value={formData.jobTitle}
                        label="Chọn chức danh nghề nghiệp"
                        onChange={(e: SelectChangeEvent) => onChange('jobTitle', e.target.value)}
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
    );
}
