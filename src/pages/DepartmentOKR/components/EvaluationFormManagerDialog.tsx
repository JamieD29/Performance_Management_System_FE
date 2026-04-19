import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Grid,
  IconButton,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";

interface EvaluationFormManagerDialogProps {
  open: boolean;
  reportData: any; // UserEvaluation record
  onClose: () => void;
  onSave: (updatedReport: any) => void;
}

export default function EvaluationFormManagerDialog({ open, reportData, onClose, onSave }: EvaluationFormManagerDialogProps) {
  const [managerComment, setManagerComment] = useState("");
  const [managerRating, setManagerRating] = useState("");

  useEffect(() => {
    if (reportData) {
      setManagerComment(reportData.managerComment || "");
      setManagerRating(reportData.managerRating || "");
    }
  }, [reportData]);

  const handleSave = () => {
    if (!managerRating) {
      window.alert("Vui lòng xếp loại viên chức trước khi lưu!");
      return;
    }
    const updatedReport = {
      ...reportData,
      managerComment,
      managerRating
    };
    onSave(updatedReport);
  };

  if (!reportData) return null;

  const isCompleted = reportData.status === "EVALUATED";
  const user = reportData.user || {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#1e293b">
            Xét Duyệt Phiếu Đánh Giá
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ bgcolor: "#f8fafc", p: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Typography variant="h5" align="center" fontWeight="bold" sx={{ mb: 1, textTransform: "uppercase" }}>
            Phiếu Đánh Giá, Xếp Loại Chất Lượng Viên Chức
          </Typography>
          <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ mb: 4 }}>
            Năm: {new Date().getFullYear()}
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
            II. KẾT QUẢ TỰ ĐÁNH GIÁ (Đồng bộ OKR)
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ mb: 4, border: "1px solid #cbd5e1" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "10%", textAlign: "center" }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "50%" }}>Tiêu chí</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Điểm Đánh Giá</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.evaluationData?.map((row: any, i: number) => (
                  <TableRow key={row.id || i}>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600} color="#2563eb">{row.selfScore?.toFixed(1) || 0} / {row.maxScore || 0}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: "#f0fdf4" }}>
                  <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", color: "#166534" }}>TỔNG ĐIỂM CHẤM TỪ OKR</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", color: "#166534", fontSize: "1.1rem" }}>
                    {reportData.selfScoreTotal?.toFixed(1) || 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* PHẦN III */}
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 2 }}>
            III. TỰ NHẬN XÉT, XẾP LOẠI CHẤT LƯỢNG (Của Nhân sự)
          </Typography>
          <Box sx={{ px: 2, mb: 4, bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px dashed #cbd5e1" }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>1. Tự nhận xét ưu/khuyết điểm:</Typography>
            <Typography sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
              {reportData.selfComment || "Không có nhận xét."}
            </Typography>

            <Typography fontWeight="bold" sx={{ mb: 1 }}>2. Tự xếp loại chất lượng:</Typography>
            <Box sx={{ ml: 2 }}>
              <FormControlLabel
                control={<Radio checked={reportData.selfRating === "EXCELLENT"} color="primary" readOnly />}
                label="Hoàn thành tốt nhiệm vụ (86 - 100 điểm)"
              />
              <br/>
              <FormControlLabel
                control={<Radio checked={reportData.selfRating === "GOOD"} color="primary" readOnly />}
                label="Hoàn thành nhiệm vụ (60 - 86 điểm)"
              />
              <br/>
              <FormControlLabel
                control={<Radio checked={reportData.selfRating === "POOR"} color="primary" readOnly />}
                label="Không hoàn thành nhiệm vụ (dưới 60 điểm)"
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* PHẦN IV */}
          <Typography variant="h6" fontWeight="bold" color="#b45309" sx={{ mb: 2 }}>
            IV. KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI VIÊN CHỨC (Bởi Cấp Quản Lý)
          </Typography>
          <Box sx={{ px: 2, mb: 4, bgcolor: "#fffbeb", p: 3, borderRadius: 2, border: "1px solid #fcd34d" }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>1. Nhận xét của Quản lý / Trưởng khoa:</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Ghi nhận xét đánh giá dành cho viên chức..."
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              disabled={isCompleted}
              sx={{ mb: 3, bgcolor: "#fff" }}
            />

            <Typography fontWeight="bold" sx={{ mb: 1 }}>2. Phê duyệt kết quả Xếp loại chất lượng viên chức:</Typography>
            <FormControl disabled={isCompleted} sx={{ ml: 2 }}>
              <RadioGroup row value={managerRating} onChange={(e) => setManagerRating(e.target.value)}>
                <FormControlLabel value="EXCELLENT" control={<Radio color="success" />} label="Hoàn thành tốt nhiệm vụ" />
                <FormControlLabel value="GOOD" control={<Radio color="success" />} label="Hoàn thành nhiệm vụ" />
                <FormControlLabel value="POOR" control={<Radio color="success" />} label="Không hoàn thành nhiệm vụ" />
              </RadioGroup>
            </FormControl>
          </Box>

        </Paper>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Hủy / Đóng</Button>
        {!isCompleted && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Save />} 
            onClick={handleSave}
            sx={{ px: 3 }}
          >
            Lưu Kết Luận Xếp Loại
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
