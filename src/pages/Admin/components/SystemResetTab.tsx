import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert
} from "@mui/material";
import { Warning as WarningIcon, DeleteForever } from "@mui/icons-material";
import { useTranslation, Trans } from "react-i18next";
import { api } from "../../../services/api";

export default function SystemResetTab() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const response = await api.post("/admin/system/reset");
      setSuccessMsg(response.data.message || t("systemReset.alerts.success"));
      setOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || t("systemReset.alerts.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="error" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon /> {t("systemReset.dangerZone")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {t("systemReset.description")}
        </Typography>

        {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

        <Box sx={{ border: '1px solid #fecdd3', borderRadius: 2, p: 3, bgcolor: '#fff1f2' }}>
          <Typography variant="subtitle1" fontWeight="bold" color="#be123c">
            {t("systemReset.title")}
          </Typography>
          <Typography variant="body2" color="#9f1239" sx={{ mt: 1, mb: 2 }}>
            <Trans i18nKey="systemReset.confirmResetText">
              This action will <b>DELETE ALL</b> system data including: Users, OKRs, Evaluation Cycles, Logs...
              The system will be reset to an empty state like the initial installation (but keeping default Departments).
            </Trans>
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteForever />}
            onClick={() => setOpen(true)}
          >
            {t("systemReset.buttonLabel")}
          </Button>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          {t("systemReset.dialog.warningTitle")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#000', fontWeight: 500 }}>
            <Trans i18nKey="systemReset.dialog.warningBody1">
              You are requesting to <b>WIPE OUT</b> all system data. This action is <b>irreversible</b>!
            </Trans>
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            {t("systemReset.dialog.warningBody2")}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} disabled={loading} color="inherit">
            {t("systemReset.dialog.cancelBtn")}
          </Button>
          <Button
            onClick={handleReset}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? t("systemReset.dialog.processing") : t("systemReset.dialog.confirmBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
