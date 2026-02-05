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
  Container,
  Paper,
  Fade,
  Divider,
} from '@mui/material';

// ✅ CHUẨN MUI v7: Import Grid từ đây và dùng prop 'size'
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
  CalendarMonth,
  Wc,
  AccessTime,
  EmojiEvents,
  Lightbulb,
} from '@mui/icons-material';
import { api } from '../../../services/api';

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

// --- COMPONENT HIỂN THỊ DÒNG THÔNG TIN (VIEW MODE) ---
// Giúp giao diện sạch sẽ, giống hình reference
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start', // Căn trên để nếu text dài xuống dòng vẫn đẹp
      py: 2,
      borderBottom: '1px solid #f0f0f0',
      '&:last-child': { borderBottom: 'none' },
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: { xs: 140, sm: 180 },
        color: 'text.secondary',
      }}
    >
      <Box
        component="span"
        sx={{ mr: 1.5, display: 'flex', color: 'action.active' }}
      >
        {icon}
      </Box>
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body1"
      fontWeight={500}
      sx={{ color: '#1e293b', flexGrow: 1, wordBreak: 'break-word' }}
    >
      {value || (
        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
          Chưa cập nhật
        </span>
      )}
    </Typography>
  </Box>
);

export default function ProfileSetting() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
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

  // --- FETCH DATA ---
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

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({ type: 'error', message: 'Ảnh không được quá 5MB' });
        return;
      }
      setAvatarFile(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setNotification({ type: 'info', message: 'Đang chỉnh sửa thông tin...' });
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
      if (avatarFile) {
        // Upload logic here
      }
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
    } catch (error: any) {
      setNotification({ type: 'error', message: 'Lỗi khi lưu' });
    } finally {
      setSaving(false);
    }
  };

  // --- HELPER ---
  const getDisplayRole = (userRoles: any[]) => {
    if (!userRoles || userRoles.length === 0) return 'Lecturer';
    const roles = userRoles.map((r: any) =>
      typeof r === 'string' ? r : r.slug || r.name,
    );
    if (roles.includes('DEAN')) return 'Trưởng bộ môn';
    if (roles.includes('USER')) return 'Giảng viên';
    return 'Cán bộ';
  };

  const RequiredLabel = ({ label }: { label: string }) => (
    <span>
      {label} <span style={{ color: '#d32f2f' }}>*</span>
    </span>
  );

  const getDepartmentName = (id: string) =>
    departments.find((d) => d.id === id)?.name || id;

  // --- RENDER CONTENT (Logic tách biệt View/Edit) ---
  const renderTabContent = () => {
    // === CHẾ ĐỘ XEM (VIEW MODE) ===
    if (!isEditing) {
      switch (activeTab) {
        case 0: // CÁ NHÂN
          return (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    fontWeight: 'bold',
                  }}
                >
                  Thông tin định danh
                </Typography>
                <InfoRow
                  icon={<Person fontSize="small" />}
                  label="Họ và tên"
                  value={formData.name}
                />
                <InfoRow
                  icon={<Badge fontSize="small" />}
                  label="Mã cán bộ"
                  value={formData.staffCode}
                />
                <InfoRow
                  icon={<Email fontSize="small" />}
                  label="Email"
                  value={formData.email}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    fontWeight: 'bold',
                  }}
                >
                  Thông tin bổ sung
                </Typography>
                <InfoRow
                  icon={<Wc fontSize="small" />}
                  label="Giới tính"
                  value={formData.gender}
                />
                <InfoRow
                  icon={<CalendarMonth fontSize="small" />}
                  label="Ngày gia nhập"
                  value={formData.joinDate}
                />
                <InfoRow
                  icon={<AccessTime fontSize="small" />}
                  label="Tham gia lúc"
                  value="29/04/2021"
                />{' '}
                {/* Ví dụ */}
              </Grid>
            </Grid>
          );
        case 1: // CÔNG VIỆC
          return (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    fontWeight: 'bold',
                  }}
                >
                  Đơn vị & Chức vụ
                </Typography>
                <InfoRow
                  icon={<Business fontSize="small" />}
                  label="Bộ môn"
                  value={getDepartmentName(formData.departmentID)}
                />
                <InfoRow
                  icon={<Person fontSize="small" />}
                  label="Chức vụ"
                  value={formData.jobTitle}
                />
                <InfoRow
                  icon={<AccessTime fontSize="small" />}
                  label="Giờ giảng/năm"
                  value={`${formData.teachingHours} tiết`}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    fontWeight: 'bold',
                  }}
                >
                  Học vấn
                </Typography>
                <InfoRow
                  icon={<School fontSize="small" />}
                  label="Học hàm"
                  value={formData.academicRank}
                />
                <InfoRow
                  icon={<School fontSize="small" />}
                  label="Học vị"
                  value={formData.degree}
                />
              </Grid>
            </Grid>
          );
        case 2: // THÀNH TÍCH
          return (
            <Grid container spacing={4}>
              <Grid size={{ xs: 12 }}>
                <InfoRow
                  icon={
                    <EmojiEvents fontSize="small" sx={{ color: '#f59e0b' }} />
                  }
                  label="Khen thưởng"
                  value={formData.awards}
                />
                <InfoRow
                  icon={
                    <Lightbulb fontSize="small" sx={{ color: '#f59e0b' }} />
                  }
                  label="Sở hữu trí tuệ"
                  value={formData.intellectualProperty}
                />
              </Grid>
            </Grid>
          );
        default:
          return null;
      }
    }

    // === CHẾ ĐỘ SỬA (EDIT MODE) ===
    // Form nhập liệu chuẩn, dùng Grid size v7
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
                error={!formData.name}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...commonProps}
                label={<RequiredLabel label="Mã cán bộ" />}
                value={formData.staffCode}
                onChange={(e) => handleChange('staffCode', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...commonProps}
                label="Email (Cố định)"
                value={formData.email}
                disabled
                sx={{ bgcolor: '#f9fafb' }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  label="Giới tính"
                  onChange={(e) => handleChange('gender', e.target.value)}
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
                label="Ngày gia nhập"
                InputLabelProps={{ shrink: true }}
                value={formData.joinDate}
                onChange={(e) => handleChange('joinDate', e.target.value)}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!formData.departmentID}>
                <InputLabel>
                  <RequiredLabel label="Đơn vị / Bộ môn" />
                </InputLabel>
                <Select
                  value={formData.departmentID || ''}
                  label={<RequiredLabel label="Đơn vị / Bộ môn" />}
                  onChange={(e) => handleChange('departmentID', e.target.value)}
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
              <FormControl fullWidth>
                <InputLabel>Chức vụ</InputLabel>
                <Select
                  value={formData.jobTitle}
                  label="Chức vụ"
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
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
              <FormControl fullWidth>
                <InputLabel>Học vị</InputLabel>
                <Select
                  value={formData.degree}
                  label="Học vị"
                  onChange={(e) => handleChange('degree', e.target.value)}
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
              <FormControl fullWidth>
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
                label="Tổng giờ giảng"
                value={formData.teachingHours}
                onChange={(e) => handleChange('teachingHours', e.target.value)}
                InputProps={{
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
                label="Khen thưởng"
                value={formData.awards}
                onChange={(e) => handleChange('awards', e.target.value)}
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
    <Box sx={{ bgcolor: '#f0f2f5', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* HEADER CARD */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            mb: 3,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              height: { xs: 150, md: 250 },
              background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)',
            }}
          />

          <Box
            sx={{
              px: 4,
              pb: 4,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-end' },
              mt: { xs: -6, md: -4 },
            }}
          >
            <Box
              sx={{ position: 'relative', mr: { md: 3 }, mb: { xs: 2, md: 0 } }}
            >
              <Avatar
                sx={{
                  width: 160,
                  height: 160,
                  border: '4px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  bgcolor: '#1e3a8a',
                  fontSize: 60,
                }}
                src={previewAvatar || formData.avatarUrl || undefined}
              >
                {!previewAvatar &&
                  !formData.avatarUrl &&
                  formData.name.charAt(0)}
              </Avatar>

              {isEditing && (
                <Tooltip title="Đổi ảnh đại diện">
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      bgcolor: '#e4e6eb',
                      '&:hover': { bgcolor: '#d8dadf' },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CameraAlt sx={{ color: 'black' }} />
                  </IconButton>
                </Tooltip>
              )}
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                textAlign: { xs: 'center', md: 'left' },
                mb: { xs: 2, md: 1 },
              }}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ color: '#1c1e21' }}
              >
                {formData.name}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  alignItems: 'center',
                  mt: 0.5,
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {getDisplayRole(formData.roles)}
                </Typography>
                •
                <Typography variant="body2" color="text.secondary">
                  {getDepartmentName(formData.departmentID)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: { xs: 0, md: 2 }, display: 'flex', gap: 1 }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{
                    bgcolor: '#e4e6eb',
                    color: 'black',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#d8dadf' },
                  }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="inherit"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{
                      textTransform: 'none',
                      bgcolor: '#e4e6eb',
                      color: 'black',
                      '&:hover': { bgcolor: '#d8dadf' },
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={
                      saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Save />
                      )
                    }
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ textTransform: 'none', fontWeight: 'bold', px: 3 }}
                  >
                    Lưu thay đổi
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Paper>

        {/* CONTENT CARD */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ borderBottom: '1px solid #e0e0e0', px: 2, pt: 1 }}>
            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 15,
                  minHeight: 50,
                  mr: 1,
                  color: '#65676b',
                  '&.Mui-selected': {
                    color: '#1877f2',
                    borderBottom: '3px solid #1877f2',
                    zIndex: 1,
                  },
                },
                '& .MuiTabs-indicator': { display: 'none' },
              }}
            >
              <Tab label="Thông tin cá nhân" />
              <Tab label="Công việc & Học vấn" />
              <Tab label="Thành tích & Khác" />
            </Tabs>
          </Box>

          <Fade in={true} key={activeTab}>
            <Box sx={{ p: 4, minHeight: 400 }}>
              <Box
                sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {activeTab === 0 && <Person fontSize="large" color="primary" />}
                {activeTab === 1 && <School fontSize="large" color="primary" />}
                {activeTab === 2 && <Star fontSize="large" color="primary" />}
                <Typography variant="h6" fontWeight="bold">
                  {activeTab === 0 && 'Thông tin cá nhân'}
                  {activeTab === 1 && 'Công việc và Học vấn'}
                  {activeTab === 2 && 'Thành tích và Nghiên cứu'}
                </Typography>
              </Box>

              {renderTabContent()}
            </Box>
          </Fade>
        </Paper>
      </Container>

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity={notification?.type}
          onClose={() => setNotification(null)}
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
