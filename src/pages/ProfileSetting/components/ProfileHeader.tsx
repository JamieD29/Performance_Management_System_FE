// src/pages/ProfileSetting/components/ProfileHeader.tsx

import React, { useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  CameraAlt,
  AdminPanelSettings,
  Business,
  Badge,
  VerifiedUser,
} from "@mui/icons-material";

import type { UserProfileForm } from "../profile.types";
// Import màu sắc chủ đạo để phối màu
import { THEME_COLORS } from "../profile.constants";

// --- ĐỊNH NGHĨA PROPS ---
interface ProfileHeaderProps {
  formData: UserProfileForm;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getDepartmentName: (id: string) => string;
}

export default function ProfileHeader({
  formData,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onAvatarChange,
  getDepartmentName,
}: ProfileHeaderProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // --- HÀM HELPER HIỂN THỊ QUYỀN (ROLE) ---
  const getDisplayRole = (data: UserProfileForm) => {
    const { roles, managementPosition, jobTitle } = data;

    // 1. Ưu tiên quyền ADMIN (Chuẩn hóa Object/String và Case-insensitive)
    const rawRoles = Array.isArray(roles) ? roles : [];
    const isAdmin = rawRoles.some((r: any) => {
      const val = typeof r === "string" ? r : r.slug || r.name || "";
      return val.toString().toUpperCase() === "ADMIN";
    });

    if (isAdmin) return "Admin";

    // 2. Ưu tiên tiếp theo: Chức vụ quản lý (nếu có)
    if (managementPosition?.name) return managementPosition.name;

    // 3. Tiếp theo: Chức danh công việc (jobTitle)
    if (jobTitle) return jobTitle;

    // 4. Mặc định
    return "Giảng viên";
  };

  const userRoleStr = getDisplayRole(formData);
  const departmentName = getDepartmentName(formData.departmentID);
  const mainColor = THEME_COLORS.IDENTITY; // Màu chủ đạo cho header

  // Component nhỏ để hiển thị các thông tin phụ (Role, Dept)
  const InfoBadge = ({ icon, text, colorBg }: any) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        py: 0.8,
        px: 1.5,
        borderRadius: "30px",
        bgcolor: colorBg,
        color: "#475569",
        fontWeight: 600,
        fontSize: "0.875rem",
        border: "1px solid",
        borderColor: alpha(colorBg, 0.5),
      }}
    >
      {icon}
      {text}
    </Box>
  );

  return (
    <Paper
      elevation={4} // Tăng độ nổi
      sx={{
        borderRadius: "24px", // Bo góc tròn hơn
        p: { xs: 3, md: 4 },
        mb: 4,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        position: "relative",
        // Nền gradient nhẹ sang trọng hơn màu trắng phẳng
        background: "linear-gradient(145deg, #ffffff, #f8fafc)",
        boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1)", // Đổ bóng mềm
        overflow: "visible", // Để avatar lồi ra ngoài
      }}
    >
      {/* --- KHU VỰC AVATAR --- */}
      <Box
        sx={{
          position: "relative",
          mt: { xs: -6, md: -8 },
          mb: { xs: 3, md: 0 },
          mr: { md: 5 },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: "50%",
            p: "6px", // Viền ngoài
            // Hiệu ứng viền phát sáng màu xanh
            background: `linear-gradient(135deg, ${alpha(mainColor, 0.8)}, ${alpha(THEME_COLORS.WORK, 0.5)})`,
            boxShadow: `0 8px 20px -5px ${alpha(mainColor, 0.5)}`,
          }}
        >
          <Avatar
            sx={{
              width: { xs: 120, md: 150 },
              height: { xs: 120, md: 150 },
              border: "4px solid white", // Viền trắng bên trong
              bgcolor: mainColor,
              fontSize: { xs: 50, md: 60 },
              fontWeight: "bold",
            }}
            src={formData.avatarUrl || undefined}
          >
            {!formData.avatarUrl && formData.name
              ? formData.name.charAt(0).toUpperCase()
              : "U"}
          </Avatar>
        </Box>

        {/* Nút upload ảnh (Nổi bật hơn) */}
        {isEditing && (
          <Tooltip title="Đổi ảnh đại diện">
            <IconButton
              sx={{
                position: "absolute",
                bottom: 10,
                right: 10,
                bgcolor: mainColor,
                color: "white",
                boxShadow: `0 4px 12px ${alpha(mainColor, 0.4)}`,
                border: "3px solid white",
                "&:hover": {
                  bgcolor: alpha(mainColor, 0.9),
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s",
                width: 42,
                height: 42,
              }}
              onClick={handleCameraClick}
            >
              <CameraAlt fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={onAvatarChange}
        />
      </Box>

      {/* --- KHU VỰC THÔNG TIN CHÍNH --- */}
      <Box
        sx={{
          flexGrow: 1,
          textAlign: { xs: "center", md: "left" },
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{ color: "#1e293b", letterSpacing: "-0.5px" }}
          >
            {formData.name || "Đang tải..."}
          </Typography>
          {/* Icon xác thực nhỏ bên cạnh tên cho đẹp */}
          {!isEditing && <VerifiedUser sx={{ color: mainColor }} />}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: { xs: "center", md: "flex-start" },
            alignItems: "center",
            flexWrap: "wrap",
            mt: 2,
          }}
        >
          {/* Badge hiển thị Quyền */}
          {userRoleStr === "Admin" ? (
            <Chip
              icon={<AdminPanelSettings sx={{ color: "white !important" }} />}
              label="Admin"
              sx={{
                bgcolor: "#ef4444",
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
              }}
            />
          ) : (
            <InfoBadge
              icon={<Badge fontSize="small" sx={{ color: mainColor }} />}
              text={userRoleStr}
              colorBg={alpha(mainColor, 0.08)}
            />
          )}

          {/* Badge hiển thị Phòng ban */}
          <InfoBadge
            icon={
              <Business fontSize="small" sx={{ color: THEME_COLORS.WORK }} />
            }
            text={departmentName}
            colorBg={alpha(THEME_COLORS.WORK, 0.08)}
          />
        </Box>
      </Box>

      {/* --- KHU VỰC NÚT HÀNH ĐỘNG (Hiện đại hơn) --- */}
      <Box sx={{ mt: { xs: 4, md: 0 }, ml: { md: 3 }, flexShrink: 0 }}>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: "700",
              px: 4,
              py: 1.2,
              bgcolor: mainColor,
              boxShadow: `0 8px 16px -4px ${alpha(mainColor, 0.4)}`,
              "&:hover": {
                bgcolor: alpha(mainColor, 0.9),
                boxShadow: `0 12px 20px -4px ${alpha(mainColor, 0.5)}`,
              },
            }}
          >
            Chỉnh sửa
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="text"
              color="error"
              startIcon={<Cancel />}
              onClick={onCancel}
              disabled={saving}
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={
                saving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={onSave}
              disabled={saving}
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: "700",
                px: 4,
                py: 1.2,
                bgcolor: "#10b981",
                boxShadow: "0 8px 16px -4px rgba(16, 185, 129, 0.4)",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              {saving ? "Đang lưu..." : "Lưu lại"}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
