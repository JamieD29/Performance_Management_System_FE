import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  Alert, // Import thêm Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Lock as LockIcon, // Import thêm LockIcon
} from '@mui/icons-material';
import { performanceService } from '../../services/performanceService';

// --- INTERFACES ---
interface Template {
  id: string;
  content: string;
  unit: string;
  basePoint: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  templates: Template[];
}

interface EvaluationCycle {
  id: string;
  name: string;
  status?: string; // Thêm status để check trạng thái kỳ
}

// Interface cho dữ liệu lịch sử trả về từ API
interface HistoryItem {
  id: string;
  content: string;
  quantity: number;
  selfScore: number;
  managerScore: number;
  evidenceUrl: string;
  template?: { unit: string; basePoint: number };
  category?: { name: string };
  status?: string;
}

// --- COMPONENT CHÍNH ---
const PerformancePage = () => {
  // 1. STATE
  const [tabValue, setTabValue] = useState(0); // 0: Đánh giá, 1: Lịch sử
  const [cycles, setCycles] = useState<EvaluationCycle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');

  // State Input
  const [inputData, setInputData] = useState<
    Record<string, { quantity: number; evidence: string }>
  >({});

  // State History
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

  // Lấy user từ session (thay vì fix cứng ID)
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {};
  const currentUserId = user.id || 'be29e212-c9d2-45dc-b4f6-a4c279e1f9b7'; // Fallback ID cũ của bạn nếu cần

  // 2. LOAD DATA BAN ĐẦU
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cyclesData, templatesData] = await Promise.all([
          performanceService.getCycles(),
          performanceService.getTemplates(),
        ]);
        setCycles(cyclesData);
        setCategories(templatesData);
        if (cyclesData.length > 0) setSelectedCycleId(cyclesData[0].id);
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      }
    };
    fetchData();
  }, []);

  // 3. LOAD HISTORY KHI CHUYỂN TAB HOẶC ĐỔI KỲ
  useEffect(() => {
    if (tabValue === 1 && selectedCycleId) {
      fetchHistory();
    }
  }, [tabValue, selectedCycleId]);

  const fetchHistory = async () => {
    try {
      const data = await performanceService.getMyKpis(
        currentUserId,
        selectedCycleId,
      );
      setHistoryData(data);
    } catch (error) {
      console.error('Lỗi tải lịch sử:', error);
    }
  };

  // 🔥 KIỂM TRA TRẠNG THÁI KỲ ĐÁNH GIÁ (CLOSED hay OPEN)
  const currentCycle = cycles.find((c) => c.id === selectedCycleId);
  const isLocked = currentCycle?.status === 'CLOSED';

  // 4. LOGIC TÍNH TOÁN & SUBMIT
  const handleInputChange = (
    templateId: string,
    field: 'quantity' | 'evidence',
    value: any,
  ) => {
    // Nếu đã khóa thì không cho nhập
    if (isLocked) return;

    setInputData((prev) => ({
      ...prev,
      [templateId]: { ...prev[templateId], [field]: value },
    }));
  };

  const calculateScore = (qty: number, basePoint: number) => {
    return (qty * basePoint).toFixed(2);
  };

  const handleSubmit = async () => {
    if (isLocked) return alert('Kỳ đánh giá đã đóng, không thể gửi!');
    if (!selectedCycleId) return alert('Chọn kỳ đánh giá trước!');

    // Định nghĩa kiểu rõ ràng cho itemsToSubmit
    const itemsToSubmit: {
      categoryId: string;
      templateId: string;
      content: string;
      quantity: number;
      evidenceUrl: string;
    }[] = [];

    categories.forEach((cat) => {
      cat.templates.forEach((temp) => {
        const userInput = inputData[temp.id];
        if (userInput && userInput.quantity > 0) {
          itemsToSubmit.push({
            categoryId: cat.id,
            templateId: temp.id,
            content: temp.content,
            quantity: Number(userInput.quantity),
            evidenceUrl: userInput.evidence || '',
          });
        }
      });
    });

    if (itemsToSubmit.length === 0) return alert('Bạn chưa nhập liệu!');

    try {
      await performanceService.submitKpi(currentUserId, {
        cycleId: selectedCycleId,
        items: itemsToSubmit,
      });
      alert('✅ Gửi thành công! Chuyển sang tab Lịch sử để xem.');
      setTabValue(1); // Tự động chuyển qua tab Lịch sử
      setInputData({}); // Reset form
    } catch (error) {
      alert('❌ Lỗi khi gửi!');
    }
  };

  return (
    <Container maxWidth="lg" className="py-8">
      {/* HEADER & FILTER */}
      <Box className="flex justify-between items-end mb-6 border-b pb-4">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Hiệu suất KPI
          </Typography>
          <Typography className="text-gray-500">
            Quản lý và theo dõi kết quả công việc
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
                {/* Hiển thị trạng thái đóng nếu có */}
                {c.status === 'CLOSED' && (
                  <span
                    style={{
                      color: 'red',
                      fontSize: '0.8rem',
                      marginLeft: '8px',
                    }}
                  >
                    (Đã đóng)
                  </span>
                )}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 🔥 THÔNG BÁO NẾU KỲ ĐÃ ĐÓNG */}
      {isLocked && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Kỳ đánh giá này đã kết thúc.
          </Typography>
          Bạn chỉ có thể xem lại kết quả, không thể chỉnh sửa hoặc nộp bài mới.
        </Alert>
      )}

      {/* TABS NAVIGATION */}
      <Paper className="mb-6">
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab icon={<EditIcon />} label="Nhập Đánh Giá" />
          <Tab icon={<HistoryIcon />} label="Lịch Sử & Kết Quả" />
        </Tabs>
      </Paper>

      {/* === TAB 1: FORM NHẬP LIỆU === */}
      {tabValue === 0 && (
        <Box>
          {categories.map((category) => (
            <Paper
              key={category.id}
              elevation={3}
              className="mb-8 overflow-hidden rounded-lg"
            >
              <Box className="bg-blue-600 p-3 text-white">
                <Typography variant="subtitle1" className="font-bold">
                  {category.name}
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead className="bg-gray-100">
                    <TableRow>
                      <TableCell width="35%">Tiêu chí</TableCell>
                      <TableCell align="center">Đơn vị</TableCell>
                      <TableCell align="center">Điểm chuẩn</TableCell>
                      <TableCell align="center" width="15%">
                        Số lượng
                      </TableCell>
                      <TableCell align="center">Quy đổi</TableCell>
                      <TableCell width="25%">Minh chứng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {category.templates.map((temp) => (
                      <TableRow key={temp.id} hover>
                        <TableCell>{temp.content}</TableCell>
                        <TableCell align="center" className="text-gray-500">
                          {temp.unit}
                        </TableCell>
                        <TableCell
                          align="center"
                          className="font-medium text-blue-600"
                        >
                          {temp.basePoint}
                        </TableCell>
                        <TableCell align="center">
                          {/* 🔥 INPUT SỐ LƯỢNG - Disabled nếu isLocked */}
                          <TextField
                            type="number"
                            size="small"
                            defaultValue={0}
                            disabled={isLocked}
                            onChange={(e) =>
                              handleInputChange(
                                temp.id,
                                'quantity',
                                e.target.value,
                              )
                            }
                            inputProps={{
                              min: 0,
                              style: { textAlign: 'center' },
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          className="font-bold text-red-500"
                        >
                          {calculateScore(
                            inputData[temp.id]?.quantity || 0,
                            temp.basePoint,
                          )}
                        </TableCell>
                        <TableCell>
                          {/* 🔥 INPUT MINH CHỨNG - Disabled nếu isLocked */}
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Link..."
                            disabled={isLocked}
                            onChange={(e) =>
                              handleInputChange(
                                temp.id,
                                'evidence',
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}
          <Box className="flex justify-end gap-4 mt-8 pb-10">
            {/* Ẩn hoặc Vô hiệu hóa nút khi Locked */}
            {!isLocked ? (
              <>
                <Button variant="outlined" startIcon={<SaveIcon />}>
                  Lưu nháp
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SendIcon />}
                  onClick={handleSubmit}
                >
                  Gửi kết quả
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                disabled
                size="large"
                startIcon={<LockIcon />}
              >
                Đã khóa chức năng nộp bài
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* === TAB 2: LỊCH SỬ (READ ONLY) === */}
      {tabValue === 1 && (
        <Paper elevation={3} className="overflow-hidden">
          <TableContainer>
            <Table>
              <TableHead className="bg-gray-800">
                <TableRow>
                  <TableCell className="text-white font-bold">
                    Nhóm / Tiêu chí
                  </TableCell>
                  <TableCell align="center" className="text-white font-bold">
                    Số lượng
                  </TableCell>
                  <TableCell align="center" className="text-white font-bold">
                    Điểm tự chấm
                  </TableCell>
                  <TableCell align="center" className="text-white font-bold">
                    Điểm Sếp duyệt
                  </TableCell>
                  <TableCell align="center" className="text-white font-bold">
                    Trạng thái
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.length > 0 ? (
                  historyData.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography
                          variant="caption"
                          className="text-gray-500 block"
                        >
                          {item.category?.name || 'Không xác định'}
                        </Typography>
                        <Typography variant="body2" className="font-medium">
                          {item.content}
                        </Typography>
                        {item.evidenceUrl && (
                          <a
                            href={item.evidenceUrl}
                            target="_blank"
                            className="text-xs text-blue-500 underline"
                            rel="noreferrer"
                          >
                            Xem minh chứng
                          </a>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.quantity} {item.template?.unit}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-bold text-blue-600"
                      >
                        {item.selfScore}
                      </TableCell>
                      <TableCell
                        align="center"
                        className="font-bold text-green-600"
                      >
                        {item.managerScore}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={
                            item.status === 'APPROVED'
                              ? 'Đã duyệt'
                              : item.status === 'REJECTED'
                                ? 'Từ chối'
                                : 'Chờ duyệt'
                          }
                          color={
                            item.status === 'APPROVED'
                              ? 'success'
                              : item.status === 'REJECTED'
                                ? 'error'
                                : 'warning'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      className="py-8 text-gray-400"
                    >
                      Chưa có dữ liệu nào trong học kỳ này.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default PerformancePage;
