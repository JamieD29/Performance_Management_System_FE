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
  Checkbox,
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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
  const [bypassValidation, setBypassValidation] = useState(false);

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
    setBypassValidation(false);
  };

  const handleCreate = async () => {
    // Frontend validation
    if (!formName.trim()) {
      showWarning(t("cycleManagement.alerts.missingInfo"), t("cycleManagement.alerts.enterName"));
      return;
    }
    if (!formStartDate || !formEndDate) {
      showWarning(t("cycleManagement.alerts.missingInfo"), t("cycleManagement.alerts.selectDates"));
      return;
    }
    if (!bypassValidation && formStartDate.isBefore(dayjs().startOf("day"))) {
      showWarning(t("cycleManagement.alerts.invalidDate"), t("cycleManagement.alerts.startInPast"));
      return;
    }
    if (formEndDate.isBefore(formStartDate) || formEndDate.isSame(formStartDate)) {
      showWarning(t("cycleManagement.alerts.invalidDate"), t("cycleManagement.alerts.endBeforeStart"));
      return;
    }

    try {
      await api.post(`${RESOURCE_PATH}/admin/cycles`, {
        name: formName,
        type: formType,
        startDate: formStartDate.format("YYYY-MM-DD"),
        endDate: formEndDate.format("YYYY-MM-DD"),
        bypassValidation: bypassValidation,
      });
      setOpen(false);
      resetForm();
      fetchCycles();
      showSuccess(t("cycleManagement.alerts.successTitle"), t("cycleManagement.alerts.createSuccess"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || t("cycleManagement.alerts.createError");
      showError(t("cycleManagement.alerts.errorTitle"), msg);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string, cycle: any) => {
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";

    // Nếu đang mở kỳ đã kết thúc (quá khứ) → cảnh báo
    if (newStatus === "OPEN" && cycle.endDate) {
      const endDate = dayjs(cycle.endDate);
      if (endDate.isBefore(dayjs().startOf("day"))) {
        const confirmed = await confirmAction({
          title: t("cycleManagement.alerts.cycleEndedTitle"),
          text: t("cycleManagement.alerts.cycleEndedText", { name: cycle.name, date: endDate.format("DD/MM/YYYY") }),
          icon: "warning",
          confirmText: t("cycleManagement.alerts.keepOpen"),
          cancelText: t("cycleManagement.alerts.cancel"),
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
        showWarning(t("cycleManagement.alerts.errorTitle"), t("cycleManagement.alerts.pastCycleWarning"));
      }
    } catch (error) {
      showError(t("cycleManagement.alerts.errorTitle"), t("cycleManagement.alerts.updateStatusError"));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmAction({
      title: t("cycleManagement.alerts.deleteConfirmTitle"),
      text: t("cycleManagement.alerts.deleteConfirmText", { name: name }),
      icon: "warning",
      confirmText: t("cycleManagement.alerts.deleteBtn"),
      cancelText: t("cycleManagement.alerts.cancel"),
      confirmColor: "#dc2626",
    });

    if (!confirmed) return;

    try {
      await api.delete(`${RESOURCE_PATH}/admin/cycles/${id}`);
      fetchCycles();
      showSuccess(t("cycleManagement.alerts.successTitle"), t("cycleManagement.alerts.deleteSuccess", { name: name }));
    } catch (error: any) {
      const msg = error?.response?.data?.message || t("cycleManagement.alerts.deleteError");
      showError(t("cycleManagement.alerts.errorTitle"), msg);
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
    if (today.isBefore(start)) return { label: t("cycleManagement.timeStatus.upcoming"), color: "info" as const };
    if (today.isAfter(end)) return { label: t("cycleManagement.timeStatus.completed"), color: "default" as const };
    return { label: t("cycleManagement.timeStatus.inProgress"), color: "warning" as const };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box>
        <Box className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{t("cycleManagement.title")}</h3>
          <Box className="flex gap-2">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setOpen(true)}
            >
              {t("cycleManagement.createBtn")}
            </Button>
          </Box>
        </Box>

        {/* FILTER SECTION */}
        <Paper variant="outlined" className="p-4 mb-4 flex flex-wrap gap-4 items-center bg-white">
          <TextField
            label={t("cycleManagement.searchPlaceholder")}
            size="small"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="min-w-[200px]"
          />
          <FormControl size="small" className="min-w-[150px]">
            <InputLabel>{t("cycleManagement.schoolYear")}</InputLabel>
            <Select value={filterYear} label={t("cycleManagement.schoolYear")} onChange={(e) => setFilterYear(e.target.value)}>
              <MenuItem value="ALL">{t("cycleManagement.allYears")}</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl component="fieldset" className="ml-4">
            <RadioGroup row value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <FormControlLabel value="ALL" control={<Radio size="small" />} label={t("cycleManagement.filterType.all")} />
              <FormControlLabel value="SEMESTER" control={<Radio size="small" />} label={t("cycleManagement.filterType.semester")} />
              <FormControlLabel value="QUARTER" control={<Radio size="small" />} label={t("cycleManagement.filterType.quarter")} />
              <FormControlLabel value="OTHER" control={<Radio size="small" />} label={t("cycleManagement.filterType.other")} />
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
                  <TableCell>{t("cycleManagement.table.headers.name")}</TableCell>
                  <TableCell>{t("cycleManagement.table.headers.time")}</TableCell>
                  <TableCell align="center">{t("cycleManagement.table.headers.progress")}</TableCell>
                  <TableCell align="center">{t("cycleManagement.table.headers.status")}</TableCell>
                  <TableCell align="center">{t("cycleManagement.table.headers.actions")}</TableCell>
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
                            label={cycle.status === "OPEN" ? t("cycleManagement.table.statusOpen") : t("cycleManagement.table.statusClosed")}
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
                              {cycle.status === "OPEN" ? t("cycleManagement.table.actionClose") : t("cycleManagement.table.actionOpen")}
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              disabled={cycle.status === "OPEN"}
                              startIcon={<Trash2 size={14} />}
                              onClick={() => handleDelete(cycle.id, cycle.name)}
                              sx={{
                                borderColor: "#fecaca",
                                color: "#dc2626",
                                "&:hover": {
                                  borderColor: "#dc2626",
                                  backgroundColor: "#fef2f2",
                                },
                                "&.Mui-disabled": {
                                  borderColor: "#e5e7eb",
                                  color: "#9ca3af",
                                },
                              }}
                            >
                              {t("cycleManagement.table.actionDelete")}
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" className="py-8 text-gray-400">
                      {t("cycleManagement.table.empty")}
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
            {t("cycleManagement.dialog.title")}
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2, px: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ mt: 1 }}>
              <TextField
                label={t("cycleManagement.dialog.nameLabel")}
                fullWidth
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Box>

            <FormControl component="fieldset">
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                {t("cycleManagement.dialog.typeLabel")}
              </Typography>
              <RadioGroup
                row
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                <FormControlLabel value="SEMESTER" control={<Radio size="small" />} label={t("cycleManagement.dialog.typeOptions.semester")} />
                <FormControlLabel value="QUARTER" control={<Radio size="small" />} label={t("cycleManagement.dialog.typeOptions.quarter")} />
                <FormControlLabel value="OTHER" control={<Radio size="small" />} label={t("cycleManagement.dialog.typeOptions.other")} />
              </RadioGroup>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={bypassValidation}
                  onChange={(e) => {
                    setBypassValidation(e.target.checked);
                  }}
                  size="small"
                  color="warning"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#d97706" }}>
                  {t("cycleManagement.dialog.bypassValidation")}
                </Typography>
              }
              sx={{ mt: -1 }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <DatePicker
                label={t("cycleManagement.dialog.startDate")}
                value={formStartDate}
                onChange={(val) => setFormStartDate(val)}
                minDate={bypassValidation ? undefined : dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: bypassValidation ? t("cycleManagement.dialog.startDateHelperBypass") : t("cycleManagement.dialog.startDateHelperNormal"),
                  },
                }}
              />
              <DatePicker
                label={t("cycleManagement.dialog.endDate")}
                value={formEndDate}
                onChange={(val) => setFormEndDate(val)}
                minDate={formStartDate ? formStartDate.add(1, "day") : (bypassValidation ? undefined : dayjs().add(1, "day"))}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: t("cycleManagement.dialog.endDateHelper"),
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
                      {t("cycleManagement.dialog.summaryTitle")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("cycleManagement.dialog.summaryDuration", { days: formEndDate.diff(formStartDate, "day") })}
                      {" "}({formStartDate.format("DD/MM/YYYY")} → {formEndDate.format("DD/MM/YYYY")})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("cycleManagement.dialog.summaryStatus")} <Chip label={t("cycleManagement.table.statusClosed")} size="small" sx={{ ml: 0.5 }} />
                    </Typography>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => { setOpen(false); resetForm(); }} color="inherit">{t("cycleManagement.dialog.cancelBtn")}</Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!formName.trim() || !formStartDate || !formEndDate}
              sx={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                "&:hover": { background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" },
              }}
            >
              {t("cycleManagement.dialog.saveBtn")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
