import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Grid,
  Divider,
  Alert,
  Container,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { Send, FactCheck } from "@mui/icons-material";
import { api } from "../../services/api";
import { confirmAction, showSuccess, showError, showWarning } from "../../utils/swal";

export default function MyEvaluationPage() {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");

  // Form entries for Section III
  const [selfComment, setSelfComment] = useState("");
  const [selfRating, setSelfRating] = useState("");

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const res = await api.get("/performance/cycles");
      const list = res.data || [];
      setCycles(list);
      const active = list.find((c: any) => c.status === "OPEN") || list[0];
      if (active) {
        setSelectedCycleId(active.id);
      } else {
        fetchForm("");
      }
    } catch (e) {
      console.error(e);
      fetchForm("");
    }
  };

  useEffect(() => {
    if (selectedCycleId) {
      fetchForm(selectedCycleId);
    }
  }, [selectedCycleId]);

  const fetchForm = async (cycleId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/okrs/evaluations/my${cycleId ? `?cycleId=${cycleId}` : ""}`);
      const data = res.data;
      setForm(data);
      if (data) {
        setSelfComment(data.selfComment || "");
        setSelfRating(data.selfRating || "");
      } else {
        setSelfComment("");
        setSelfRating("");
      }
    } catch (e) {
      console.error(e);
      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selfRating) {
      showWarning("Thiếu thông tin", "Vui lòng chọn mức Tự xếp loại chất lượng trước khi nộp!");
      return;
    }
    const ok = await confirmAction({
      title: "Nộp Phiếu Đánh Giá?",
      text: "Bạn có chắc chắn muốn nộp Phiếu Đánh Giá không?",
      icon: "question",
      confirmText: "Nộp phiếu",
      confirmColor: "#1976d2",
    });
    if (!ok) return;

    setSaving(true);
    try {
      await api.post("/okrs/evaluations/my/submit", {
        selfComment,
        selfRating,
        cycleId: selectedCycleId,
      });
      showSuccess("Thành công!", "Nộp Phiếu Đánh Giá thành công.");
      fetchForm(selectedCycleId);
    } catch (e) {
      console.error(e);
      showError("Lỗi", "Lỗi khi nộp phiếu. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const isSubmitted = form?.status === "SUBMITTED" || form?.status === "EVALUATED";
  const isEvaluated = form?.status === "EVALUATED";

  const user = form?.user || {};

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#1e3a8a"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <FactCheck /> Hồ Sơ Tự Đánh Giá
          </Typography>
          <Typography color="text.secondary">
            Kiểm tra kết quả tự động từ OKR và nộp Phiếu Đánh Giá Xếp Loại cuối kỳ.
          </Typography>
        </Box>

        {cycles.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 240, bgcolor: "#fff" }}>
            <InputLabel>Chọn kỳ đánh giá</InputLabel>
            <Select
              value={selectedCycleId}
              label="Chọn kỳ đánh giá"
              onChange={(e) => setSelectedCycleId(e.target.value)}
            >
              {cycles.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} {c.status === "OPEN" ? "(Đang mở)" : "(Đã đóng)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {loading ? (
        <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <Typography>Đang tải Phiếu Đánh Giá...</Typography>
        </Paper>
      ) : !form ? (
        <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <Typography>Chưa có dữ liệu Phiếu Đánh Giá cho kỳ này.</Typography>
        </Paper>
      ) : (
        <>
          {isEvaluated && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Phiếu Đánh Giá của bạn đã được Quản lý cấp báo duyệt và xếp loại kết quả cuối cùng.
            </Alert>
          )}
          {form.status === "SUBMITTED" && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Phiếu Đánh Giá đã được nộp và đang chờ Quản lý duyệt.
            </Alert>
          )}

          <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <Typography variant="h5" align="center" fontWeight="bold" sx={{ mb: 1, textTransform: "uppercase" }}>
              Phiếu Đánh Giá, Xếp Loại Chất Lượng Viên Chức
            </Typography>
            <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ mb: 4, color: "text.secondary" }}>
              Kỳ đánh giá: {form.cycle?.name || "Kỳ mặc định"}
            </Typography>

        {/* PHẦN I */}
        <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 2 }}>
          I. THÔNG TIN CÁ NHÂN
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4, px: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography><strong>Họ và tên:</strong> {user.name}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography><strong>MSCB:</strong> {user.staffCode || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography><strong>Email:</strong> {user.email}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography><strong>Đơn vị công tác:</strong> {user.department?.name || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography><strong>Chức vụ:</strong> {user.managementPosition?.name || "Giảng viên"}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* PHẦN II */}
        <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 1 }}>
          II. KẾT QUẢ TỰ ĐÁNH GIÁ LUỒNG OKR
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Kết quả thực hiện chức trách, nhiệm vụ được giao (Đồng bộ tự động từ Bài Tự Khai OKR).
        </Typography>
        {form.okrObjectiveName && (
          <Typography variant="body2" fontWeight={600} color="#2563eb" sx={{ mb: 2 }}>
            📋 OKR Template: {form.okrObjectiveName}
            {form.okrStatus === "COMPLETED" && (
              <Box component="span" sx={{ ml: 1, color: "#16a34a", fontWeight: 700 }}>✓ Đã chốt điểm</Box>
            )}
          </Typography>
        )}

        <TableContainer component={Paper} elevation={0} sx={{ mb: 4, border: "1px solid #cbd5e1" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "8%", textAlign: "center" }}>STT</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "40%" }}>Tiêu chí / Nhiệm vụ</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Điểm Tối Đa</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center", color: "#64748b" }}>Điểm Tự Khai</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center", color: "#1C4D8D" }}>Điểm QL Duyệt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.evaluationData?.map((row: any, i: number) => (
                <TableRow key={row.id || i}>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={500} color="text.secondary">{row.maxScore || 0}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600} color="#64748b">{row.selfScore?.toFixed(1) || 0}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={700} color="#1C4D8D">
                      {row.principalScore != null ? row.principalScore.toFixed(1) : "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: "#f0fdf4" }}>
                <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", color: "#166534" }}>TỔNG ĐIỂM</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#166534" }}>100</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#64748b", fontSize: "1.1rem" }}>
                  {form.selfScoreTotal?.toFixed(1) || 0}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", color: "#1C4D8D", fontSize: "1.1rem" }}>
                  {form.principalScoreTotal != null ? form.principalScoreTotal.toFixed(1) : "—"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        {/* PHẦN III */}
        <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 2 }}>
          III. TỰ NHẬN XÉT, XẾP LOẠI CHẤT LƯỢNG
        </Typography>
        <Box sx={{ px: 2, mb: 4 }}>
          <Typography fontWeight="bold" sx={{ mb: 1 }}>1. Tự nhận xét ưu/khuyết điểm:</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Viết nhận xét của bạn..."
            value={selfComment}
            onChange={(e) => setSelfComment(e.target.value)}
            disabled={isSubmitted}
            sx={{ mb: 3 }}
          />

          <Typography fontWeight="bold" sx={{ mb: 1 }}>2. Tự xếp loại chất lượng:</Typography>
          <FormControl disabled={isSubmitted} sx={{ ml: 2 }}>
            <RadioGroup row value={selfRating} onChange={(e) => setSelfRating(e.target.value)}>
              <FormControlLabel value="EXCELLENT" control={<Radio color="primary" />} label="Hoàn thành tốt nhiệm vụ (86 - 100 điểm)" />
              <FormControlLabel value="GOOD" control={<Radio color="primary" />} label="Hoàn thành nhiệm vụ (60 - 86 điểm)" />
              <FormControlLabel value="POOR" control={<Radio color="primary" />} label="Không hoàn thành nhiệm vụ (dưới 60 điểm)" />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* PHẦN IV */}
        {isEvaluated && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight="bold" color="#b45309" sx={{ mb: 2 }}>
              IV. KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI (DÀNH CHO CẤP QUẢN LÝ)
            </Typography>
            <Box sx={{ px: 2, p: 3, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fde68a" }}>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>1. Nhận xét của cấp trên:</Typography>
              <Typography sx={{ mb: 3, whiteSpace: "pre-wrap", color: "#1e293b" }}>
                {form.managerComment || "Không có nhận xét."}
              </Typography>

              <Typography fontWeight="bold" sx={{ mb: 1 }}>2. Kết quả xếp loại:</Typography>
              <Box sx={{ ml: 2 }}>
                <FormControlLabel
                  control={<Radio checked={form.managerRating === "EXCELLENT"} color="success" readOnly />}
                  label="Hoàn thành tốt nhiệm vụ"
                />
                <br/>
                <FormControlLabel
                  control={<Radio checked={form.managerRating === "GOOD"} color="success" readOnly />}
                  label="Hoàn thành nhiệm vụ"
                />
                <br/>
                <FormControlLabel
                  control={<Radio checked={form.managerRating === "POOR"} color="success" readOnly />}
                  label="Không hoàn thành nhiệm vụ"
                />
              </Box>
            </Box>
          </>
        )}

        {/* Actions */}
        {!isSubmitted && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={saving}
            >
              Nộp Phiếu Đánh Giá
            </Button>
          </Box>
        )}
      </Paper>
    </>
  )}
</Container>
  );
}
