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
  JOB_TITLES,
  ACADEMIC_RANKS,
  DEGREES,
} from "../profile.constants";

// --- HÀM STYLE & COMPONENT PHỤ DÙNG CHUNG ---
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

// Component hiển thị thông tin dạng thẻ (View Mode)
const ProfileField = ({ icon, label, value, color }: any) => (
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
            Chưa cập nhật
          </span>
        )}
      </Typography>
    </Box>
  </Box>
);

// --- ĐỊNH NGHĨA PROPS CHO COMPONENT ---
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
}: WorkEducationTabProps) {
  // Các props mặc định cho Form Control / TextField
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
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Bổ sung hiển thị Đơn vị / Bộ môn */}
          <ProfileField
            icon={<Business />}
            label="Đơn vị / Bộ môn"
            value={getDepartmentName(formData.departmentID)}
            color={THEME_COLORS.WORK}
          />
          <ProfileField
            icon={<Work />}
            label="Chức vụ"
            value={formData.jobTitle}
            color={THEME_COLORS.WORK}
          />
          <ProfileField
            icon={<Star />}
            label="Học hàm"
            value={formData.academicRank}
            color={THEME_COLORS.WORK}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileField
            icon={<School />}
            label="Học vị"
            value={formData.degree}
            color={THEME_COLORS.WORK}
          />
          <ProfileField
            icon={<AccessTime />}
            label="Giờ giảng/năm"
            value={
              formData.teachingHours !== undefined &&
              formData.teachingHours !== ""
                ? `${formData.teachingHours} Tiết`
                : ""
            }
            color={THEME_COLORS.WORK}
          />
        </Grid>
      </Grid>
    );
  }

  // --------------------------------------------------------
  // 2. CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
  // --------------------------------------------------------
  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* ĐƠN VỊ / BỘ MÔN (Bắt buộc) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth sx={getColorfulInputStyle(THEME_COLORS.WORK)}>
          <InputLabel>Đơn vị / Bộ môn *</InputLabel>
          <Select
            value={formData.departmentID || ""}
            label="Đơn vị / Bộ môn *"
            onChange={(e) => handleChange("departmentID", e.target.value)}
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
                Đang tải dữ liệu...
              </MenuItem>
            )}
          </Select>
        </FormControl>
      </Grid>

      {/* CHỨC VỤ */}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth sx={getColorfulInputStyle(THEME_COLORS.WORK)}>
          <InputLabel>Chức vụ</InputLabel>
          <Select
            value={formData.jobTitle || ""}
            label="Chức vụ"
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <Work fontSize="small" />
              </InputAdornment>
            }
          >
            {JOB_TITLES.map((jt) => (
              <MenuItem key={jt} value={jt}>
                {jt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* HỌC HÀM */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FormControl fullWidth sx={getColorfulInputStyle(THEME_COLORS.WORK)}>
          <InputLabel>Học hàm</InputLabel>
          <Select
            value={formData.academicRank || ""}
            label="Học hàm"
            onChange={(e) => handleChange("academicRank", e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <Star fontSize="small" />
              </InputAdornment>
            }
          >
            {ACADEMIC_RANKS.map((ar) => (
              <MenuItem key={ar} value={ar}>
                {ar}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* HỌC VỊ */}
      <Grid size={{ xs: 12, md: 4 }}>
        <FormControl fullWidth sx={getColorfulInputStyle(THEME_COLORS.WORK)}>
          <InputLabel>Học vị</InputLabel>
          <Select
            value={formData.degree || ""}
            label="Học vị"
            onChange={(e) => handleChange("degree", e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <School fontSize="small" />
              </InputAdornment>
            }
          >
            {DEGREES.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* GIỜ GIẢNG/NĂM (TÍCH HỢP LOGIC CHẶN) */}
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          {...commonProps}
          type="number"
          label="Giờ giảng/năm"
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
                Tiết
              </Typography>
            ),
          }}
        />
      </Grid>
    </Grid>
  );
}
