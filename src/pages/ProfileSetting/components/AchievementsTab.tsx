// src/pages/ProfileSetting/components/AchievementsTab.tsx

import React from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import Grid from "@mui/material/Grid"; // Dùng Grid v7
import { EmojiEvents, Lightbulb } from "@mui/icons-material";

import type { UserProfileForm } from "../profile.types";
import { THEME_COLORS } from "../profile.constants";

// --- HÀM STYLE DÙNG CHUNG CHO TAB NÀY ---
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

// --- ĐỊNH NGHĨA PROPS CHO COMPONENT ---
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
  // Các props mặc định cho TextField khi ở chế độ Edit
  const commonProps = {
    fullWidth: true,
    variant: "outlined" as const,
    size: "medium" as const,
  };

  // --------------------------------------------------------
  // 1. CHẾ ĐỘ XEM (VIEW MODE)
  // --------------------------------------------------------
  if (!isEditing) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          {/* KHEN THƯỞNG & DANH HIỆU */}
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
                KHEN THƯỞNG & DANH HIỆU
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line", color: "#334155" }}
            >
              {formData.awards || "Chưa có dữ liệu"}
            </Typography>
          </Box>

          {/* SỞ HỮU TRÍ TUỆ / CÔNG TRÌNH */}
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
                SỞ HỮU TRÍ TUỆ / CÔNG TRÌNH
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line", color: "#334155" }}
            >
              {formData.intellectualProperty || "Chưa có dữ liệu"}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }

  // --------------------------------------------------------
  // 2. CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
  // --------------------------------------------------------
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12 }}>
        <TextField
          {...commonProps}
          multiline
          rows={3}
          label="Khen thưởng & Danh hiệu"
          value={formData.awards}
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
          label="Sở hữu trí tuệ"
          value={formData.intellectualProperty}
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
