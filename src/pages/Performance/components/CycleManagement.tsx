import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Plus,
  Play,
  Pause,
  Calendar,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { api } from "../../../services/api";
import { showSuccess, showError, showWarning, confirmAction } from "../../../utils/swal";

const RESOURCE_PATH = "/performance";

// Hàm chuẩn hóa chuỗi tiếng Việt (loại bỏ dấu)
const removeVietnameseTones = (str: string) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str.toLowerCase();
};

// Bỏ rowVariants cho từng hàng vì animate trực tiếp thẻ <tr> sẽ làm hỏng cấu trúc bảng và gây ra hiện tượng scrollbar/expand.

const dialogContentVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2 } },
};

export default function CycleManagement() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // States for filtering
  const [filterName, setFilterName] = useState("");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  // Form state — dùng Dayjs cho DatePicker
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("SEMESTER");
  const [formStartDate, setFormStartDate] = useState<Dayjs | null>(null);
  const [formEndDate, setFormEndDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await api.get(`${RESOURCE_PATH}/cycles`);
      setCycles(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormType("SEMESTER");
    setFormStartDate(null);
    setFormEndDate(null);
  };

  const handleCreate = async () => {
    // Frontend validation
    if (!formName.trim()) {
      showWarning("Thiếu thông tin", "Vui lòng nhập tên kỳ đánh giá.");
      return;
    }
    if (!formStartDate || !formEndDate) {
      showWarning("Thiếu thông tin", "Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (formStartDate.isBefore(dayjs().startOf("day"))) {
      showWarning("Ngày không hợp lệ", "Ngày bắt đầu không được ở quá khứ. Vui lòng chọn từ hôm nay trở đi.");
      return;
    }
    if (formEndDate.isBefore(formStartDate) || formEndDate.isSame(formStartDate)) {
      showWarning("Ngày không hợp lệ", "Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }

    try {
      await api.post(`${RESOURCE_PATH}/admin/cycles`, {
        name: formName,
        type: formType,
        startDate: formStartDate.format("YYYY-MM-DD"),
        endDate: formEndDate.format("YYYY-MM-DD"),
      });
      setOpen(false);
      resetForm();
      fetchCycles();
      showSuccess("Thành công!", "Tạo kỳ đánh giá thành công. Kỳ mới ở trạng thái Đã đóng.");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Không thể tạo kỳ đánh giá. Vui lòng thử lại.";
      showError("Lỗi", msg);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string, cycle: any) => {
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";

    // Nếu đang mở kỳ đã kết thúc (quá khứ) → cảnh báo
    if (newStatus === "OPEN" && cycle.endDate) {
      const endDate = dayjs(cycle.endDate);
      if (endDate.isBefore(dayjs().startOf("day"))) {
        const confirmed = await confirmAction({
          title: "⚠️ Kỳ đã kết thúc!",
          text: `Kỳ "${cycle.name}" đã kết thúc vào ${endDate.format("DD/MM/YYYY")}. Mở lại kỳ này có thể cho phép chỉnh sửa dữ liệu cũ. Bạn có chắc chắn muốn tiếp tục?`,
          icon: "warning",
          confirmText: "Vẫn mở kỳ",
          cancelText: "Hủy bỏ",
          confirmColor: "#f59e0b",
        });
        if (!confirmed) return;
      }
    }

    try {
      const res = await api.put(`${RESOURCE_PATH}/admin/cycles/${id}/status`, {
        status: newStatus,
      });
      fetchCycles();

      if (res.data?.isPast && newStatus === "OPEN") {
        showWarning("Lưu ý", "Kỳ này đã kết thúc. Dữ liệu có thể bị ảnh hưởng khi mở lại.");
      }
    } catch (error) {
      showError("Lỗi", "Không thể cập nhật trạng thái.");
    }
  };

  const handleDelete = async (id: string, cycle: any) => {
    const confirmed = await confirmAction({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa kỳ đánh giá "${cycle.name}" không? Thao tác này không thể hoàn tác.`,
      icon: "warning",
      confirmText: "Đồng ý xóa",
      cancelText: "Hủy bỏ",
      confirmColor: "#ef4444",
    });
    if (!confirmed) return;

    try {
      await api.delete(`${RESOURCE_PATH}/admin/cycles/${id}`);
      fetchCycles();
      showSuccess("Thành công!", "Đã xóa kỳ đánh giá.");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        "Không thể xóa kỳ đánh giá. Vui lòng thử lại.";
      showError("Lỗi", msg);
    }
  };

  // Trích xuất danh sách năm học từ dữ liệu
  const availableYears = Array.from(
    new Set(
      cycles.map((c) => {
        const match = c.name.match(/\d{4}(?:-\d{4})?/);
        if (match) return match[0];
        if (c.startDate) return new Date(c.startDate).getFullYear().toString();
        return "N/A";
      }).filter((y) => y !== "N/A")
    )
  ).sort().reverse();

  // Logic lọc dữ liệu
  const filteredCycles = cycles.filter((c) => {
    const normalizedName = removeVietnameseTones(c.name);
    if (filterName) {
      const normalizedSearch = removeVietnameseTones(filterName);
      if (!normalizedName.includes(normalizedSearch)) return false;
    }
    if (filterType !== "ALL") {
      const cycleType = c.type || "OTHER";
      if (cycleType !== filterType) return false;
    }
    if (filterYear !== "ALL") {
      const match = c.name.match(/\d{4}(?:-\d{4})?/);
      const cycleYear = match ? match[0] : (c.startDate ? new Date(c.startDate).getFullYear().toString() : "");
      if (cycleYear !== filterYear) return false;
    }
    return true;
  });

  // Xác định trạng thái thời gian cho Chip
  const getTimeStatus = (cycle: any) => {
    if (!cycle.startDate || !cycle.endDate) return null;
    const today = dayjs().startOf("day");
    const start = dayjs(cycle.startDate);
    const end = dayjs(cycle.endDate);
    if (today.isBefore(start)) return { label: "Chưa bắt đầu", color: "info" as const };
    if (today.isAfter(end)) return { label: "Đã kết thúc", color: "default" as const };
    return { label: "Đang diễn ra", color: "warning" as const };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box>
        <Box className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Quản lý Kỳ Đánh Giá</h3>
          <Box className="flex gap-2">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setOpen(true)}
            >
              Tạo kỳ mới
            </Button>
          </Box>
        </Box>

        {/* FILTER SECTION */}
        <Paper variant="outlined" className="p-4 mb-4 flex flex-wrap gap-4 items-center bg-white">
          <TextField
            label="Tìm kiếm tên kỳ..."
            size="small"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="min-w-[200px]"
          />
          <FormControl size="small" className="min-w-[150px]">
            <InputLabel>Năm học</InputLabel>
            <Select value={filterYear} label="Năm học" onChange={(e) => setFilterYear(e.target.value)}>
              <MenuItem value="ALL">Tất cả các năm</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl component="fieldset" className="ml-4">
            <RadioGroup row value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <FormControlLabel value="ALL" control={<Radio size="small" />} label="Tất cả" />
              <FormControlLabel value="SEMESTER" control={<Radio size="small" />} label="Học kỳ" />
              <FormControlLabel value="QUARTER" control={<Radio size="small" />} label="Quý" />
              <FormControlLabel value="OTHER" control={<Radio size="small" />} label="Khác" />
            </RadioGroup>
          </FormControl>
        </Paper>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell>Tên Kỳ</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="center">Tiến trình</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCycles.length > 0 ? (
                  filteredCycles.map((cycle) => {
                    const timeStatus = getTimeStatus(cycle);
                    return (
                      <TableRow key={cycle.id} hover>
                        <TableCell className="font-medium">{cycle.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>
                              {cycle.startDate
                                ? dayjs(cycle.startDate).format("DD/MM/YYYY")
                                : "..."}
                            </span>
                            <ArrowRight size={14} className="text-gray-400" />
                            <span>
                              {cycle.endDate
                                ? dayjs(cycle.endDate).format("DD/MM/YYYY")
                                : "..."}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          {timeStatus && (
                            <Chip
                              label={timeStatus.label}
                              color={timeStatus.color}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={cycle.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                            color={cycle.status === "OPEN" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box className="flex justify-center gap-2">
                            <Button
                              size="small"
                              color={cycle.status === "OPEN" ? "error" : "success"}
                              startIcon={
                                cycle.status === "OPEN" ? <Pause size={14} /> : <Play size={14} />
                              }
                              onClick={() => toggleStatus(cycle.id, cycle.status, cycle)}
                            >
                              {cycle.status === "OPEN" ? "Đóng kỳ" : "Mở kỳ"}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => handleDelete(cycle.id, cycle)}
                              disabled={cycle.status === "OPEN"}
                              title={
                                cycle.status === "OPEN"
                                  ? "Không thể xóa kỳ đang hoạt động"
                                  : "Xóa kỳ đánh giá"
                              }
                            >
                              <Trash2 size={14} />
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-8 text-gray-400">
                      Chưa có kỳ đánh giá nào. Vui lòng bấm nút{" "}
                      <strong>'Tạo kỳ mới'</strong> để bắt đầu!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>

        {/* MODAL TẠO MỚI — MUI DatePicker + Framer Motion */}
        <Dialog
          open={open}
          onClose={() => { setOpen(false); resetForm(); }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
        >
          <DialogTitle sx={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            color: "white",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
            <Calendar size={22} />
            Tạo Kỳ Đánh Giá Mới
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2, px: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Tên kỳ (VD: Học kỳ 2 - 2026)"
                fullWidth
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Box>

            <FormControl component="fieldset">
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                Loại kỳ đánh giá
              </Typography>
              <RadioGroup
                row
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                <FormControlLabel value="SEMESTER" control={<Radio size="small" />} label="Theo Học kỳ" />
                <FormControlLabel value="QUARTER" control={<Radio size="small" />} label="Theo Quý" />
                <FormControlLabel value="OTHER" control={<Radio size="small" />} label="Khác (Linh hoạt)" />
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: "flex", gap: 2 }}>
              <DatePicker
                label="Ngày bắt đầu"
                value={formStartDate}
                onChange={(val) => setFormStartDate(val)}
                minDate={dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Không được chọn ngày quá khứ",
                  },
                }}
              />
              <DatePicker
                label="Ngày kết thúc"
                value={formEndDate}
                onChange={(val) => setFormEndDate(val)}
                minDate={formStartDate ? formStartDate.add(1, "day") : dayjs().add(1, "day")}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Phải sau ngày bắt đầu",
                  },
                }}
              />
            </Box>

            {/* Preview thông tin — giữ animation mượt khi hiện */}
            <AnimatePresence>
              {formStartDate && formEndDate && formEndDate.isAfter(formStartDate) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: "#f0fdf4",
                      borderColor: "#86efac",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mb: 0.5 }}>
                      📋 Tóm tắt kỳ đánh giá
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thời lượng: <strong>{formEndDate.diff(formStartDate, "day")} ngày</strong>
                      {" "}({formStartDate.format("DD/MM/YYYY")} → {formEndDate.format("DD/MM/YYYY")})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trạng thái mặc định: <Chip label="Đã đóng" size="small" sx={{ ml: 0.5 }} />
                    </Typography>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setOpen(false); resetForm(); }} color="inherit">Hủy</Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!formName.trim() || !formStartDate || !formEndDate}
              sx={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                "&:hover": { background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" },
              }}
            >
              Lưu lại
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
