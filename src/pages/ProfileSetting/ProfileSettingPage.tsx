// src/pages/ProfileSetting/ProfileSettingPage.tsx

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fade,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { Person, School, Star } from "@mui/icons-material";

// Import Logic và Components con
import { useProfileLogic } from "./useProfileLogic";
import { THEME_COLORS } from "./profile.constants";
import { useProfileOptions } from "../../hooks/useProfileOptions";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfoTab from "./components/PersonalInfoTab";
import WorkEducationTab from "./components/WorkEducationTab";
import AchievementsTab from "./components/AchievementsTab";
import { useTranslation } from "react-i18next";

export default function ProfileSetting() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 1. GỌI HOOK LẤY DATA VÀ LOGIC
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
    departments,
    getDepartmentName,
    handleChange,
    handleDobChange,
    handleJoinDateChange,
    handleTeachingHoursChange,
    handlePreventInvalidChars,
    handleSmartPaste,
    handleAvatarChange,
    handleCancel,
    handleSave,
    ageWarning,
  } = useProfileLogic();

  // 📌 Single Source of Truth: Fetch enum options từ BE
  const { options: profileOptions } = useProfileOptions();
  const beJobTitles = profileOptions.jobTitles.map((o) => o.value);
  const beAcademicRanks = profileOptions.academicRanks.map((o) => o.value);
  const beDegrees = profileOptions.degrees.map((o) => o.value);
  const beGenders = profileOptions.genders.map((o) => o.value);

  // 2. HIỂN THỊ LOADING LÚC MỚI VÀO
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 3. RENDER GIAO DIỆN CHÍNH
  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 8 }}>
      {/* BANNER XANH PHÍA TRÊN */}
      <Box
        sx={{
          height: 220,
          background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
          borderRadius: { xs: "20px", md: "40px" },
          mb: -12,
          boxShadow: "0 4px 20px rgba(37, 99, 235, 0.15)",
        }}
      />

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        {/* --- KHU VỰC HEADER (Đã truyền getDepartmentName) --- */}
        <ProfileHeader
          formData={formData}
          isEditing={isEditing}
          saving={saving}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onAvatarChange={handleAvatarChange}
          getDepartmentName={getDepartmentName}
        />

        {/* --- MAIN LAYOUT: VERTICAL TABS + CONTENT --- */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* MỤC TAB DỌC (DANH MỤC) */}
          <Paper
            elevation={0}
            sx={{
              minWidth: 260,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              bgcolor: "#fff",
              height: "fit-content",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                p: 2,
                color: "#94a3b8",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {t("profile.category")}
            </Typography>
            <Tabs
              orientation={isMobile ? "horizontal" : "vertical"}
              variant="scrollable"
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                borderRight: { md: "1px solid #f1f5f9" },
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  alignItems: "center",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  textTransform: "none",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  minHeight: 48,
                  mx: 1.5,
                  my: 0.5,
                  borderRadius: 2,
                  color: "#64748b",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "#f8fafc", color: "#334155" },
                  "&.Mui-selected": {
                    bgcolor:
                      activeTab === 0
                        ? alpha(THEME_COLORS.IDENTITY, 0.1)
                        : activeTab === 1
                          ? alpha(THEME_COLORS.WORK, 0.1)
                          : alpha(THEME_COLORS.ACHIEVEMENT, 0.1),
                    color:
                      activeTab === 0
                        ? THEME_COLORS.IDENTITY
                        : activeTab === 1
                          ? THEME_COLORS.WORK
                          : THEME_COLORS.ACHIEVEMENT,
                    fontWeight: "bold",
                  },
                },
              }}
            >
              <Tab
                label={t("profile.personalInfo")}
                icon={<Person />}
                iconPosition="start"
              />
              <Tab
                label={t("profile.workEducation")}
                icon={<School />}
                iconPosition="start"
              />
              <Tab
                label={t("profile.achievementsMore")}
                icon={<Star />}
                iconPosition="start"
              />
            </Tabs>
            <Box sx={{ mb: 2 }} />
          </Paper>

          {/* CỘT PHẢI: NỘI DUNG TỪNG TAB */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              bgcolor: "#fff",
              minHeight: 400,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#1e293b" }}
              >
                {activeTab === 0 && t("profile.personalInfo")}
                {activeTab === 1 && t("profile.workEducationTitle")}
                {activeTab === 2 && t("profile.achievementsResearch")}
              </Typography>
            </Box>
            <Box sx={{ p: 4 }}>
              <Fade in={true} key={activeTab}>
                <Box>
                  {/* TAB 0: THÔNG TIN CÁ NHÂN */}
                  {activeTab === 0 && (
                    <PersonalInfoTab
                      formData={formData}
                      errors={errors}
                      isEditing={isEditing}
                      handleChange={handleChange}
                      handleDobChange={handleDobChange}
                      handleJoinDateChange={handleJoinDateChange}
                      genders={beGenders}
                      ageWarning={isEditing ? ageWarning : undefined}
                    />
                  )}

                  {/* TAB 1: CÔNG VIỆC VÀ HỌC VẤN (Đã truyền departments) */}
                  {activeTab === 1 && (
                    <WorkEducationTab
                      formData={formData}
                      isEditing={isEditing}
                      handleChange={handleChange}
                      handleTeachingHoursChange={handleTeachingHoursChange}
                      handlePreventInvalidChars={handlePreventInvalidChars}
                      handleSmartPaste={handleSmartPaste}
                      departments={departments}
                      getDepartmentName={getDepartmentName}
                      jobTitles={beJobTitles}
                      academicRanks={beAcademicRanks}
                      degrees={beDegrees}
                    />
                  )}

                  {/* TAB 2: THÀNH TÍCH VÀ NGHIÊN CỨU */}
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

      {/* THÔNG BÁO SNACKBAR */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={notification?.type as any}
          onClose={() => setNotification(null)}
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
