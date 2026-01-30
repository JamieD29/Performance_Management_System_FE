import React from 'react';
import {
  Box,
  Container,
  Grid, // MUI v5 hoặc Grid2 v6
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Groups,
  Warning,
  CheckCircle,
  Business,
  ArrowForward,
  NotificationsActive,
} from '@mui/icons-material';

// --- MOCK DATA ---
const STATS = [
  {
    title: 'Tổng số Bộ môn',
    value: '6',
    icon: <Business />,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    title: 'Tổng Nhân sự',
    value: '148',
    icon: <Groups />,
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    title: 'Tiến độ OKR TB',
    value: '68%',
    icon: <TrendingUp />,
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    title: 'OKR Rủi ro',
    value: '5',
    icon: <Warning />,
    color: '#ef4444',
    bg: '#fef2f2',
  },
];

const TOP_DEPARTMENTS = [
  { name: 'Khoa học Máy tính', progress: 85, staff: 24, status: 'Xuất sắc' },
  { name: 'Công nghệ Phần mềm', progress: 72, staff: 18, status: 'Tốt' },
  { name: 'Hệ thống Thông tin', progress: 60, staff: 15, status: 'Khá' },
  { name: 'Mạng máy tính', progress: 45, staff: 12, status: 'Cần nỗ lực' },
  { name: 'Thị giác máy tính', progress: 30, staff: 8, status: 'Chậm' },
];

const RECENT_ALERTS = [
  {
    id: 1,
    text: 'Bộ môn CNPM chưa cập nhật KR tháng 10',
    time: '2 giờ trước',
    type: 'warning',
  },
  {
    id: 2,
    text: 'Giảng viên Nguyễn Văn A hoàn thành mục tiêu sớm',
    time: '5 giờ trước',
    type: 'success',
  },
  {
    id: 3,
    text: 'Hạn chót thiết lập OKR Q1/2026 sắp đến',
    time: '1 ngày trước',
    type: 'info',
  },
];

// --- COMPONENT CON ---

// 1. Stat Card
const StatCard = ({ item }: { item: any }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    }}
  >
    <CardContent
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="bold"
          sx={{ mb: 0.5 }}
        >
          {item.title.toUpperCase()}
        </Typography>
        <Typography variant="h4" fontWeight="bold" color="#1e293b">
          {item.value}
        </Typography>
      </Box>
      <Avatar
        sx={{
          bgcolor: item.bg,
          color: item.color,
          width: 56,
          height: 56,
          borderRadius: 3,
        }}
      >
        {item.icon}
      </Avatar>
    </CardContent>
  </Card>
);

// 2. Department Performance Row
const DeptPerformanceRow = ({ dept }: { dept: any }) => {
  let color: 'success' | 'primary' | 'warning' | 'error' = 'primary';
  if (dept.progress >= 80) color = 'success';
  else if (dept.progress < 50) color = 'error';
  else if (dept.progress < 70) color = 'warning';

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1" fontWeight="600">
          {dept.name}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="text.secondary">
          {dept.progress}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={dept.progress}
        color={color}
        sx={{ height: 10, borderRadius: 5, bgcolor: '#f1f5f9' }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {dept.staff} nhân sự
        </Typography>
        <Typography
          variant="caption"
          color={color === 'error' ? 'error.main' : 'text.secondary'}
          fontWeight={500}
        >
          {dept.status}
        </Typography>
      </Box>
    </Box>
  );
};

export default function DepartmentOverview() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
          Tổng quan Bộ môn
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Báo cáo hiệu suất và tình hình hoạt động của các đơn vị
        </Typography>
      </Box>

      {/* 1. STATS CARDS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STATS.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <StatCard item={item} />
          </Grid>
        ))}
      </Grid>

      {/* 2. MAIN CONTENT GRID */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN: PERFORMANCE RANKING */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              height: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
                Hiệu suất thực hiện OKR theo Bộ môn
              </Typography>
              <Button endIcon={<ArrowForward />} size="small">
                Xem chi tiết
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {TOP_DEPARTMENTS.map((dept, index) => (
              <DeptPerformanceRow key={index} dept={dept} />
            ))}
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: NOTIFICATIONS / ALERTS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <NotificationsActive color="warning" />
              <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
                Cần chú ý
              </Typography>
            </Box>

            <List>
              {RECENT_ALERTS.map((alert) => (
                <ListItem
                  key={alert.id}
                  disableGutters
                  sx={{ py: 1.5, borderBottom: '1px dashed #e2e8f0' }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          alert.type === 'warning'
                            ? '#fff7ed'
                            : alert.type === 'success'
                              ? '#f0fdf4'
                              : '#eff6ff',
                        color:
                          alert.type === 'warning'
                            ? '#ea580c'
                            : alert.type === 'success'
                              ? '#16a34a'
                              : '#2563eb',
                      }}
                    >
                      {alert.type === 'warning' ? (
                        <Warning fontSize="small" />
                      ) : alert.type === 'success' ? (
                        <CheckCircle fontSize="small" />
                      ) : (
                        <NotificationsActive fontSize="small" />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={alert.text}
                    secondary={alert.time}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500,
                    }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                💡 <b>Mẹo quản lý:</b> Các bộ môn có tiến độ dưới 50% cần được
                nhắc nhở cập nhật Key Result hàng tuần.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
