import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useDeanDashboardData } from "./useDeanDashboardData";
import DeanWelcomeHeader from "./components/DeanWelcomeHeader";
import SummaryCards from "./components/SummaryCards";
import ActionPanel from "./components/ActionPanel";
import OkrTimelineChart from "./components/OkrTimelineChart";
import StaffRankingTable from "./components/StaffRankingTable";
import DepartmentComparison from "./components/DepartmentComparison";
import RatingDistribution from "./components/RatingDistribution";

export default function DeanDashboard() {
  const { data, loading, error } = useDeanDashboardData();

  // Lấy user từ session
  let userName = "Trưởng khoa";
  try {
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    userName = user.name || "Trưởng khoa";
  } catch {
    // ignore
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress size={48} sx={{ color: "#2563eb" }} />
        <Typography color="text.secondary" variant="body2">
          Đang tải Dashboard Quản lý...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <AlertTitle>Lỗi</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) return null;

  const {
    cycle,
    summary,
    departmentStats,
    staffRanking,
    ratingDistribution,
    timelineData,
    actionItems,
  } = data;

  const hasRatingData = Object.keys(ratingDistribution).length > 0;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* === SECTION 1: Welcome Header + Cycle Info === */}
      <DeanWelcomeHeader userName={userName} cycle={cycle} />

      {/* === SECTION 2: Summary Cards === */}
      <SummaryCards summary={summary} />

      {/* === SECTION 3: Action Panel (Nếu có) === */}
      <ActionPanel
        items={actionItems}
        daysRemaining={cycle?.daysRemaining ?? null}
      />

      {/* === SECTION 4: Timeline Chart === */}
      <OkrTimelineChart data={timelineData} />

      {/* === SECTION 5: 2-column layout: Ranking + Rating === */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: hasRatingData ? "1fr 380px" : "1fr",
          },
          gap: 3,
          mb: 0,
        }}
      >
        {/* Bảng xếp hạng cá nhân */}
        <StaffRankingTable ranking={staffRanking} />

        {/* Phân bổ xếp loại (nếu có) */}
        {hasRatingData && <RatingDistribution distribution={ratingDistribution} />}
      </Box>

      {/* === SECTION 6: So sánh bộ môn === */}
      <DepartmentComparison stats={departmentStats} />
    </Container>
  );
}
