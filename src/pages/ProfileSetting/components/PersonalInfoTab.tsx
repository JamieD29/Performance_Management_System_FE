// src/pages/ProfileSetting/components/PersonalInfoTab.tsx

import React from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Person,
  Badge,
  Email,
  Wc,
  DateRange,
  Event as EventIcon,
} from "@mui/icons-material";
import type { UserProfileForm, FormErrors } from "../profile.types";
import { THEME_COLORS, FALLBACK_GENDERS } from "../profile.constants";
import { useTranslation } from "react-i18next";

// --- SHARED STYLE HELPERS & SUB-COMPONENTS FOR THIS TAB ---
const getColorfulInputStyle = (color: string) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: `${color}40` },
    "&:hover fieldset": { borderColor: color },
    "&.Mui-focused fieldset": {
      borderColor: color,
      borderWidth: "2px",
      boxShadow: `0 0 0 3px ${color}15`,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: color, fontWeight: "bold" },
  "& .MuiInputAdornment-root": { color: color },
});

const RequiredLabel = ({ label }: { label: string }) => (
  <span>
    {label} <span style={{ color: "#ef4444" }}>*</span>
  </span>
);

// Card-style field display component (View Mode)
const ProfileField = ({ icon, label, value, color, disabled }: any) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#64748b",
          fontWeight: 700,
          textTransform: "uppercase",
          ml: 1,
          mb: 0.5,
          display: "block",
          fontSize: "0.75rem",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          borderRadius: 3,
          bgcolor: "#fff",
          border: "1px solid",
          borderColor: `${color}40`,
          boxShadow: `0 2px 4px ${color}10`,
          transition: "all 0.2s",
          "&:hover": { borderColor: color, boxShadow: `0 4px 8px ${color}20` },
        }}
      >
        <Box
          sx={{
            color: color,
            mr: 2,
            display: "flex",
            p: 1,
            borderRadius: "50%",
            bgcolor: `${color}10`,
          }}
        >
          {React.cloneElement(icon as React.ReactElement<any>, {
            fontSize: "small",
          })}
        </Box>
        <Typography
          variant="body1"
          sx={{ color: "#1e293b", fontWeight: 600, flexGrow: 1 }}
        >
          {value || (
            <span
              style={{ color: "#94a3b8", fontWeight: 400, fontStyle: "italic" }}
            >
              {t("profile.notUpdated")}
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

// --- COMPONENT PROPS DEFINITION ---
interface PersonalInfoTabProps {
  formData: UserProfileForm;
  isEditing: boolean;
  errors: FormErrors;
  handleChange: (field: keyof UserProfileForm, value: any) => void;
  handleDobChange: (value: string) => void;
  handleJoinDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // 📌 Enum options from BE (Single Source of Truth)
  genders?: string[];
  // Age warning if < 20
  ageWarning?: string;
}

export default function PersonalInfoTab({
  formData,
  errors,
  isEditing,
  handleChange,
  handleDobChange,
  handleJoinDateChange,
  genders,
  ageWarning,
}: PersonalInfoTabProps) {
  const { t, i18n } = useTranslation();
  const _genders = genders && genders.length > 0 ? genders : FALLBACK_GENDERS;
  // Date boundary variables
  const todayStr = new Date().toISOString().split("T")[0];
  const minJoinDateStr = "1995-01-01";

  // Format date according to locale
  const formatDateLocale = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US");
  };

  // Default props for TextField
  const commonProps = {
    fullWidth: true,
    variant: "outlined" as const,
    size: "medium" as const,
  };

  // --------------------------------------------------------
  // 1. VIEW MODE
  // --------------------------------------------------------
  if (!isEditing) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileField
            icon={<Person />}
            label={t("profile.fields.fullName")}
            value={formData.name}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<Badge />}
            label={t("profile.fields.staffCode")}
            value={formData.staffCode}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<Email />}
            label={t("profile.fields.email")}
            value={formData.email}
            color={THEME_COLORS.IDENTITY}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileField
            icon={<EventIcon />}
            label={t("profile.fields.dob")}
            value={formatDateLocale(formData.dob)}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<Wc />}
            label={t("profile.fields.gender")}
            value={formData.gender ? t(`profile.enums.gender.${formData.gender}`, { defaultValue: formData.gender }) : undefined}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<DateRange />}
            label={t("profile.fields.joinDate")}
            value={formatDateLocale(formData.joinDate)}
            color={THEME_COLORS.IDENTITY}
          />
        </Grid>
      </Grid>
    );
  }

  // --------------------------------------------------------
  // 2. EDIT MODE
  // --------------------------------------------------------
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          {...commonProps}
          label={<RequiredLabel label={t("profile.fields.fullName")} />}
          value={formData.name}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^[\p{L}\s]+$/u.test(val)) {
              handleChange("name", val);
            }
          }}
          sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          {...commonProps}
          disabled
          label={t("profile.fields.staffCode")}
          value={formData.staffCode}
          sx={{ ...getColorfulInputStyle("#94a3b8"), bgcolor: "#f1f5f9" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Badge />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          {...commonProps}
          disabled
          label={t("profile.fields.email")}
          value={formData.email}
          sx={{ ...getColorfulInputStyle("#94a3b8"), bgcolor: "#f1f5f9" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          {...commonProps}
          type="date"
          label={t("profile.fields.dob")}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayStr }}
          value={formData.dob || ""}
          onChange={(e) => handleDobChange(e.target.value)}
          error={!!errors.dob}
          helperText={errors.dob}
          sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl
          fullWidth
          sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
        >
          <InputLabel>{t("profile.fields.gender")}</InputLabel>
          <Select
            value={formData.gender}
            label={t("profile.fields.gender")}
            onChange={(e) => handleChange("gender", e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <Wc fontSize="small" />
              </InputAdornment>
            }
          >
            {_genders.map((g) => (
              <MenuItem key={g} value={g}>
                {t(`profile.enums.gender.${g}`, { defaultValue: g })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          {...commonProps}
          type="date"
          label={t("profile.fields.joinDate")}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            max: todayStr,
            min: minJoinDateStr,
          }}
          value={formData.joinDate || ""}
          onChange={handleJoinDateChange}
          error={!!errors.joinDate}
          helperText={errors.joinDate}
          sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
        />
      </Grid>

      {/* Age warning if < 20 */}
      {ageWarning && (
        <Grid size={{ xs: 12 }}>
          <Alert severity="warning" sx={{ borderRadius: "12px" }}>
            <strong>{t("profile.warnings.ageTitle")}</strong> {ageWarning}
            <br />
            <Typography variant="caption" color="text.secondary">
              {t("profile.warnings.ageDesc")}
            </Typography>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}
