import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Snackbar,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

// 🔥 QUAN TRỌNG: Dùng Grid2 để hỗ trợ prop 'size' và layout flex chuẩn
import Grid from '@mui/material/Grid';

import {
  Save,
  Edit,
  Cancel,
  CameraAlt,
  Badge,
  Email,
  CalendarMonth,
  Business,
  Star,
} from '@mui/icons-material';
import { api } from '../services/api';

// Enum Data
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

export default function ProfileSetting() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  const [departments, setDepartments] = useState<any[]>([]);

  // State cho Avatar
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roles: [] as any[], // Chấp nhận cả String và Object
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

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFormData(originalData);
    setPreviewAvatar(null);
    setAvatarFile(null);
    setIsEditing(false);
    setNotification({ type: 'info', message: 'Đã hủy bỏ thay đổi.' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('file', avatarFile);
        // Upload logic here... (Chưa có API upload thật nên tạm bỏ qua)
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

      setNotification({
        type: 'success',
        message: 'Cập nhật hồ sơ thành công!',
      });
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
      const errorMsg =
        error.response?.data?.message || 'Có lỗi xảy ra khi lưu.';
      setNotification({
        type: 'error',
        message: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // 👇 1. FIX LOGIC HIỂN THỊ ROLE (Để hết bị hiện Lecturer)
  // =========================================================
  const getDisplayRole = (userRoles: any[]) => {
    if (!userRoles || userRoles.length === 0) return 'Lecturer';

    // Chuẩn hóa Role về mảng String
    const roles = userRoles.map((r: any) =>
      typeof r === 'string' ? r : r.slug || r.name,
    );

    if (roles.includes('SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('SYSTEM_ADMIN')) return 'System Admin';
    if (roles.includes('DEAN')) return 'Trưởng bộ môn';
    if (roles.includes('USER')) return 'Giảng viên';

    return 'Lecturer';
  };

  const getRoleColor = (label: string): any => {
    if (label === 'Super Admin') return 'error';
    if (label === 'System Admin') return 'warning';
    if (label === 'Trưởng bộ môn') return 'success';
    return 'primary';
  };

  // Lấy tên bộ môn
  const currentDeptName =
    departments.find((d) => d.id === formData.departmentID)?.name ||
    'Chưa cập nhật';

  const displayRoleLabel = getDisplayRole(formData.roles);
  const displayRoleColor = getRoleColor(displayRoleLabel);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 5 }}>
      {/* Header Title */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
            Hồ sơ cá nhân
          </Typography>
          <Typography color="text.secondary">
            Quản lý thông tin giảng viên & nghiên cứu khoa học
          </Typography>
        </Box>

        {!isEditing ? (
          <Button variant="contained" startIcon={<Edit />} onClick={handleEdit}>
            Chỉnh sửa
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={
                saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={handleSave}
              disabled={saving}
            >
              Lưu lại
            </Button>
          </Box>
        )}
      </Box>

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={notification?.type}
          onClose={() => setNotification(null)}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>

      {/* 🔥 FIX LAYOUT: 
         - Thêm alignItems="stretch" để 2 cột cao bằng nhau
      */}
      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {/* ================= CỘT TRÁI: IDENTITY CARD ================= */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              width: '100%',
              height: '100%', // Kéo full chiều cao
              overflow: 'visible',
              mt: 2, // Margin top để né cái Avatar bay lên
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* 1. Phần Ảnh Bìa */}
            <Box
              sx={{
                height: 120,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                position: 'relative',
              }}
            />

            <CardContent
              sx={{ pt: 0, textAlign: 'center', pb: 4, flexGrow: 1 }}
            >
              {/* 2. Phần Avatar */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: '-60px',
                  mb: 2,
                  position: 'relative',
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: '#1e3a8a',
                      fontSize: 50,
                      border: '4px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                    src={previewAvatar || formData.avatarUrl || undefined}
                  >
                    {!previewAvatar &&
                      !formData.avatarUrl &&
                      formData.name.charAt(0)}
                  </Avatar>

                  {isEditing && (
                    <Tooltip title="Tải ảnh lên">
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 5,
                          right: 5,
                          bgcolor: 'white',
                          boxShadow: 2,
                          '&:hover': { bgcolor: '#f0f9ff' },
                        }}
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <CameraAlt fontSize="small" color="primary" />
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
              </Box>

              {/* 3. Tên và Role (ĐÃ FIX) */}
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {formData.name}
              </Typography>

              <Chip
                label={displayRoleLabel}
                color={displayRoleColor}
                size="small"
                sx={{ mb: 2, fontWeight: 'bold' }}
              />

              <Divider sx={{ my: 2 }} />

              {/* 4. List thông tin */}
              <List
                dense
                sx={{ textAlign: 'left', bgcolor: '#f8fafc', borderRadius: 2 }}
              >
                <ListItem>
                  <ListItemIcon>
                    <Email color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={formData.email}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Business color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Đơn vị công tác"
                    secondary={`${currentDeptName} (${formData.departmentID ? departments.find((d) => d.id === formData.departmentID)?.code : 'N/A'})`}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Badge color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mã cán bộ"
                    secondary={formData.staffCode || 'Chưa cập nhật'}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Star color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Học hàm / Học vị"
                    secondary={`${formData.academicRank !== 'Không' ? formData.academicRank : ''} ${formData.degree}`}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarMonth color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ngày gia nhập"
                    secondary={formData.joinDate || 'Chưa cập nhật'}
                    primaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* ================= CỘT PHẢI: FORM CHI TIẾT ================= */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex' }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              width: '100%',
              height: '100%',
              // 🔥 FIX LAYOUT: Thêm mt: 2 vào đây để nó tụt xuống bằng thằng bên trái
              mt: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#1e3a8a',
                }}
              >
                <Edit /> Chỉnh sửa thông tin
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Mã cán bộ (Staff ID)"
                    value={formData.staffCode}
                    onChange={(e) => handleChange('staffCode', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    variant={isEditing ? 'outlined' : 'filled'}
                  >
                    <InputLabel>Chức vụ / Vị trí</InputLabel>
                    <Select
                      value={formData.jobTitle}
                      label="Chức vụ / Vị trí"
                      onChange={(e) => handleChange('jobTitle', e.target.value)}
                      disabled={!isEditing}
                    >
                      {JOB_TITLES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    variant={isEditing ? 'outlined' : 'filled'}
                  >
                    <InputLabel>Bộ môn</InputLabel>
                    <Select
                      value={formData.departmentID || ''}
                      label="Bộ môn"
                      onChange={(e) =>
                        handleChange('departmentID', e.target.value)
                      }
                      disabled={!isEditing}
                    >
                      <MenuItem value="">
                        <em>Chưa chọn</em>
                      </MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Ngày gia nhập trường"
                    InputLabelProps={{ shrink: true }}
                    value={formData.joinDate}
                    onChange={(e) => handleChange('joinDate', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    variant={isEditing ? 'outlined' : 'filled'}
                  >
                    <InputLabel>Học hàm</InputLabel>
                    <Select
                      value={formData.academicRank}
                      label="Học hàm"
                      onChange={(e) =>
                        handleChange('academicRank', e.target.value)
                      }
                      disabled={!isEditing}
                    >
                      {ACADEMIC_RANKS.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    variant={isEditing ? 'outlined' : 'filled'}
                  >
                    <InputLabel>Học vị</InputLabel>
                    <Select
                      value={formData.degree}
                      label="Học vị"
                      onChange={(e) => handleChange('degree', e.target.value)}
                      disabled={!isEditing}
                    >
                      {DEGREES.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    variant={isEditing ? 'outlined' : 'filled'}
                  >
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      disabled={!isEditing}
                    >
                      {GENDERS.map((g) => (
                        <MenuItem key={g} value={g}>
                          {g}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tổng giờ giảng (tiết/năm)"
                    value={formData.teachingHours}
                    onChange={(e) =>
                      handleChange('teachingHours', e.target.value)
                    }
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    InputProps={{
                      endAdornment: (
                        <Typography variant="caption">Tiết</Typography>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, fontWeight: 'bold' }}
                  >
                    <Star
                      sx={{ mr: 1, verticalAlign: 'middle', color: '#f59e0b' }}
                    />
                    Thành tích & Nghiên cứu
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Khen thưởng & Danh hiệu"
                    value={formData.awards}
                    onChange={(e) => handleChange('awards', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Sở hữu trí tuệ"
                    value={formData.intellectualProperty}
                    onChange={(e) =>
                      handleChange('intellectualProperty', e.target.value)
                    }
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
