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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Person, Badge, Email, Wc, DateRange, Event as EventIcon } from "@mui/icons-material";
import type { UserProfileForm, FormErrors } from "../profile.types";
import { THEME_COLORS, GENDERS } from "../profile.constants";

// --- HÀM STYLE & COMPONENT PHỤ DÙNG CHUNG CHO TAB NÀY ---
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
interface PersonalInfoTabProps {
  formData: UserProfileForm;
  errors: FormErrors;
  isEditing: boolean;
  handleChange: (field: keyof UserProfileForm, value: any) => void;
  handleJoinDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PersonalInfoTab({
  formData,
  errors,
  isEditing,
  handleChange,
  handleJoinDateChange,
}: PersonalInfoTabProps) {
  // Biến giới hạn ngày tháng
  const todayStr = new Date().toISOString().split("T")[0];
  const minJoinDateStr = "1996-01-01";

  // Các props mặc định cho TextField
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
          <ProfileField
            icon={<Person />}
            label="Họ và tên"
            value={formData.name}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<Badge />}
            label="Mã cán bộ"
            value={formData.staffCode}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<Email />}
            label="Email liên hệ"
            value={formData.email}
            color={THEME_COLORS.IDENTITY}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ProfileField
            icon={<EventIcon />}
            label="Ngày tháng năm sinh"
            value={formData.dob}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<Wc />}
            label="Giới tính"
            value={formData.gender}
            color={THEME_COLORS.IDENTITY}
          />
          <ProfileField
            icon={<DateRange />}
            label="Ngày vào trường"
            value={formData.joinDate}
            color={THEME_COLORS.IDENTITY}
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
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          {...commonProps}
          label={<RequiredLabel label="Họ và tên" />}
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
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
          label={<RequiredLabel label="Mã cán bộ" />}
          value={formData.staffCode}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^\d{1,4}$/.test(val)) {
              handleChange("staffCode", val);
            }
          }}
          sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
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
          label="Email"
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
          label="Ngày tháng năm sinh"
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayStr }}
          value={formData.dob || ""}
          onChange={(e) => handleChange("dob", e.target.value)}
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
          <InputLabel>Giới tính</InputLabel>
          <Select
            value={formData.gender}
            label="Giới tính"
            onChange={(e) => handleChange("gender", e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ mr: 2, ml: 1 }}>
                <Wc fontSize="small" />
              </InputAdornment>
            }
          >
            {GENDERS.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          {...commonProps}
          type="date"
          label="Ngày vào trường"
          InputLabelProps={{ shrink: true }}
          // Khóa lịch
          inputProps={{
            max: todayStr,
            min: minJoinDateStr,
          }}
          value={formData.joinDate || ""}
          onChange={handleJoinDateChange}
          // Báo lỗi viền đỏ
          error={!!errors.joinDate}
          helperText={errors.joinDate}
          sx={getColorfulInputStyle(THEME_COLORS.IDENTITY)}
        />
      </Grid>
    </Grid>
  );
}
