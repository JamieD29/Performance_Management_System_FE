import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // 👈 Grid V6 chuẩn
import {
  ArrowLeft,
  Users,
  TrendingUp,
  AlertCircle,
  Briefcase,
  ChevronRight,
  BarChart3,
  Home,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api'; // Đảm bảo import đúng axios instance

// Interface khớp với DB của bạn
interface Department {
  id: string;
  name: string;
  code: string;
  // Các trường này Backend nên trả về thêm (nếu join bảng).
  // Nếu chưa có thì Frontend sẽ hiện mặc định/ẩn.
  memberCount?: number;
  headOfDeptName?: string;
}

export default function DepartmentOverview() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // Load danh sách bộ môn thật từ DB
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('Lỗi tải danh sách bộ môn:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- COMPONENT: BREADCRUMBS ---
  const renderBreadcrumbs = () => (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
      <Link
        underline="hover"
        color="inherit"
        href="/"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Home size={16} style={{ marginRight: 4 }} />
        Trang chủ
      </Link>
      <Link
        underline="hover"
        color={!selectedDept ? 'text.primary' : 'inherit'}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setSelectedDept(null);
        }}
        aria-current={!selectedDept ? 'page' : undefined}
      >
        Bộ môn
      </Link>
      {selectedDept && (
        <Typography color="text.primary">{selectedDept.name}</Typography>
      )}
    </Breadcrumbs>
  );

  // --- VIEW 1: DANH SÁCH BỘ MÔN (Grid v6) ---
  if (!selectedDept) {
    return (
      <Box sx={{ p: 3 }}>
        {renderBreadcrumbs()}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
            Tổng quan Khoa
          </Typography>
          <Typography color="text.secondary">
            Danh sách các bộ môn trực thuộc khoa ({departments.length})
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {departments.length > 0 ? (
              departments.map((dept) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        borderColor: '#3b82f6',
                      },
                    }}
                    onClick={() => setSelectedDept(dept)}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start',
                          mb: 2,
                        }}
                      >
                        {/* Hiển thị Mã Bộ Môn (SE, CS...) */}
                        <Avatar
                          sx={{
                            bgcolor: '#eff6ff',
                            color: '#3b82f6',
                            fontWeight: 'bold',
                          }}
                          variant="rounded"
                        >
                          {dept.code}
                        </Avatar>
                        <ChevronRight size={20} className="text-gray-400" />
                      </Box>

                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ minHeight: 50 }}
                      >
                        {dept.name}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {/* Nếu Backend chưa trả về count thì ẩn hoặc hiện 0 */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            color: '#64748b',
                            fontSize: 14,
                          }}
                        >
                          <Users size={16} />
                          <span>{dept.memberCount || 0} nhân sự</span>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            color: '#64748b',
                            fontSize: 14,
                          }}
                        >
                          <Briefcase size={16} />
                          <span className="truncate">
                            Trưởng BM: {dept.headOfDeptName || 'Chưa cập nhật'}
                          </span>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography align="center" color="text.secondary">
                  Chưa có dữ liệu bộ môn.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    );
  }

  // --- VIEW 2: DASHBOARD CHI TIẾT (Khi click vào 1 bộ môn) ---
  // *Lưu ý: Phần Chart và Stats dưới đây nên được gọi API thật dựa trên selectedDept.id*
  return (
    <Box sx={{ p: 3 }}>
      {renderBreadcrumbs()}

      {/* Nút Back Mobile Friendly */}
      <Button
        variant="text"
        startIcon={<ArrowLeft size={18} />}
        onClick={() => setSelectedDept(null)}
        sx={{ mb: 2, color: '#64748b', display: { xs: 'flex', md: 'none' } }}
      >
        Quay lại
      </Button>

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
            {selectedDept.name}
          </Typography>
          <Typography color="text.secondary">
            Báo cáo hiệu suất & Thống kê
          </Typography>
        </Box>
        <Avatar
          sx={{ width: 56, height: 56, bgcolor: '#1e3a8a', fontSize: 20 }}
        >
          {selectedDept.code}
        </Avatar>
      </Box>

      {/* 3 Widgets Thống kê (Cần API real để fill số liệu) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#eff6ff',
              borderRadius: 3,
              border: '1px solid #dbeafe',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 2 }}>
                <Users size={24} color="#3b82f6" />
              </Box>
              <Typography fontWeight="bold" color="#1e3a8a">
                Nhân sự
              </Typography>
            </Box>
            {/* Dùng data thật hoặc fallback */}
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: '#1e40af' }}
            >
              {selectedDept.memberCount || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Giảng viên / Cán bộ
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#f0fdf4',
              borderRadius: 3,
              border: '1px solid #dcfce7',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 2 }}>
                <TrendingUp size={24} color="#16a34a" />
              </Box>
              <Typography fontWeight="bold" color="#14532d">
                KPI Trung bình
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: '#15803d' }}
            >
              --
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chờ dữ liệu kỳ đánh giá
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: '#fff7ed',
              borderRadius: 3,
              border: '1px solid #ffedd5',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 2 }}>
                <AlertCircle size={24} color="#ea580c" />
              </Box>
              <Typography fontWeight="bold" color="#7c2d12">
                Cần xử lý
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: '#c2410c' }}
            >
              0
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hồ sơ chờ duyệt
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart (Placeholder cho Recharts) */}
      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <BarChart3 size={20} className="text-gray-500" />
          <Typography variant="h6" fontWeight="bold">
            Tiến độ (Demo Chart)
          </Typography>
        </Box>
        <Box
          sx={{
            height: 350,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f8fafc',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            Biểu đồ sẽ hiển thị khi có dữ liệu đánh giá chi tiết của{' '}
            {selectedDept.code}.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
