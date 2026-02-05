import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Fade,
  InputAdornment,
  Chip, // Đã thêm Chip
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';

// 🔥 Grid chuẩn v7
import Grid from '@mui/material/Grid';

import {
  Save,
  Edit,
  Cancel,
  CameraAlt,
  Person,
  School,
  Star,
  Business,
  Email,
  Badge,
  Wc,
  AccessTime,
  EmojiEvents,
  Lightbulb,
  Work,
  DateRange,
  AdminPanelSettings,
  ChevronRight,
} from '@mui/icons-material';
import { api } from '../services/api';

// --- ENUM DATA ---
const JOB_TITLES = [
  'Trưởng khoa',
  'Phó khoa',
  'Trưởng bộ môn',
  'Giảng viên',
  'Giảng viên chính',
  'Trợ giảng',
  'Giáo vụ',
  'Nghiên cứu viên',
];
const ACADEMIC_RANKS = ['Giáo sư', 'Phó giáo sư', 'Không'];
const DEGREES = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Không'];
const GENDERS = ['Nam', 'Nữ', 'Khác'];

// --- MÀU SẮC THEME ---
const THEME_COLORS = {
  IDENTITY: '#0ea5e9', // Xanh dương
  WORK: '#f59e0b', // Vàng cam
  ACHIEVEMENT: '#8b5cf6', // Tím
};

// --- COMPONENT HIỂN THỊ THÔNG TIN (VIEW MODE) ---
const ProfileField = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <Box sx={{ mb: 3 }}>
    <Typography
      variant="caption"
      sx={{
        color: '#64748b',
        fontWeight: 700,
        textTransform: 'uppercase',
        ml: 1,
        mb: 0.5,
        display: 'block',
        fontSize: '0.75rem',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderRadius: 3,
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: `${color}40`,
        boxShadow: `0 2px 4px ${color}10`,
        transition: 'all 0.2s',
        '&:hover': { borderColor: color, boxShadow: `0 4px 8px ${color}20` },
      }}
    >
      <Box
        sx={{
          color: color,
          mr: 2,
          display: 'flex',
          p: 1,
          borderRadius: '50%',
          bgcolor: `${color}10`,
        }}
      >
        {React.cloneElement(icon as React.ReactElement<any>, {
          fontSize: 'small',
        })}
      </Box>
      <Typography
        variant="body1"
        sx={{ color: '#1e293b', fontWeight: 600, flexGrow: 1 }}
      >
        {value || (
          <span
            style={{ color: '#94a3b8', fontWeight: 400, fontStyle: 'italic' }}
          >
            Chưa cập nhật
          </span>
        )}
      </Typography>
    </Box>
  </Box>
);

// --- STYLE INPUT CHO EDIT MODE ---
const getColorfulInputStyle = (color: string) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: `${color}40` },
    '&:hover fieldset': { borderColor: color },
    '&.Mui-focused fieldset': {
      borderColor: color,
      borderWidth: '2px',
      boxShadow: `0 0 0 3px ${color}15`,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: color, fontWeight: 'bold' },
  '& .MuiInputAdornment-root': { color: color },
});

export default function ProfileSetting() {
  const theme = useTheme();
  // Check màn hình nhỏ để chuyển tab về ngang nếu cần, nhưng ưu tiên dọc theo yêu cầu
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roles: [] as any[],
    jobTitle: '',
    academicRank: 'Không',
    degree: 'Cử nhân',
    teachingHours: 0,
    awards: '',
    intellectualProperty: '',
    joinDate: '',
    gender: 'Nam',
    departmentID: '',
    staffCode: '',
    avatarUrl: '',
  });

  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [deptRes, profileRes] = await Promise.all([
          api.get('/departments'),
          api.get('/users/profile'),
        ]);
        setDepartments(deptRes.data);
        const u = profileRes.data;
        const mappedData = {
          name: u.name || '',
          email: u.email || '',
          roles: u.roles || [],
          jobTitle: u.jobTitle || '',
          academicRank: u.academicRank || 'Không',
          degree: u.degree || 'Cử nhân',
          teachingHours: u.teachingHours || 0,
          awards: u.awards || '',
          intellectualProperty: u.intellectualProperty || '',
          joinDate: u.joinDate ? u.joinDate.split('T')[0] : '',
          gender: u.gender || 'Nam',
          departmentID: u.department ? u.department.id : '',
          staffCode: u.staffCode || '',
          avatarUrl: u.avatarUrl || '',
        };
        setFormData(mappedData);
        setOriginalData(mappedData);
      } catch (error) {
        console.error('Lỗi khởi tạo:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setNotification({ type: 'info', message: 'Chế độ chỉnh sửa đã bật.' });
  };
  const handleCancel = () => {
    setFormData(originalData);
    setPreviewAvatar(null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.staffCode || !formData.departmentID) {
      setNotification({
        type: 'error',
        message: 'Vui lòng điền các trường bắt buộc (*)',
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        jobTitle: formData.jobTitle,
        academicRank: formData.academicRank,
        degree: formData.degree,
        teachingHours: Number(formData.teachingHours),
        awards: formData.awards,
        intellectualProperty: formData.intellectualProperty,
        joinDate: formData.joinDate,
        gender: formData.gender,
        departmentId: formData.departmentID,
        staffCode: formData.staffCode,
        avatarUrl: formData.avatarUrl,
      };
      await api.patch('/users/profile', payload);
      setNotification({ type: 'success', message: 'Lưu thành công!' });
      setOriginalData(formData);
      setAvatarFile(null);
      setIsEditing(false);
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = formData.name;
        sessionStorage.setItem('user', JSON.stringify(user));
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'Lỗi khi lưu' });
    } finally {
      setSaving(false);
    }
  };

  const getDepartmentName = (id: string) =>
    departments.find((d) => d.id === id)?.name || id;

  const getDisplayRole = (userRoles: any[]) => {
    if (!userRoles || userRoles.length === 0) return 'Giảng viên';
    const roles = userRoles.map((r: any) =>
      typeof r === 'string' ? r : r.slug || r.name,
    );
    if (roles.includes('SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('SYSTEM_ADMIN')) return 'System Admin';
    if (roles.includes('DEAN')) return 'Trưởng bộ môn';
    if (roles.includes('USER')) return 'Giảng viên';
    return 'Cán bộ';
  };

  const RequiredLabel = ({ label }: { label: string }) => (
    <span>
      {label} <span style={{ color: '#ef4444' }}>*</span>
    </span>
  );

  // --- RENDER CONTENT ---
  const renderTabContent = () => {
    if (!isEditing) {
      // VIEW MODE
      switch (activeTab) {
        case 0:
          return (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ProfileField
                  icon={<Person />}
                  label="Họ và tên"
                  value={formData.name}
                  color={THEME_COLORS.IDENTITY}
                />
                <ProfileField
                  icon={<Badge />}
                  label="Mã cán bộ"
                  value={formData.staffCode}
                  color={THEME_COLORS.IDENTITY}
                />
                <ProfileField
                  icon={<Email />}
                  label="Email liên hệ"
                  value={formData.email}
                  color={THEME_COLORS.IDENTITY}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ProfileField
                  icon={<Wc />}
                  label="Giới tính"
                  value={formData.gender}
                  color={THEME_COLORS.IDENTITY}
                />
                <ProfileField
                  icon={<DateRange />}
                  label="Ngày vào trường"
                  value={formData.joinDate}
                  color={THEME_COLORS.IDENTITY}
                />
              </Grid>
            </Grid>
          );
        case 1:
          return (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ProfileField
                  icon={<Business />}
                  label="Đơn vị / Bộ môn"
                  value={getDepartmentName(formData.departmentID)}
                  color={THEME_COLORS.WORK}
                />
                <ProfileField
                  icon={<Work />}
                  label="Chức vụ hiện tại"
                  value={formData.jobTitle}
                  color={THEME_COLORS.WORK}
                />
                <ProfileField
                  icon={<AccessTime />}
                  label="Giờ giảng định mức"
                  value={`${formData.teachingHours} tiết / năm`}
                  color={THEME_COLORS.WORK}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ProfileField
                  icon={<School />}
                  label="Học vị"
                  value={formData.degree}
                  color={THEME_COLORS.WORK}
                />
                <ProfileField
                  icon={<School />}
                  label="Học hàm"
                  value={formData.academicRank}
                  color={THEME_COLORS.WORK}
                />
              </Grid>
            </Grid>
          );
        case 2:
          return (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#fbfbfb',
                    borderRadius: 4,
                    border: `1px solid ${THEME_COLORS.ACHIEVEMENT}40`,
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      color: THEME_COLORS.ACHIEVEMENT,
                    }}
                  >
                    <EmojiEvents sx={{ color: '#eab308', mr: 1 }} />
                    <Typography fontWeight="bold" variant="subtitle2">
                      KHEN THƯỞNG & DANH HIỆU
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-line', color: '#334155' }}
                  >
                    {formData.awards || 'Chưa có dữ liệu'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#fbfbfb',
                    borderRadius: 4,
                    border: `1px solid ${THEME_COLORS.ACHIEVEMENT}40`,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      color: THEME_COLORS.ACHIEVEMENT,
                    }}
                  >
                    <Lightbulb sx={{ color: '#eab308', mr: 1 }} />
                    <Typography fontWeight="bold" variant="subtitle2">
                      SỞ HỮU TRÍ TUỆ / CÔNG TRÌNH
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-line', color: '#334155' }}
                  >
                    {formData.intellectualProperty || 'Chưa có dữ liệu'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          );
        default:
          return null;
      }
    }

    // EDIT MODE
    const commonProps = {
      fullWidth: true,
      variant: 'outlined' as const,
      size: 'medium' as const,
    };
    switch (activeTab) {
      case 0:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...commonProps}
                label={<RequiredLabel label="Họ và tên" />}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...commonProps}
                label={<RequiredLabel label="Mã cán bộ" />}
                value={formData.staffCode}
                onChange={(e) => handleChange('staffCode', e.target.value)}
                sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...commonProps}
                disabled
                label="Email"
                value={formData.email}
                sx={{ ...getColorfulInputStyle('#94a3b8'), bgcolor: '#f1f5f9' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl
                fullWidth
                sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
              >
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  label="Giới tính"
                  onChange={(e) => handleChange('gender', e.target.value)}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                      <Wc fontSize="small" />
                    </InputAdornment>
                  }
                >
                  {GENDERS.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                {...commonProps}
                type="date"
                label="Ngày vào trường"
                InputLabelProps={{ shrink: true }}
                value={formData.joinDate}
                onChange={(e) => handleChange('joinDate', e.target.value)}
                sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                sx={getColorfulInputStyle(THEME_COLORS.WORK)}
              >
                <InputLabel>
                  <RequiredLabel label="Đơn vị / Bộ môn" />
                </InputLabel>
                <Select
                  value={formData.departmentID || ''}
                  label={<RequiredLabel label="Đơn vị / Bộ môn" />}
                  onChange={(e) => handleChange('departmentID', e.target.value)}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                      <Business fontSize="small" />
                    </InputAdornment>
                  }
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl
                fullWidth
                sx={getColorfulInputStyle(THEME_COLORS.WORK)}
              >
                <InputLabel>Chức vụ</InputLabel>
                <Select
                  value={formData.jobTitle}
                  label="Chức vụ"
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                      <Work fontSize="small" />
                    </InputAdornment>
                  }
                >
                  {JOB_TITLES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl
                fullWidth
                sx={getColorfulInputStyle(THEME_COLORS.WORK)}
              >
                <InputLabel>Học vị</InputLabel>
                <Select
                  value={formData.degree}
                  label="Học vị"
                  onChange={(e) => handleChange('degree', e.target.value)}
                  startAdornment={
                    <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                      <School fontSize="small" />
                    </InputAdornment>
                  }
                >
                  {DEGREES.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl
                fullWidth
                sx={getColorfulInputStyle(THEME_COLORS.WORK)}
              >
                <InputLabel>Học hàm</InputLabel>
                <Select
                  value={formData.academicRank}
                  label="Học hàm"
                  onChange={(e) => handleChange('academicRank', e.target.value)}
                >
                  {ACADEMIC_RANKS.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                {...commonProps}
                type="number"
                label="Giờ giảng/năm"
                value={formData.teachingHours}
                onChange={(e) => handleChange('teachingHours', e.target.value)}
                sx={getColorfulInputStyle(THEME_COLORS.WORK)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTime />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      Tiết
                    </Typography>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                {...commonProps}
                multiline
                rows={3}
                label="Khen thưởng & Danh hiệu"
                value={formData.awards}
                onChange={(e) => handleChange('awards', e.target.value)}
                sx={getColorfulInputStyle(THEME_COLORS.ACHIEVEMENT)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: 1 }}>
                      <EmojiEvents sx={{ color: '#eab308' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                {...commonProps}
                multiline
                rows={3}
                label="Sở hữu trí tuệ"
                value={formData.intellectualProperty}
                onChange={(e) =>
                  handleChange('intellectualProperty', e.target.value)
                }
                sx={getColorfulInputStyle(THEME_COLORS.ACHIEVEMENT)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: 1 }}>
                      <Lightbulb sx={{ color: '#eab308' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ height: 200, bgcolor: '#3f829f', mb: -10 }} />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        {/* HEADER CARD */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            p: 3,
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            position: 'relative',
            bgcolor: '#fff',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              mt: -8,
              mb: { xs: 2, md: 0 },
              mr: { md: 4 },
            }}
          >
            <Avatar
              sx={{
                width: 140,
                height: 140,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                bgcolor: '#3b82f6',
                fontSize: 50,
              }}
              src={previewAvatar || formData.avatarUrl || undefined}
            >
              {!previewAvatar && !formData.avatarUrl && formData.name.charAt(0)}
            </Avatar>
            {isEditing && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  bgcolor: '#fff',
                  boxShadow: 2,
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <CameraAlt color="primary" fontSize="small" />
              </IconButton>
            )}
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </Box>
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="h4"
              fontWeight="800"
              sx={{ color: '#0f172a', mb: 0.5 }}
            >
              {formData.name || 'Người dùng'}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: 'center',
                color: '#64748b',
              }}
            >
              {getDisplayRole(formData.roles) === 'Super Admin' ? (
                <Chip
                  icon={<AdminPanelSettings fontSize="small" />}
                  label="Super Admin"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              ) : (
                <Typography fontWeight="500">
                  {getDisplayRole(formData.roles)}
                </Typography>
              )}
              <span>•</span>
              <Typography>
                {getDepartmentName(formData.departmentID)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ mt: { xs: 2, md: 0 } }}>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEdit}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Chỉnh sửa
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  sx={{ borderRadius: 3, textTransform: 'none' }}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Lưu
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {/* --- MAIN LAYOUT: VERTICAL TABS (Sidebar) + CONTENT --- */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* LEFT COLUMN: TABS DỌC */}
          <Paper
            elevation={0}
            sx={{
              minWidth: 260,
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              bgcolor: '#fff',
              height: 'fit-content',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                p: 2,
                color: '#94a3b8',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Danh mục
            </Typography>
            <Tabs
              orientation={isMobile ? 'horizontal' : 'vertical'}
              variant="scrollable"
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{
                borderRight: { md: '1px solid #f1f5f9' },
                '& .MuiTabs-indicator': { display: 'none' }, // Ẩn thanh gạch dưới
                '& .MuiTab-root': {
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  textTransform: 'none',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  minHeight: 48,
                  mx: 1.5,
                  my: 0.5,
                  borderRadius: 2, // Bo tròn tab (8px)
                  color: '#64748b',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#f8fafc', color: '#334155' },
                  '&.Mui-selected': {
                    bgcolor:
                      activeTab === 0
                        ? alpha(THEME_COLORS.IDENTITY, 0.1)
                        : activeTab === 1
                          ? alpha(THEME_COLORS.WORK, 0.1)
                          : alpha(THEME_COLORS.ACHIEVEMENT, 0.1),
                    color:
                      activeTab === 0
                        ? THEME_COLORS.IDENTITY
                        : activeTab === 1
                          ? THEME_COLORS.WORK
                          : THEME_COLORS.ACHIEVEMENT,
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <Tab
                label="Thông tin cá nhân"
                icon={<Person />}
                iconPosition="start"
              />
              <Tab
                label="Công việc & Học vấn"
                icon={<School />}
                iconPosition="start"
              />
              <Tab
                label="Thành tích & Khác"
                icon={<Star />}
                iconPosition="start"
              />
            </Tabs>
            <Box sx={{ mb: 2 }} />
          </Paper>

          {/* RIGHT COLUMN: CONTENT */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              bgcolor: '#fff',
              minHeight: 400,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: '#1e293b' }}
              >
                {activeTab === 0 && 'Thông tin cá nhân'}
                {activeTab === 1 && 'Công việc và Học vấn'}
                {activeTab === 2 && 'Thành tích và Nghiên cứu'}
              </Typography>
              {/* <Chip
                size="small"
                label={isEditing ? 'Đang chỉnh sửa' : 'Chế độ xem'}
                color={isEditing ? 'warning' : 'default'}
                variant="outlined"
              /> */}
            </Box>
            <Box sx={{ p: 4 }}>
              <Fade in={true} key={activeTab}>
                <Box>{renderTabContent()}</Box>
              </Fade>
            </Box>
          </Paper>
        </Box>
      </Box>
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={notification?.type as any}
          onClose={() => setNotification(null)}
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
