// src/pages/ProfileSetting/components/WorkEducationTab.tsx

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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Work, School, Star, AccessTime, Business } from "@mui/icons-material";
import type { UserProfileForm } from "../profile.types";
import {
  THEME_COLORS,
  FALLBACK_JOB_TITLES,
  FALLBACK_ACADEMIC_RANKS,
  FALLBACK_DEGREES,
} from "../profile.constants";
import { useTranslation } from "react-i18next";

// --- SHARED STYLES & SUBCOMPONENTS ---
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

// Card component to display fields (View Mode)
const ProfileField = ({ icon, label, value, color }: any) => {
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

// --- COMPONENT PROPS INTERFACE ---
interface WorkEducationTabProps {
  formData: UserProfileForm;
  isEditing: boolean;
  handleChange: (field: keyof UserProfileForm, value: any) => void;
  handleTeachingHoursChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePreventInvalidChars: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSmartPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;

  // Bổ sung props cho Đơn vị / Bộ môn
  departments: any[];
  getDepartmentName: (id: string) => string;

  // 📌 Enum options từ BE (Single Source of Truth)
  jobTitles?: string[];
  academicRanks?: string[];
  degrees?: string[];
}

export default function WorkEducationTab({
  formData,
  isEditing,
  handleChange,
  handleTeachingHoursChange,
  handlePreventInvalidChars,
  handleSmartPaste,
  departments,
  getDepartmentName,
  jobTitles,
  academicRanks,
  degrees,
}: WorkEducationTabProps) {
  const { t } = useTranslation();
  // Use BE data if available, otherwise fall back to constants
  const _jobTitles = jobTitles && jobTitles.length > 0 ? jobTitles : FALLBACK_JOB_TITLES;
  const _academicRanks = academicRanks && academicRanks.length > 0 ? academicRanks : FALLBACK_ACADEMIC_RANKS;
  const _degrees = degrees && degrees.length > 0 ? degrees : FALLBACK_DEGREES;
  
  // Default props for FormControl / TextField
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
            icon={<Business />}
            label={t("profile.fields.department")}
            value={getDepartmentName(formData.departmentID)}
            color={THEME_COLORS.WORK}
          />
          <ProfileField
            icon={<School />}
            label={t("profile.fields.degree")}
            value={formData.degree ? t(`profile.enums.degree.${formData.degree}`, { defaultValue: formData.degree }) : undefined}
            color={THEME_COLORS.WORK}
          />
          <ProfileField
            icon={<Star />}
            label={t("profile.fields.academicRank")}
            value={formData.academicRank ? t(`profile.enums.academicRank.${formData.academicRank}`, { defaultValue: formData.academicRank }) : undefined}
            color={THEME_COLORS.WORK}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileField
            icon={<Work />}
            label={t("profile.fields.jobTitle")}
            value={formData.jobTitle ? t(`profile.enums.jobTitle.${formData.jobTitle}`, { defaultValue: formData.jobTitle }) : undefined}
            color={THEME_COLORS.WORK}
          />
          <ProfileField
            icon={<AccessTime />}
            label={t("profile.fields.teachingHours")}
            value={
              formData.teachingHours !== undefined &&
              formData.teachingHours !== ""
                ? `${formData.teachingHours} ${t("profile.fields.hoursSuffix")}`
                : ""
            }
            color={THEME_COLORS.WORK}
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
      {/* WORK DEPARTMENT (Only selectable in ProfileSetup) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl
          fullWidth
          sx={{ ...getColorfulInputStyle("#94a3b8"), bgcolor: "#f1f5f9" }}
          disabled
        >
          <InputLabel>{t("profile.fields.department")}</InputLabel>
          <Select
            value={formData.departmentID || ""}
            label={t("profile.fields.department")}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <Business fontSize="small" />
              </InputAdornment>
            }
          >
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                {t("profile.loadingData")}
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>

      {/* ACADEMIC DEGREE */}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth sx={getColorfulInputStyle(THEME_COLORS.WORK)}>
          <InputLabel>{t("profile.fields.degree")}</InputLabel>
          <Select
            value={formData.degree || ""}
            label={t("profile.fields.degree")}
            onChange={(e) => {
              handleChange("degree", e.target.value);
              if (e.target.value !== "Tiến sĩ") {
                handleChange("academicRank", "Không");
              }
            }}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <School fontSize="small" />
              </InputAdornment>
            }
          >
            {_degrees.map((d) => (
              <MenuItem key={d} value={d}>
                {t(`profile.enums.degree.${d}`, { defaultValue: d })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* ACADEMIC RANK */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FormControl fullWidth sx={getColorfulInputStyle(THEME_COLORS.WORK)}>
          <InputLabel>{t("profile.fields.academicRank")}</InputLabel>
          <Select
            value={formData.academicRank || ""}
            label={t("profile.fields.academicRank")}
            onChange={(e) => handleChange("academicRank", e.target.value)}
            disabled={formData.degree !== "Tiến sĩ"}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <Star fontSize="small" />
              </InputAdornment>
            }
          >
            {_academicRanks.map((ar) => (
              <MenuItem key={ar} value={ar}>
                {t(`profile.enums.academicRank.${ar}`, { defaultValue: ar })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* PROFESSIONAL JOB TITLE */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FormControl fullWidth sx={getColorfulInputStyle(THEME_COLORS.WORK)}>
          <InputLabel>{t("profile.fields.jobTitle")}</InputLabel>
          <Select
            value={formData.jobTitle || ""}
            label={t("profile.fields.jobTitle")}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <Work fontSize="small" />
              </InputAdornment>
            }
          >
            {_jobTitles.map((jt) => (
              <MenuItem key={jt} value={jt}>
                {t(`profile.enums.jobTitle.${jt}`, { defaultValue: jt })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* TEACHING HOURS PER YEAR (WITH PREVENT SPAM LOGIC) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          {...commonProps}
          type="number"
          label={t("profile.fields.teachingHours")}
          value={formData.teachingHours || ""}
          onChange={handleTeachingHoursChange}
          onKeyDown={handlePreventInvalidChars}
          onPaste={handleSmartPaste}
          inputProps={{ min: 0, step: 1 }}
          sx={getColorfulInputStyle(THEME_COLORS.WORK)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTime />
              </InputAdornment>
            ),
            endAdornment: (
              <Typography variant="caption" sx={{ ml: 1 }}>
                {t("profile.fields.hoursSuffix")}
              </Typography>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
}
