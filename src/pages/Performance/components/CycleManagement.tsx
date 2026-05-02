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
} from "@mui/material";
import {
  Plus,
  Play,
  Pause,
  Calendar,
  RefreshCcw,
} from "lucide-react";
import axios from "axios";
import { api } from "../../../services/api";
import { showSuccess, showError } from "../../../utils/swal";

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

export default function CycleManagement() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  // States for filtering
  const [filterName, setFilterName] = useState("");
  const [filterYear, setFilterYear] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL"); // 'ALL', 'SEMESTER', 'QUARTER', 'OTHER'

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "SEMESTER", // Mặc định là Học kỳ
    startDate: "",
    endDate: "",
  });

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

  const handleCreate = async () => {
    try {
      await api.post(`${RESOURCE_PATH}/admin/cycles`, formData);
      setOpen(false);
      fetchCycles();
      showSuccess("Thành công!", "Tạo kỳ đánh giá thành công.");
    } catch (error) {
      showError("Lỗi", "Không thể tạo kỳ đánh giá. Vui lòng thử lại.");
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await api.put(`${RESOURCE_PATH}/admin/cycles/${id}/status`, {
        status: newStatus,
      });
      fetchCycles();
    } catch (error) {
      showError("Lỗi", "Không thể cập nhật trạng thái.");
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

    // 1. Lọc theo tên (cũng bỏ dấu khi tìm kiếm)
    if (filterName) {
      const normalizedSearch = removeVietnameseTones(filterName);
      if (!normalizedName.includes(normalizedSearch)) {
        return false;
      }
    }
    
    // 2. Lọc theo loại (Học kỳ / Quý / Khác)
    if (filterType !== "ALL") {
      if (c.type !== filterType) {
        // Cần đảm bảo data cũ (chưa có type) sẽ không bị mất bằng cách gán type tạm
        // Nhưng nếu DB đã có type thì nó sẽ có. Để cho an toàn:
        const cycleType = c.type || "OTHER";
        if (cycleType !== filterType) return false;
      }
    }
    
    // 3. Lọc theo năm
    if (filterYear !== "ALL") {
      const match = c.name.match(/\d{4}(?:-\d{4})?/);
      const cycleYear = match ? match[0] : (c.startDate ? new Date(c.startDate).getFullYear().toString() : "");
      if (cycleYear !== filterYear) {
        return false;
      }
    }
    return true;
  });

  return (
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
          <Select
            value={filterYear}
            label="Năm học"
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <MenuItem value="ALL">Tất cả các năm</MenuItem>
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl component="fieldset" className="ml-4">
          <RadioGroup
            row
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <FormControlLabel value="ALL" control={<Radio size="small" />} label="Tất cả" />
            <FormControlLabel value="SEMESTER" control={<Radio size="small" />} label="Học kỳ" />
            <FormControlLabel value="QUARTER" control={<Radio size="small" />} label="Quý" />
            <FormControlLabel value="OTHER" control={<Radio size="small" />} label="Khác" />
          </RadioGroup>
        </FormControl>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell>Tên Kỳ</TableCell>
              <TableCell>Thời gian</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCycles.length > 0 ? (
              filteredCycles.map((cycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} />
                      {cycle.startDate
                        ? new Date(cycle.startDate).toLocaleDateString("vi-VN")
                        : "..."}
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cycle.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                      color={cycle.status === "OPEN" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color={cycle.status === "OPEN" ? "error" : "success"}
                      startIcon={
                        cycle.status === "OPEN" ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )
                      }
                      onClick={() => toggleStatus(cycle.id, cycle.status)}
                    >
                      {cycle.status === "OPEN" ? "Đóng kỳ" : "Mở lại"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  className="py-8 text-gray-400"
                >
                  Chưa có kỳ đánh giá nào. Vui lòng bấm nút{" "}
                  <strong>'Tạo kỳ mới'</strong> để bắt đầu!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL TẠO MỚI (Giữ nguyên) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Tạo Kỳ Đánh Giá Mới</DialogTitle>
        <DialogContent className="flex flex-col gap-4 py-4">
          <TextField
            label="Tên kỳ (VD: Học kỳ 2 - 2026)"
            fullWidth
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <FormControlLabel value="SEMESTER" control={<Radio size="small" />} label="Theo Học kỳ" />
              <FormControlLabel value="QUARTER" control={<Radio size="small" />} label="Theo Quý" />
              <FormControlLabel value="OTHER" control={<Radio size="small" />} label="Khác (Linh hoạt)" />
            </RadioGroup>
          </FormControl>

          <div className="flex gap-4">
            <TextField
              type="date"
              label="Ngày bắt đầu"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
            <TextField
              type="date"
              label="Ngày kết thúc"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreate}>
            Lưu lại
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
