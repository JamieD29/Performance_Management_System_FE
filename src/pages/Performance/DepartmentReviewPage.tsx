import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import ReviewDetailModal from './components/ReviewDetailModal';

// ... (Interface giữ nguyên) ...
interface DepartmentMember {
  userId: string;
  name: string;
  email: string;
  totalSelfScore: number;
  totalManagerScore: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

interface EvaluationCycle {
  id: string;
  name: string;
}

const DepartmentReviewPage = () => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [cycles, setCycles] = useState<EvaluationCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  // State cho Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const API_URL = 'http://localhost:3000/performance';

  // ... (useEffect load Cycles giữ nguyên) ...
  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await axios.get(`${API_URL}/cycles`);
        setCycles(res.data);
        if (res.data.length > 0) setSelectedCycleId(res.data[0].id);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCycles();
  }, []);

  // ... (useEffect load Members giữ nguyên) ...
  const fetchOverview = async () => {
    if (!selectedCycleId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/manager/overview?cycleId=${selectedCycleId}`,
      );
      console.log('🐛 Dữ liệu API:', res.data);
      setMembers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedCycleId]);

  // 🔥 TÍNH TOÁN SỐ LIỆU THỐNG KÊ (BOTTOM-UP AGGREGATION)
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const pendingCount = members.filter((m) => m.status === 'PENDING').length;
    const approvedCount = members.filter((m) => m.status === 'APPROVED').length;

    // Tính điểm trung bình bộ môn (chỉ tính những người đã nộp)
    const totalScore = members.reduce(
      (sum, m) => sum + (m.totalManagerScore || m.totalSelfScore),
      0,
    );
    const avgScore =
      totalMembers > 0 ? (totalScore / totalMembers).toFixed(1) : 0;

    return { totalMembers, pendingCount, approvedCount, avgScore };
  }, [members]);

  // Hàm render status (giữ nguyên)
  const renderStatus = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip
            icon={<CheckCircle size={14} />}
            label="Đã duyệt"
            color="success"
            size="small"
            variant="outlined"
          />
        );
      case 'PENDING':
        return (
          <Chip
            icon={<Clock size={14} />}
            label="Chờ duyệt"
            color="warning"
            size="small"
            variant="outlined"
          />
        );
      case 'REJECTED':
        return (
          <Chip
            icon={<AlertCircle size={14} />}
            label="Từ chối"
            color="error"
            size="small"
            variant="outlined"
          />
        );
      default:
        return <Chip label="Chưa nộp" size="small" variant="outlined" />;
    }
  };

  return (
    <Container maxWidth="xl" className="py-8">
      {/* HEADER */}
      <Box className="flex justify-between items-end mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            KPI Bộ Môn
          </Typography>
          <Typography className="text-gray-500">
            Tổng hợp và phê duyệt đánh giá hiệu suất
          </Typography>
        </Box>
        <FormControl className="w-64 bg-white" size="small">
          <InputLabel>Kỳ đánh giá</InputLabel>
          <Select
            value={selectedCycleId}
            label="Kỳ đánh giá"
            onChange={(e) => setSelectedCycleId(e.target.value)}
          >
            {cycles.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 🔥 PHẦN MỚI: THẺ THỐNG KÊ (DASHBOARD WIDGETS) */}
      <Grid container spacing={3} className="mb-8">
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="bg-blue-50 border border-blue-100">
            <CardContent className="flex items-center gap-4">
              <Box className="p-3 bg-blue-100 rounded-full text-blue-600">
                <Users size={24} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="text-gray-500 font-bold uppercase"
                >
                  Nhân sự đã nộp
                </Typography>
                <Typography variant="h4" className="font-bold text-gray-800">
                  {stats.totalMembers}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="bg-orange-50 border border-orange-100">
            <CardContent className="flex items-center gap-4">
              <Box className="p-3 bg-orange-100 rounded-full text-orange-600">
                <FileText size={24} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="text-gray-500 font-bold uppercase"
                >
                  Chờ phê duyệt
                </Typography>
                <Typography variant="h4" className="font-bold text-orange-600">
                  {stats.pendingCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="bg-green-50 border border-green-100">
            <CardContent className="flex items-center gap-4">
              <Box className="p-3 bg-green-100 rounded-full text-green-600">
                <TrendingUp size={24} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="text-gray-500 font-bold uppercase"
                >
                  Điểm trung bình
                </Typography>
                <Typography variant="h4" className="font-bold text-green-700">
                  {stats.avgScore}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TABLE CONTENT */}
      <Paper elevation={3} className="overflow-hidden rounded-lg">
        {loading ? (
          <Box className="p-10 flex justify-center">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead className="bg-slate-100">
                <TableRow>
                  <TableCell>
                    <strong>Nhân viên</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Ngày nộp</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Điểm tự chấm</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Điểm duyệt</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Trạng thái</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Thao tác</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length > 0 ? (
                  members.map((mem) => (
                    <TableRow key={mem.userId} hover>
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Avatar
                            sx={{
                              bgcolor: '#1e3a8a',
                              width: 32,
                              height: 32,
                              fontSize: 14,
                            }}
                          >
                            {(mem.name || '?').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography
                            variant="subtitle2"
                            className="font-bold text-gray-700"
                          >
                            {mem.name || 'Không tên'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {mem.email}
                      </TableCell>
                      <TableCell align="center">
                        {mem.submittedAt
                          ? new Date(mem.submittedAt).toLocaleDateString(
                              'vi-VN',
                            )
                          : '-'}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-bold text-blue-600"
                      >
                        {mem.totalSelfScore}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-bold text-green-600"
                      >
                        {mem.totalManagerScore}
                      </TableCell>
                      <TableCell align="center">
                        {renderStatus(mem.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Eye size={16} />}
                          onClick={() => {
                            setSelectedUser({
                              id: mem.userId,
                              name: mem.name || 'Unknown',
                            });
                            setOpenModal(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      className="py-8 text-gray-400"
                    >
                      Chưa có dữ liệu nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* MODAL CHI TIẾT */}
      {selectedUser && (
        <ReviewDetailModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          userId={selectedUser.id}
          userName={selectedUser.name}
          cycleId={selectedCycleId}
          onUpdateSuccess={fetchOverview}
        />
      )}
    </Container>
  );
};

export default DepartmentReviewPage;
