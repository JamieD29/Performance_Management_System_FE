import { Stack, TextField, Box, Typography, Alert } from "@mui/material";
import {
  Badge as BadgeIcon,
  Event as EventIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AssignmentInd as AssignmentIndIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { AnimatedField } from "./AnimatedField";
import type { ProfileFormData } from "../types";

interface PersonalInfoStepProps {
  formData: ProfileFormData;
  onChange: (field: keyof ProfileFormData, value: string) => void;
  /** Thông báo lỗi/cảnh báo từ parent (hiển thị khi bấm Tiếp tục) */
  validationError?: string;
}

export function PersonalInfoStep({
  formData,
  onChange,
  validationError,
}: PersonalInfoStepProps) {
  const { t } = useTranslation();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const minJoinDateStr = "1995-01-01";

  return (
    <Stack spacing={2.5}>
      {/* Mã cán bộ */}
      <AnimatedField delay={100}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Box
            sx={{
              display: "flex",
              p: 0.8,
              borderRadius: "10px",
              bgcolor: "#f3e5f5",
              color: "#7b1fa2",
            }}
          >
            <AssignmentIndIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle2" fontWeight={600} color="#37474f">
            {t("profileSetup.personalInfoStep.staffCodeLabel")}
          </Typography>
        </Stack>
        <TextField
          fullWidth
          size="small"
          placeholder={t("profileSetup.personalInfoStep.staffCodePlaceholder")}
          value={formData.staffCode}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^\d{1,4}$/.test(val)) {
              onChange("staffCode", val);
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fff",
              borderRadius: "10px",
            },
          }}
        />
      </AnimatedField>

      {/* 1. Họ và tên */}
      <AnimatedField delay={200}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Box
            sx={{
              display: "flex",
              p: 0.8,
              borderRadius: "10px",
              bgcolor: "#e3f2fd",
              color: "#1565c0",
            }}
          >
            <PersonIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle2" fontWeight={600} color="#37474f">
            {t("profileSetup.personalInfoStep.fullNameLabel")}
          </Typography>
        </Stack>
        <TextField
          fullWidth
          size="small"
          placeholder={t("profileSetup.personalInfoStep.fullNamePlaceholder")}
          value={formData.fullName}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^[\p{L}\s]+$/u.test(val)) {
              onChange("fullName", val);
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fff",
              borderRadius: "10px",
            },
          }}
        />
      </AnimatedField>

      {/* 2. Ngày tháng năm sinh */}
      <AnimatedField delay={400}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Box
            sx={{
              display: "flex",
              p: 0.8,
              borderRadius: "10px",
              bgcolor: "#fce4ec",
              color: "#c62828",
            }}
          >
            <EventIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle2" fontWeight={600} color="#37474f">
            {t("profileSetup.personalInfoStep.dobLabel")}
          </Typography>
        </Stack>
        <TextField
          fullWidth
          size="small"
          type="date"
          value={formData.dob}
          onChange={(e) => onChange("dob", e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayStr }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fff",
              borderRadius: "10px",
            },
          }}
        />
      </AnimatedField>

      {/* 3. Email */}
      <AnimatedField delay={600}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Box
            sx={{
              display: "flex",
              p: 0.8,
              borderRadius: "10px",
              bgcolor: "#e8f5e9",
              color: "#2e7d32",
            }}
          >
            <EmailIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle2" fontWeight={600} color="#37474f">
            {t("profileSetup.personalInfoStep.emailLabel")}
          </Typography>
        </Stack>
        <TextField
          fullWidth
          size="small"
          type="email"
          placeholder={t("profileSetup.personalInfoStep.emailPlaceholder")}
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#f5f5f5",
              borderRadius: "10px",
              color: "#78909c",
            },
          }}
        />
      </AnimatedField>

      {/* 4. Ngày vào trường */}
      <AnimatedField delay={800}>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
          <Box
            sx={{
              display: "flex",
              p: 0.8,
              borderRadius: "10px",
              bgcolor: "#fff3e0",
              color: "#e65100",
            }}
          >
            <BadgeIcon fontSize="small" />
          </Box>
          <Typography variant="subtitle2" fontWeight={600} color="#37474f">
            {t("profileSetup.personalInfoStep.joinDateLabel")}
          </Typography>
        </Stack>
        <TextField
          fullWidth
          size="small"
          type="date"
          value={formData.joinDate}
          onChange={(e) => onChange("joinDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayStr, min: minJoinDateStr }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#fff",
              borderRadius: "10px",
            },
          }}
        />
        {/* Cảnh báo tuổi — hiển thị ngay dưới ngày vào trường */}
        {validationError && (
          <Alert severity="warning" sx={{ mt: 1.5, borderRadius: "10px" }}>
            <strong>{t("profileSetup.personalInfoStep.warningPrefix")}</strong> {validationError}
            <br />
            <Typography variant="caption" color="text.secondary">
              {t("profileSetup.personalInfoStep.warningDescription")}
            </Typography>
          </Alert>
        )}
      </AnimatedField>
    </Stack>
  );
}
