import { useState, useEffect } from 'react'; // 👈 Bổ sung useEffect ở đây
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { NavigateNext, Add, Business, Groups } from '@mui/icons-material';

// Import 2 cục component vừa tạo
import ObjectiveRow from './components/ObjectiveRow';
import CreateOkrDialog from './components/CreateOkrDialog';
import { api } from '../../services/api';

export default function DepartmentOKR() {
  const [tabValue, setTabValue] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [okrs, setOkrs] = useState<any[]>([]);

  // TỰ ĐỘNG TẢI DỮ LIỆU KHI VÀO TRANG
  useEffect(() => {
    fetchOkrs();
  }, []);

  const fetchOkrs = async () => {
    try {
      // Gọi API Lấy danh sách OKR
      const response = await api.get('/okrs/department');
      setOkrs(response.data); // Đổ vào state
    } catch (error) {
      console.error('Lỗi khi tải danh sách OKR:', error);
    }
  };

  // 🚀 HÀM ĐÃ ĐƯỢC SỬA: GỌI API LƯU THẬT XUỐNG DATABASE
  const handleSaveOkr = async (data: any) => {
    try {
      console.log('Chuẩn bị ném xuống Backend:', data);

      // 1. Gửi data xuống Backend để lưu vào PostgreSQL
      await api.post('/okrs/department', data);

      // 2. Đóng popup
      setOpenCreateDialog(false);

      // 3. Gọi lại hàm fetchOkrs để load lại danh sách mới nhất từ DB
      fetchOkrs();

      console.log('✅ Đã lưu OKR vào Database thành công!');
    } catch (error) {
      console.error('❌ Lỗi khi lưu OKR:', error);
      alert('Có lỗi xảy ra khi lưu OKR! Check console để biết thêm chi tiết.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <Business sx={{ mr: 0.5 }} fontSize="inherit" />
          Bộ môn
        </Typography>
        <Typography color="text.primary">Quản lý OKR</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
            Quản lý OKR
          </Typography>
        </Box>
        {/* Nút gọi Popup */}
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Tạo OKR mới
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab
            icon={<Business />}
            iconPosition="start"
            label="Mục tiêu Bộ môn"
          />
          <Tab
            icon={<Groups />}
            iconPosition="start"
            label="Mục tiêu Nhân sự"
          />
        </Tabs>
      </Box>

      {/* HIỂN THỊ BẢNG */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}
      >
        <Table>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell width="50" />
              <TableCell sx={{ fontWeight: 'bold' }}>MỤC TIÊU</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                TIẾN ĐỘ
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                TRẠNG THÁI
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Render danh sách OKR lấy từ Database */}
            {okrs.map((okr) => (
              <ObjectiveRow key={okr.id} row={okr} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* NHÉT POPUP VÀO ĐÂY (Nó ẩn, chỉ hiện khi openCreateDialog = true) */}
      <CreateOkrDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSave={handleSaveOkr}
      />
    </Container>
  );
}
