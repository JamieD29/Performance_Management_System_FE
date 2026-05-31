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
import { showWarning } from "../../../utils/swal";
import { useTranslation } from "react-i18next";

interface EvaluationFormManagerDialogProps {
  open: boolean;
  reportData: any; // UserEvaluation record
  onClose: () => void;
  onSave: (updatedReport: any) => void;
}

export default function EvaluationFormManagerDialog({ open, reportData, onClose, onSave }: EvaluationFormManagerDialogProps) {
  const { t } = useTranslation();
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
      const isEn = localStorage.getItem("i18nextLng") === "en";
      showWarning(
        isEn ? "Missing Information" : "Thiếu thông tin",
        isEn ? "Please rate the employee before saving!" : "Vui lòng xếp loại viên chức trước khi lưu!"
      );
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
            {t("evaluationFormManagerDialog.dialogTitle")}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ bgcolor: "#f8fafc", p: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Typography variant="h5" align="center" fontWeight="bold" sx={{ mb: 1, textTransform: "uppercase" }}>
            {t("evaluationFormManagerDialog.formTitle")}
          </Typography>
          <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ mb: 4 }}>
            {t("evaluationFormManagerDialog.yearLabel", { year: new Date().getFullYear() })}
          </Typography>

          {/* PHẦN I */}
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 2 }}>
            {t("evaluationFormManagerDialog.personalInfoTitle")}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4, px: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>{t("evaluationFormManagerDialog.fullNameLabel")}</strong> {user.name}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>{t("evaluationFormManagerDialog.staffCodeLabel")}</strong> {user.staffCode || "N/A"}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>{t("evaluationFormManagerDialog.emailLabel")}</strong> {user.email}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>{t("evaluationFormManagerDialog.departmentLabel")}</strong> {user.department?.name || "N/A"}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography><strong>{t("evaluationFormManagerDialog.positionLabel")}</strong> {user.managementPosition?.name || t("evaluationFormManagerDialog.defaultPosition")}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* PHẦN II */}
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 1 }}>
            {t("evaluationFormManagerDialog.okrResultsTitle")}
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ mb: 4, border: "1px solid #cbd5e1" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "10%", textAlign: "center" }}>{t("evaluationFormManagerDialog.table.no")}</TableCell>
                  <TableCell sx={{ fontWeight: "bold", width: "50%" }}>{t("evaluationFormManagerDialog.table.criteria")}</TableCell>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>{t("evaluationFormManagerDialog.table.score")}</TableCell>
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
                  <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", color: "#166534" }}>{t("evaluationFormManagerDialog.table.totalScoreLabel")}</TableCell>
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
            {t("evaluationFormManagerDialog.selfEvaluationTitle")}
          </Typography>
          <Box sx={{ px: 2, mb: 4, bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px dashed #cbd5e1" }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("evaluationFormManagerDialog.selfCommentLabel")}</Typography>
            <Typography sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
              {reportData.selfComment || t("evaluationFormManagerDialog.noSelfComment")}
            </Typography>

            <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("evaluationFormManagerDialog.selfRatingLabel")}</Typography>
            <Box sx={{ ml: 2 }}>
              <FormControlLabel
                control={<Radio checked={reportData.selfRating === "EXCELLENT"} color="primary" readOnly />}
                label={t("evaluationFormManagerDialog.ratings.excellent")}
              />
              <br/>
              <FormControlLabel
                control={<Radio checked={reportData.selfRating === "GOOD"} color="primary" readOnly />}
                label={t("evaluationFormManagerDialog.ratings.good")}
              />
              <br/>
              <FormControlLabel
                control={<Radio checked={reportData.selfRating === "POOR"} color="primary" readOnly />}
                label={t("evaluationFormManagerDialog.ratings.poor")}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* PHẦN IV */}
          <Typography variant="h6" fontWeight="bold" color="#b45309" sx={{ mb: 2 }}>
            {t("evaluationFormManagerDialog.managerEvaluationTitle")}
          </Typography>
          <Box sx={{ px: 2, mb: 4, bgcolor: "#fffbeb", p: 3, borderRadius: 2, border: "1px solid #fcd34d" }}>
            <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("evaluationFormManagerDialog.managerCommentLabel")}</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t("evaluationFormManagerDialog.managerCommentPlaceholder")}
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              disabled={isCompleted}
              sx={{ mb: 3, bgcolor: "#fff" }}
            />

            <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("evaluationFormManagerDialog.managerRatingLabel")}</Typography>
            <FormControl disabled={isCompleted} sx={{ ml: 2 }}>
              <RadioGroup row value={managerRating} onChange={(e) => setManagerRating(e.target.value)}>
                <FormControlLabel value="EXCELLENT" control={<Radio color="success" />} label={t("evaluationFormManagerDialog.ratings.excellentSimple")} />
                <FormControlLabel value="GOOD" control={<Radio color="success" />} label={t("evaluationFormManagerDialog.ratings.goodSimple")} />
                <FormControlLabel value="POOR" control={<Radio color="success" />} label={t("evaluationFormManagerDialog.ratings.poorSimple")} />
              </RadioGroup>
            </FormControl>
          </Box>

        </Paper>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">{t("evaluationFormManagerDialog.cancelBtn")}</Button>
        {!isCompleted && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Save />} 
            onClick={handleSave}
            sx={{ px: 3 }}
          >
            {t("evaluationFormManagerDialog.saveBtn")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
