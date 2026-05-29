import { Box, Container, CircularProgress, Typography, Tabs, Tab, Breadcrumbs, Paper, Fade, IconButton } from "@mui/material";
import { Person, Assessment, TrendingUp, NavigateNext, School, ArrowBack } from "@mui/icons-material";
import { Building2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserDetailData } from "./useUserDetailData";
import UserProfileCard from "./components/UserProfileCard";
import CycleSelector from "./components/CycleSelector";
import OkrTabPanel from "./components/OkrTab/OkrTabPanel";
import EvaluationTabPanel from "./components/EvaluationTab/EvaluationTabPanel";
import PerformanceTrendChart from "./components/AnalyticsTab/PerformanceTrendChart";
import { THEME_COLORS } from "../ProfileSetting/profile.constants";

export default function UserDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { parentName?: string; parentUrl?: string } | null;
  const { data, loading, error, selectedCycleId, setSelectedCycleId } = useUserDetailData();
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography color="error" variant="h6">{error || "Không tìm thấy thông tin nhân sự"}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 8 }}>
      {/* Back Button & Breadcrumbs */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pt: 3, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              mr: 2,
              bgcolor: "#f1f5f9",
              "&:hover": { bgcolor: "#e2e8f0", transform: "translateX(-2px)" },
              transition: "all 0.2s"
            }}
          >
            <ArrowBack />
          </IconButton>

          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            {/* <Typography
              sx={{ display: "flex", alignItems: "center", cursor: "pointer", color: "text.secondary", "&:hover": { color: "#1e293b", textDecoration: "underline" } }}
              onClick={() => navigate("/departments")}
            >
              <School sx={{ mr: 0.5, fontSize: 18 }} />
              Đơn vị
            </Typography> */}

            {state?.parentName && state.parentName !== "Đơn vị" && (
              <Typography
                sx={{ display: "flex", alignItems: "center", cursor: "pointer", color: "text.secondary", "&:hover": { color: "#1e293b", textDecoration: "underline" } }}
                onClick={() => navigate(state.parentUrl || "/")}
              >
                {state.parentName === "OKR Bộ Môn" ? <Assessment sx={{ mr: 0.5, fontSize: 18 }} /> : <Building2 size={16} style={{ marginRight: 4 }} />}
                {state.parentName}
              </Typography>
            )}

            {(!state?.parentName) && data.user.department && (
              <Typography
                sx={{ display: "flex", alignItems: "center", color: "text.secondary", cursor: "pointer", "&:hover": { color: "#1e293b", textDecoration: "underline" } }}
                onClick={() => {
                  if (data.user.department?.id) {
                    navigate(`/departments?deptId=${data.user.department.id}`);
                  }
                }}
              >
                <Building2 size={16} style={{ marginRight: 4 }} />
                {data.user.department.name}
              </Typography>
            )}

            <Typography sx={{ fontWeight: "bold", color: "#1e293b" }}>
              {data.user.name}
            </Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, position: "relative", zIndex: 1 }}>

        {/* Header Profile Card */}
        <Box sx={{ mb: 4 }}>
          <UserProfileCard user={data.user} />
        </Box>

        {/* Tabs Content */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Menu Tabs Dọc */}
          <Paper
            elevation={0}
            sx={{
              width: { xs: "100%", md: 260 },
              flexShrink: 0,
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
              Danh mục
            </Typography>
            <Tabs
              orientation="vertical"
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                "& .MuiTabs-indicator": { display: "none" },
                "& .MuiTab-root": {
                  alignItems: "center", justifyContent: "flex-start", textAlign: "left",
                  textTransform: "none", fontWeight: 500, fontSize: "0.95rem", minHeight: 48,
                  mx: 1, my: 0.5, borderRadius: 2, color: "#64748b",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: "#f8fafc", color: "#334155" },
                  "&.Mui-selected": {
                    bgcolor: "rgba(59, 130, 246, 0.1)",
                    color: THEME_COLORS.IDENTITY,
                    fontWeight: "bold",
                  },
                },
              }}
            >
              <Tab icon={<Person />} iconPosition="start" label="Mục tiêu (OKR)" />
              <Tab icon={<Assessment />} iconPosition="start" label="Đánh giá hiệu suất" />
              <Tab icon={<TrendingUp />} iconPosition="start" label="Xu hướng phát triển" />
            </Tabs>
            <Box sx={{ mb: 2 }} />
          </Paper>

          {/* Tab Panels */}
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
                flexWrap: "wrap",
                gap: 2
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ color: "#1e293b" }}
              >
                {activeTab === 0 && "Mục tiêu (OKR)"}
                {activeTab === 1 && "Đánh giá hiệu suất"}
                {activeTab === 2 && "Xu hướng phát triển"}
              </Typography>

              <CycleSelector
                cycles={data.allCycles || []}
                selectedId={selectedCycleId}
                onChange={setSelectedCycleId}
              />
            </Box>

            <Box sx={{ p: { xs: 2, md: 4 } }}>
              <Fade in={true} key={activeTab}>
                <Box>
                  {activeTab === 0 && <OkrTabPanel okrs={data.okrs} />}
                  {activeTab === 1 && <EvaluationTabPanel evaluation={data.evaluation} />}
                  {activeTab === 2 && <PerformanceTrendChart />}
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
