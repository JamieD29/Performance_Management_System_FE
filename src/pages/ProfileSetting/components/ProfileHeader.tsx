import React, { useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Paper,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  CameraAlt,
  AdminPanelSettings,
} from "@mui/icons-material";

import type { UserProfileForm, UserRole } from "../profile.types";

// --- ĐỊNH NGHĨA PROPS ---
interface ProfileHeaderProps {
  formData: UserProfileForm;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHeader({
  formData,
  isEditing,
  saving,
  onEdit,
  onSave,
  onCancel,
  onAvatarChange,
}: ProfileHeaderProps) {
  // Ref để kích hoạt thẻ input file ẩn khi click vào icon Camera
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
      }}
    >
      {/* Vòng tròn trang trí background */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 4,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* KHU VỰC AVATAR */}
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={formData.avatarUrl || ""}
            alt={formData.name || "User"}
            sx={{
              width: 140,
              height: 140,
              border: "4px solid rgba(255,255,255,0.2)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
              bgcolor: "#334155",
              fontSize: "3rem",
            }}
          >
            {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
          </Avatar>

          {/* Nút Upload Ảnh (Chỉ hiện khi Edit) */}
          {isEditing && (
            <>
              <Tooltip title="Thay đổi ảnh đại diện">
                <IconButton
                  onClick={handleCameraClick}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "#0ea5e9",
                    color: "#fff",
                    "&:hover": { bgcolor: "#0284c7" },
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    width: 40,
                    height: 40,
                  }}
                >
                  <CameraAlt fontSize="small" />
                </IconButton>
              </Tooltip>
              {/* Thẻ input ẩn để chọn file */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={onAvatarChange}
              />
            </>
          )}
        </Box>

        {/* KHU VỰC THÔNG TIN (Tên, Email, Quyền) */}
        <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{ color: "#fff", mb: 1, letterSpacing: "-0.5px" }}
          >
            {formData.name || "Đang tải..."}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#94a3b8",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-start" },
              gap: 1,
            }}
          >
            {formData.email}
          </Typography>

          {/* Hiển thị danh sách Roles bằng Chip */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            {formData.roles && formData.roles.length > 0 ? (
              formData.roles.map((role: UserRole, idx: number) => (
                <Chip
                  key={idx}
                  icon={
                    <AdminPanelSettings sx={{ color: "#fff !important" }} />
                  }
                  label={role.name}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(4px)",
                  }}
                />
              ))
            ) : (
              <Chip
                label="Chưa cấp quyền"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#94a3b8" }}
              />
            )}
          </Box>
        </Box>

        {/* KHU VỰC NÚT HÀNH ĐỘNG */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            minWidth: "200px",
            justifyContent: "flex-end",
          }}
        >
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={onEdit}
              sx={{
                bgcolor: "#fff",
                color: "#0f172a",
                fontWeight: "bold",
                borderRadius: "12px",
                px: 3,
                py: 1.5,
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              Chỉnh sửa hồ sơ
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={onCancel}
                disabled={saving}
                sx={{
                  color: "#fff",
                  borderColor: "rgba(255,255,255,0.3)",
                  borderRadius: "12px",
                  px: 3,
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
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
                  bgcolor: "#10b981",
                  color: "#fff",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  px: 3,
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
