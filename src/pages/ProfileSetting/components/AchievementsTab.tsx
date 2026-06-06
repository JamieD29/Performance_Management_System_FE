// src/pages/ProfileSetting/components/AchievementsTab.tsx

import React from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import Grid from "@mui/material/Grid";
import { EmojiEvents, Lightbulb } from "@mui/icons-material";

import type { UserProfileForm } from "../profile.types";
import { THEME_COLORS } from "../profile.constants";
import { useTranslation } from "react-i18next";

// --- SHARED STYLE HELPERS FOR THIS TAB ---
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

// --- COMPONENT PROPS DEFINITION ---
interface AchievementsTabProps {
  formData: UserProfileForm;
  isEditing: boolean;
  handleChange: (field: keyof UserProfileForm, value: any) => void;
}

export default function AchievementsTab({
  formData,
  isEditing,
  handleChange,
}: AchievementsTabProps) {
  const { t } = useTranslation();
  // Default props for TextField in Edit mode
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
        <Grid size={{ xs: 12 }}>
          {/* AWARDS & HONORS */}
          <Box
            sx={{
              p: 3,
              bgcolor: "#fbfbfb",
              borderRadius: 4,
              border: `1px solid ${THEME_COLORS.ACHIEVEMENT}40`,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                color: THEME_COLORS.ACHIEVEMENT,
              }}
            >
              <EmojiEvents sx={{ color: "#eab308", mr: 1 }} />
              <Typography fontWeight="bold" variant="subtitle2">
                {t("profile.fields.awardsTitle")}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line", color: "#334155" }}
            >
              {formData.awards || t("profile.noData")}
            </Typography>
          </Box>

          {/* INTELLECTUAL PROPERTY / PUBLICATIONS */}
          <Box
            sx={{
              p: 3,
              bgcolor: "#fbfbfb",
              borderRadius: 4,
              border: `1px solid ${THEME_COLORS.ACHIEVEMENT}40`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                color: THEME_COLORS.ACHIEVEMENT,
              }}
            >
              <Lightbulb sx={{ color: "#eab308", mr: 1 }} />
              <Typography fontWeight="bold" variant="subtitle2">
                {t("profile.fields.intellectualPropertyTitle")}
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line", color: "#334155" }}
            >
              {formData.intellectualProperty || t("profile.noData")}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // --------------------------------------------------------
  // 2. EDIT MODE
  // --------------------------------------------------------
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12 }}>
        <TextField
          {...commonProps}
          multiline
          rows={3}
          label={t("profile.fields.awards")}
          value={formData.awards || ""}
          onChange={(e) => handleChange("awards", e.target.value)}
          sx={getColorfulInputStyle(THEME_COLORS.ACHIEVEMENT)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mt: 1 }}>
                <EmojiEvents sx={{ color: "#eab308" }} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          {...commonProps}
          multiline
          rows={3}
          label={t("profile.fields.intellectualProperty")}
          value={formData.intellectualProperty || ""}
          onChange={(e) => handleChange("intellectualProperty", e.target.value)}
          sx={getColorfulInputStyle(THEME_COLORS.ACHIEVEMENT)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mt: 1 }}>
                <Lightbulb sx={{ color: "#eab308" }} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
}
