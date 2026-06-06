import { useState, useEffect } from "react";
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
import { Send, FactCheck, PictureAsPdf } from "@mui/icons-material";
import { api } from "../../services/api";
import { confirmAction, showSuccess, showError, showWarning } from "../../utils/swal";
import { useTranslation } from "react-i18next";

// @ts-ignore
import html2pdf from "html2pdf.js";
import EvaluationPdfTemplate from "./components/EvaluationPdfTemplate";

export default function MyEvaluationPage() {
  const { t } = useTranslation();
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
      const res = await api.get("/okrs/my");
      const okrs = res.data || [];

      // Filter unique evaluation cycles from the user's OKR list
      const cycleMap: Record<string, any> = {};
      okrs.forEach((okr: any) => {
        if (okr.cycle) {
          cycleMap[okr.cycle.id] = okr.cycle;
        }
      });
      const list = Object.values(cycleMap);

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
      showWarning(
        t("myEvaluationPage.alerts.missingRatingTitle"),
        t("myEvaluationPage.alerts.missingRating")
      );
      return;
    }
    const ok = await confirmAction({
      title: t("myEvaluationPage.alerts.submitConfirmTitle"),
      text: t("myEvaluationPage.alerts.submitConfirmText"),
      icon: "question",
      confirmText: t("myEvaluationPage.alerts.submitConfirmBtn"),
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
      showSuccess(
        t("myEvaluationPage.alerts.submitSuccessTitle"),
        t("myEvaluationPage.alerts.submitSuccessText")
      );
      fetchForm(selectedCycleId);
    } catch (e) {
      console.error(e);
      showError(
        t("myEvaluationPage.alerts.submitErrorTitle"),
        t("myEvaluationPage.alerts.submitErrorText")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById("evaluation-form-pdf");
    if (!element) return;

    // Normalize Vietnamese characters to tone-free English counterparts
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
      str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
      str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
      str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
      str = str.replace(/Đ/g, "D");
      // Remove special characters
      str = str.replace(/[^a-zA-Z0-9\s]/g, "");
      return str;
    };

    const employeeName = user.name || "Vien_Chuc";
    const cycleName = form?.cycle?.name || "Ky_Danh_Gia";
    const safeEmployeeName = removeVietnameseTones(employeeName).trim().replace(/\s+/g, "_");
    const safeCycleName = removeVietnameseTones(cycleName).trim().replace(/\s+/g, "_");
    const filename = `Phieu_Danh_Gia_${safeEmployeeName}_${safeCycleName}.pdf`;

    const opt = {
      margin: [0, 0, 0, 10],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: "tr" }
    };

    try {
      const exporter = (html2pdf as any).default || html2pdf;
      exporter().from(element).set(opt).save();
    } catch (err) {
      console.error(err);
      showError(
        t("myEvaluationPage.alerts.pdfErrorTitle"),
        t("myEvaluationPage.alerts.pdfErrorText")
      );
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
            <FactCheck /> {t("myEvaluationPage.headerTitle")}
          </Typography>
          <Typography color="text.secondary">
            {t("myEvaluationPage.headerSubtitle")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isEvaluated && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<PictureAsPdf />}
              onClick={handleExportPDF}
              sx={{ fontWeight: "bold" }}
            >
              {t("myEvaluationPage.exportPdfBtn")}
            </Button>
          )}

          {cycles.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 240, bgcolor: "#fff" }}>
              <InputLabel>{t("myEvaluationPage.selectCycleLabel")}</InputLabel>
              <Select
                value={selectedCycleId}
                label={t("myEvaluationPage.selectCycleLabel")}
                onChange={(e) => setSelectedCycleId(e.target.value)}
              >
                {cycles.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} {c.status === "OPEN" ? t("myEvaluationPage.cycleStatus.open") : t("myEvaluationPage.cycleStatus.closed")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </Box>

      {loading ? (
        <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <Typography>{t("myEvaluationPage.states.loading")}</Typography>
        </Paper>
      ) : !form ? (
        <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0", textAlign: "center", py: 6 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {t("myEvaluationPage.states.noDataTitle")}
          </Typography>
          <Typography color="text.secondary">
            {t("myEvaluationPage.states.noDataDesc")}
          </Typography>
        </Paper>
      ) : (
        <>
          {isEvaluated && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {t("myEvaluationPage.alerts.evaluatedAlert")}
            </Alert>
          )}
          {form.status === "SUBMITTED" && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {t("myEvaluationPage.alerts.submittedAlert")}
            </Alert>
          )}

          <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <Typography variant="h5" align="center" fontWeight="bold" sx={{ mb: 1, textTransform: "uppercase" }}>
              {t("myEvaluationPage.form.title")}
            </Typography>
            <Typography variant="subtitle1" align="center" fontWeight="bold" sx={{ mb: 4, color: "text.secondary" }}>
              {t("myEvaluationPage.form.cycleLabel", { cycle: form.cycle?.name || t("myEvaluationPage.form.defaultCycle") })}
            </Typography>

            {/* SECTION I */}
            <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 2 }}>
              {t("myEvaluationPage.form.personalInfo.title")}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4, px: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography><strong>{t("myEvaluationPage.form.personalInfo.fullName")}</strong> {user.name}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography><strong>{t("myEvaluationPage.form.personalInfo.staffCode")}</strong> {user.staffCode || "N/A"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography><strong>{t("myEvaluationPage.form.personalInfo.email")}</strong> {user.email}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography><strong>{t("myEvaluationPage.form.personalInfo.department")}</strong> {user.department?.name || "N/A"}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography><strong>{t("myEvaluationPage.form.personalInfo.position")}</strong> {user.managementPosition?.name || t("myEvaluationPage.form.personalInfo.defaultPosition")}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* SECTION II */}
            <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 1 }}>
              {t("myEvaluationPage.form.okrResults.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {t("myEvaluationPage.form.okrResults.desc")}
            </Typography>
            {form.okrObjectiveName && (
              <Typography variant="body2" fontWeight={600} color="#2563eb" sx={{ mb: 2 }}>
                {t("myEvaluationPage.form.okrResults.templateLabel", { name: form.okrObjectiveName })}
                {form.okrStatus === "COMPLETED" && (
                  <Box component="span" sx={{ ml: 1, color: "#16a34a", fontWeight: 700 }}>{t("myEvaluationPage.form.okrResults.locked")}</Box>
                )}
              </Typography>
            )}

            <TableContainer component={Paper} elevation={0} sx={{ mb: 4, border: "1px solid #cbd5e1" }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: "8%", textAlign: "center" }}>{t("myEvaluationPage.form.okrResults.headers.no")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "40%" }}>{t("myEvaluationPage.form.okrResults.headers.criteria")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>{t("myEvaluationPage.form.okrResults.headers.maxScore")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", color: "#64748b" }}>{t("myEvaluationPage.form.okrResults.headers.selfScore")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", color: "#1C4D8D" }}>{t("myEvaluationPage.form.okrResults.headers.managerScore")}</TableCell>
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
                    <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", color: "#166534" }}>{t("myEvaluationPage.form.okrResults.totalScore")}</TableCell>
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

            {/* SECTION III */}
            <Typography variant="h6" fontWeight="bold" color="#1e3a8a" sx={{ mb: 2 }}>
              {t("myEvaluationPage.form.selfComment.title")}
            </Typography>
            <Box sx={{ px: 2, mb: 4 }}>
              <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("myEvaluationPage.form.selfComment.commentLabel")}</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={t("myEvaluationPage.form.selfComment.commentPlaceholder")}
                value={selfComment}
                onChange={(e) => setSelfComment(e.target.value)}
                disabled={isSubmitted}
                sx={{ mb: 3 }}
              />

              <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("myEvaluationPage.form.selfComment.ratingLabel")}</Typography>
              <FormControl disabled={isSubmitted} sx={{ ml: 2 }}>
                <RadioGroup row value={selfRating} onChange={(e) => setSelfRating(e.target.value)}>
                  <FormControlLabel value="EXCELLENT" control={<Radio color="primary" />} label={t("myEvaluationPage.form.selfComment.ratings.excellent")} />
                  <FormControlLabel value="GOOD" control={<Radio color="primary" />} label={t("myEvaluationPage.form.selfComment.ratings.good")} />
                  <FormControlLabel value="POOR" control={<Radio color="primary" />} label={t("myEvaluationPage.form.selfComment.ratings.poor")} />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* SECTION IV */}
            {isEvaluated && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" fontWeight="bold" color="#b45309" sx={{ mb: 2 }}>
                  {t("myEvaluationPage.form.managerComment.title")}
                </Typography>
                <Box sx={{ px: 2, p: 3, bgcolor: "#fffbeb", borderRadius: 2, border: "1px solid #fde68a" }}>
                  <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("myEvaluationPage.form.managerComment.commentLabel")}</Typography>
                  <Typography sx={{ mb: 3, whiteSpace: "pre-wrap", color: "#1e293b" }}>
                    {form.managerComment || t("myEvaluationPage.form.managerComment.noComment")}
                  </Typography>

                  <Typography fontWeight="bold" sx={{ mb: 1 }}>{t("myEvaluationPage.form.managerComment.ratingLabel")}</Typography>
                  <Box sx={{ ml: 2 }}>
                    <FormControlLabel
                      control={<Radio checked={form.managerRating === "EXCELLENT"} color="success" readOnly />}
                      label={t("myEvaluationPage.form.managerComment.ratings.excellent")}
                    />
                    <br />
                    <FormControlLabel
                      control={<Radio checked={form.managerRating === "GOOD"} color="success" readOnly />}
                      label={t("myEvaluationPage.form.managerComment.ratings.good")}
                    />
                    <br />
                    <FormControlLabel
                      control={<Radio checked={form.managerRating === "POOR"} color="success" readOnly />}
                      label={t("myEvaluationPage.form.managerComment.ratings.poor")}
                    />
                  </Box>
                </Box>
              </>
            )}

            {/* Actions */}
            {!isSubmitted && (
              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }} data-html2canvas-ignore="true">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {t("myEvaluationPage.form.buttons.submit")}
                </Button>
              </Box>
            )}

            {isEvaluated && (
              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }} data-html2canvas-ignore="true">
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<PictureAsPdf />}
                  onClick={handleExportPDF}
                  sx={{ fontWeight: "bold" }}
                >
                  {t("myEvaluationPage.form.buttons.exportPdf")}
                </Button>
              </Box>
            )}
          </Paper>

          {/* PDF Hidden Export Template (Administrative document format) */}
          <EvaluationPdfTemplate
            user={user}
            form={form}
            selfComment={selfComment}
            selfRating={selfRating}
          />
        </>
      )}
    </Container>
  );
}
