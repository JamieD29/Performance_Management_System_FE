import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslation, Trans } from "react-i18next";

import type { ProfileFormData } from "../types";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  formData: ProfileFormData;
  selectedDeptName: string;
  selectedRankLabel: string;
  selectedDegreeLabel: string;
  jobTitle: string;
}

export function ConfirmationDialog({
  open,
  onClose,
  onSubmit,
  submitting,
  formData,
  selectedDeptName,
  selectedRankLabel,
  selectedDegreeLabel,
  jobTitle,
}: ConfirmationDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "18px",
          p: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 700,
          color: "#e65100",
        }}
      >
        <WarningIcon sx={{ color: "#ff9800", fontSize: 28 }} />
        {t("profileSetup.confirmDialog.title")}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "#546e7a", mb: 2.5 }}>
          {t("profileSetup.confirmDialog.subtitle")}
        </Typography>

        <Stack spacing={2}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: "12px",
              bgcolor: "#f5f5f5",
              border: "1px solid #e0e0e0",
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" color="primary" fontWeight={700}>
                {t("profileSetup.confirmDialog.personalInfoTitle")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.staffCode")}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#37474f">
                  {formData.staffCode || "---"}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.fullName")}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#37474f">
                  {formData.fullName || "---"}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.dob")}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#37474f">
                  {formData.dob || "---"}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.email")}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#37474f">
                  {formData.email || "---"}
                </Typography>
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.joinDate")}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#37474f">
                  {formData.joinDate || "---"}
                </Typography>
              </Box>

              <Box sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" fontWeight={700}>
                {t("profileSetup.confirmDialog.workInfoTitle")}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.department")}
                </Typography>
                <Chip
                  label={selectedDeptName || "---"}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.academicRank")}
                </Typography>
                <Chip
                  label={selectedRankLabel || "---"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "#fce4ec",
                    color: "#c62828",
                  }}
                />
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.degree")}
                </Typography>
                <Chip
                  label={selectedDegreeLabel || "---"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "#e8f5e9",
                    color: "#2e7d32",
                  }}
                />
              </Box>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#78909c", fontWeight: 500 }}
                >
                  {t("profileSetup.confirmDialog.position")}
                </Typography>
                <Chip
                  label={jobTitle || "---"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor: "#fff3e0",
                    color: "#e65100",
                  }}
                />
              </Box>
            </Stack>
          </Box>

          <Alert severity="warning" sx={{ borderRadius: "10px" }}>
            <Trans i18nKey="profileSetup.confirmDialog.alertText">
              Bạn xác nhận các thông tin trên là <strong>chính xác</strong>? Hệ
              thống sẽ ghi nhận và phân bổ bạn vào bộ môn tương ứng.
            </Trans>
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            px: 3,
            color: "#546e7a",
          }}
        >
          {t("profileSetup.confirmDialog.backBtn")}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting}
          startIcon={
            submitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <CheckCircleIcon />
            )
          }
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            px: 3,
            fontWeight: 600,
            background: "linear-gradient(135deg, #1976d2 0%, #00897b 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #1565c0 0%, #00796b 100%)",
            },
          }}
        >
          {submitting ? t("profileSetup.confirmDialog.submittingText") : t("profileSetup.confirmDialog.confirmBtn")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
