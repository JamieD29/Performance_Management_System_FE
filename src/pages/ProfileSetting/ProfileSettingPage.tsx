// src/pages/ProfileSetting/index.tsx

import React from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fade,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Person, WorkHistory, EmojiEvents } from "@mui/icons-material";

// Import Logic và Components con
import { useProfileLogic } from "./useProfileLogic";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfoTab from "./components/PersonalInfoTab";
import WorkEducationTab from "./components/WorkEducationTab";
import AchievementsTab from "./components/AchievementsTab";

export default function ProfileSetting() {
  // 1. GỌI "BỘ NÃO" ĐỂ LẤY DATA VÀ CÁC HÀM XỬ LÝ
  const {
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    loading,
    saving,
    notification,
    setNotification,
    formData,
    errors,
    handleChange,
    handleJoinDateChange,
    handleTeachingHoursChange,
    handlePreventInvalidChars,
    handleSmartPaste,
    handleAvatarChange,
    handleCancel,
    handleSave,
  } = useProfileLogic();

  // Responsive: Chuyển Tab dọc/ngang tùy kích thước màn hình
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 2. HIỂN THỊ LOADING KHI ĐANG FETCH API LÚC MỚI VÀO
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 3. RENDER GIAO DIỆN CHÍNH
  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: { xs: 2, md: 4 } }}>
      {/* --- PHẦN HEADER (AVATAR, TÊN, NÚT LƯU) --- */}
      <ProfileHeader
        formData={formData}
        isEditing={isEditing}
        saving={saving}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onAvatarChange={handleAvatarChange}
      />

      {/* --- PHẦN THÂN: TABS VÀ NỘI DUNG --- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
        }}
      >
        {/* CỘT TRÁI: DANH SÁCH TABS */}
        <Box sx={{ width: { xs: "100%", md: "280px" }, flexShrink: 0 }}>
          <Tabs
            orientation={isMobile ? "horizontal" : "vertical"}
            variant={isMobile ? "scrollable" : "standard"}
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderRight: isMobile ? 0 : 1,
              borderBottom: isMobile ? 1 : 0,
              borderColor: "divider",
              "& .MuiTab-root": {
                alignItems: isMobile ? "center" : "flex-start",
                textAlign: "left",
                py: 2,
                px: 3,
                minHeight: "64px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                color: "#64748b",
                transition: "all 0.3s",
                "&.Mui-selected": {
                  color: "#0ea5e9",
                  bgcolor: "rgba(14, 165, 233, 0.05)",
                },
              },
            }}
          >
            <Tab
              icon={<Person sx={{ mr: isMobile ? 0 : 2 }} />}
              iconPosition={isMobile ? "top" : "start"}
              label="Thông tin cá nhân"
            />
            <Tab
              icon={<WorkHistory sx={{ mr: isMobile ? 0 : 2 }} />}
              iconPosition={isMobile ? "top" : "start"}
              label="Công việc & Học vấn"
            />
            <Tab
              icon={<EmojiEvents sx={{ mr: isMobile ? 0 : 2 }} />}
              iconPosition={isMobile ? "top" : "start"}
              label="Thành tích & Nghiên cứu"
            />
          </Tabs>
        </Box>

        {/* CỘT PHẢI: NỘI DUNG TAB ĐƯỢC CHỌN */}
        <Box sx={{ flexGrow: 1 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
          >
            {/* Tiêu đề Tab đang mở */}
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid #f1f5f9",
                bgcolor: "#f8fafc",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#1e293b" }}
              >
                {activeTab === 0 && "Thông tin cá nhân"}
                {activeTab === 1 && "Công việc và Học vấn"}
                {activeTab === 2 && "Thành tích và Nghiên cứu"}
              </Typography>
            </Box>

            {/* Khung chứa các Component con */}
            <Box sx={{ p: { xs: 2, sm: 4 } }}>
              <Fade in={true} key={activeTab}>
                <Box>
                  {activeTab === 0 && (
                    <PersonalInfoTab
                      formData={formData}
                      errors={errors}
                      isEditing={isEditing}
                      handleChange={handleChange}
                      handleJoinDateChange={handleJoinDateChange}
                    />
                  )}
                  {activeTab === 1 && (
                    <WorkEducationTab
                      formData={formData}
                      isEditing={isEditing}
                      handleChange={handleChange}
                      handleTeachingHoursChange={handleTeachingHoursChange}
                      handlePreventInvalidChars={handlePreventInvalidChars}
                      handleSmartPaste={handleSmartPaste}
                    />
                  )}
                  {activeTab === 2 && (
                    <AchievementsTab
                      formData={formData}
                      isEditing={isEditing}
                      handleChange={handleChange}
                    />
                  )}
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* --- THÔNG BÁO (SNACKBAR) --- */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={(notification?.type as any) || "info"}
          onClose={() => setNotification(null)}
          sx={{ width: "100%", boxShadow: 3, borderRadius: 2 }}
          variant="filled"
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
