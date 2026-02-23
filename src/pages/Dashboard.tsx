import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Avatar,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // 👈 Dùng Grid v6 mới nhất
import {
  Target,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  FileText,
  Award,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { performanceService } from '../services/performanceService';

// --- INTERFACES ---
interface DashboardStats {
  myKpiScore: number;
  myKpiStatus: string;
  pendingReviews: number; // Dành cho Manager
  currentCycleName: string;
  hasData: boolean; // Check xem user đã nộp bài chưa
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State lưu dữ liệu tổng hợp
  const [stats, setStats] = useState<DashboardStats>({
    myKpiScore: 0,
    myKpiStatus: 'DRAFT',
    pendingReviews: 0,
    currentCycleName: '...',
    hasData: false,
  });

  // Lấy User từ Session
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};

  // Check quyền Manager (Trưởng khoa / Admin / Dean)
  const roles = user.roles || [];
  // Chuẩn hóa role về mảng string để check cho dễ
  const normalizedRoles = Array.isArray(roles)
    ? roles.map((r: any) => (typeof r === 'string' ? r : r.slug))
    : [];

  const isManager = normalizedRoles.some((r: string) =>
    ['DEAN', 'SUPER_ADMIN', 'SYSTEM_ADMIN', 'MANAGER'].includes(r),
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const token = sessionStorage.getItem('accessToken');
    if (!token || !user.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 1. Lấy kỳ đánh giá mới nhất
      const cycles = await performanceService.getCycles();
      if (cycles.length === 0) {
        setLoading(false);
        setStats((prev) => ({
          ...prev,
          currentCycleName: 'Chưa có kỳ đánh giá',
        }));
        return;
      }
      // Giả sử kỳ đầu tiên là mới nhất (hoặc filter status OPEN)
      const currentCycle =
        cycles.find((c: any) => c.status === 'OPEN') || cycles[0];

      // 2. Lấy KPI Cá nhân trong kỳ đó
      const myKpis = await performanceService.getMyKpis(
        user.id,
        currentCycle.id,
      );

      let totalScore = 0;
      let status = 'DRAFT';
      let hasData = false;

      if (myKpis && myKpis.length > 0) {
        hasData = true;
        status = myKpis[0].status; // Lấy status chung (thường các dòng sẽ giống nhau)
        // Tính tổng điểm (Ưu tiên điểm Sếp chấm nếu có)
        totalScore = myKpis.reduce(
          (sum: number, item: any) =>
            sum + (item.managerScore || item.selfScore),
          0,
        );
      }

      // 3. Nếu là Manager -> Lấy số lượng chờ duyệt
      let pendingCount = 0;
      if (isManager) {
        try {
          const overview = await performanceService.getDepartmentOverview(
            currentCycle.id,
          );
          if (Array.isArray(overview)) {
            pendingCount = overview.filter(
              (m: any) => m.status === 'PENDING',
            ).length;
          }
        } catch (e) {
          console.warn('Chưa tải được dữ liệu Manager:', e);
        }
      }

      setStats({
        myKpiScore: totalScore,
        myKpiStatus: status,
        pendingReviews: pendingCount,
        currentCycleName: currentCycle.name,
        hasData,
      });
    } catch (error) {
      console.error('Lỗi tải Dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Chọn màu cho Status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã Duyệt';
      case 'PENDING':
        return 'Chờ Duyệt';
      case 'REJECTED':
        return 'Từ Chối';
      default:
        return 'Chưa Nộp';
    }
  };

  // Helper: Lời chào theo giờ
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  if (loading)
    return (
      <Box className="flex justify-center p-10 h-screen items-center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ pb: 4 }}>
      {/* 1. WELCOME SECTION */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
            {getGreeting()}, {user.name || 'Thầy/Cô'}! 👋
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Đây là tổng quan hiệu suất trong{' '}
            <strong>{stats.currentCycleName}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography
            variant="subtitle2"
            sx={{ textAlign: 'right', color: '#64748b' }}
          >
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>
      </Box>

      {/* 2. MAIN WIDGETS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* --- WIDGET 1: KPI CÁ NHÂN (QUAN TRỌNG NHẤT) --- */}
        <Grid size={{ xs: 12, md: isManager ? 6 : 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#eff6ff', // Xanh nhạt
              borderRadius: 4,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid #dbeafe',
            }}
          >
            {/* Background Icon Decoration */}
            <Target
              size={120}
              color="#3b82f6"
              style={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                opacity: 0.1,
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#3b82f6' }}>
                  <Award size={20} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
                  Hiệu Suất Cá Nhân
                </Typography>
              </Box>
              <Chip
                label={getStatusLabel(stats.myKpiStatus)}
                color={getStatusColor(stats.myKpiStatus) as any}
                size="small"
                variant="filled"
              />
            </Box>

            {stats.hasData ? (
              <Box>
                <Typography
                  variant="h2"
                  fontWeight="800"
                  sx={{ color: '#1e3a8a', mb: 1 }}
                >
                  {stats.myKpiScore.toFixed(1)}
                  <Typography
                    component="span"
                    variant="h6"
                    sx={{ color: '#64748b', ml: 1 }}
                  >
                    điểm
                  </Typography>
                </Typography>

                {/* Progress Bar Trang Trí */}
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Tiến độ quy đổi
                    </Typography>
                    <Typography variant="caption" fontWeight="bold">
                      {((stats.myKpiScore / 100) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(stats.myKpiScore, 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Button
                  variant="contained"
                  endIcon={<ArrowRight size={18} />}
                  onClick={() => navigate('/performance/evaluate')}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Xem chi tiết kết quả
                </Button>
              </Box>
            ) : (
              <Box sx={{ py: 2 }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Bạn chưa nộp hồ sơ đánh giá cho kỳ này.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/performance/evaluate')}
                  startIcon={<FileText size={18} />}
                >
                  Bắt đầu nhập liệu ngay
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* --- WIDGET 2: MANAGER (CHỈ HIỆN KHI LÀ SẾP) --- */}
        {isManager && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: stats.pendingReviews > 0 ? '#fff7ed' : '#f0fdf4', // Cam nếu có việc, Xanh nếu rảnh
                borderRadius: 4,
                height: '100%',
                border: '1px solid',
                borderColor: stats.pendingReviews > 0 ? '#ffedd5' : '#dcfce7',
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}
              >
                <Avatar
                  sx={{
                    bgcolor: stats.pendingReviews > 0 ? '#ea580c' : '#16a34a',
                  }}
                >
                  <Users size={20} />
                </Avatar>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: stats.pendingReviews > 0 ? '#9a3412' : '#166534',
                  }}
                >
                  Khu Vực Quản Lý
                </Typography>
              </Box>

              {stats.pendingReviews > 0 ? (
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight="800"
                    sx={{ color: '#c2410c' }}
                  >
                    {stats.pendingReviews}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: '#9a3412', mb: 3, fontWeight: 500 }}
                  >
                    hồ sơ nhân sự đang chờ bạn phê duyệt.
                  </Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    endIcon={<ArrowRight size={18} />}
                    onClick={() => navigate('/departments/kpi')}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    Vào duyệt ngay
                  </Button>
                </Box>
              ) : (
                <Box sx={{ py: 2 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}
                  >
                    <CheckCircle
                      size={48}
                      color="#16a34a"
                      style={{ opacity: 0.5 }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ color: '#166534', mb: 1 }}
                  >
                    Tuyệt vời!
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ color: '#166534' }}
                  >
                    Bạn đã hoàn thành tất cả các yêu cầu phê duyệt.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        {/* --- WIDGET 3: QUICK STATS / INFORMATION --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <TrendingUp size={20} className="text-gray-500" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Thống kê nhanh
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Kỳ hiện tại
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {stats.currentCycleName}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái hồ sơ
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={getStatusColor(stats.myKpiStatus) + '.main'}
                  >
                    {getStatusLabel(stats.myKpiStatus)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Hạn chót
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Đang cập nhật...
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
