import { useState, useEffect } from "react";
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
import StaffRankingTable from "./components/StaffRankingTable";
import DepartmentComparison from "./components/DepartmentComparison";
import RatingDistribution from "./components/RatingDistribution";
import { useTranslation } from "react-i18next";

export default function DeanDashboard() {
  const { t } = useTranslation();
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  // Truyền selectedCycleId vào hook (nếu empty thì backend sẽ tự lấy kỳ mặc định)
  const { data, loading, error } = useDeanDashboardData(selectedCycleId || undefined);

  // Sync selectedCycleId khi data lần đầu được load (để hiện đúng ở Select)
  useEffect(() => {
    if (data?.cycle?.id && !selectedCycleId) {
      setSelectedCycleId(data.cycle.id);
    }
  }, [data?.cycle?.id, selectedCycleId]);

  // Lấy user từ session
  let userName = t("deanDashboard.welcome.defaultName", { defaultValue: "Trưởng khoa" });
  try {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    userName = user.name || t("deanDashboard.welcome.defaultName", { defaultValue: "Trưởng khoa" });
  } catch {
    // ignore
  }

  if (loading && !data) {
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
          {t("deanDashboard.loading")}
        </Typography>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <AlertTitle>{t("deanDashboard.error.title")}</AlertTitle>
          {error === "Không thể tải dữ liệu dashboard. Vui lòng thử lại." ? t("deanDashboard.error.fetchFailed") : error}
        </Alert>
      </Container>
    );
  }

  if (!data) return null;

  const {
    cycle,
    allCycles,
    summary,
    departmentStats,
    staffRanking,
    ratingDistribution,
    ratingDetails,
    actionItems,
  } = data;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Tất cả section dùng chung gap: 3 để khoảng cách đồng đều */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* === SECTION 1: Welcome Header + Cycle Info === */}
        <DeanWelcomeHeader 
          userName={userName} 
          cycle={cycle} 
          allCycles={allCycles}
          selectedCycleId={selectedCycleId}
          onCycleChange={setSelectedCycleId}
        />

        {/* === SECTION 2: Summary Cards === */}
        <SummaryCards summary={summary} actionItems={actionItems} />

        {/* === SECTION 3: 2-column layout: Ranking + Rating === */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "1fr 380px",
            },
            alignItems: "stretch",
            gap: 3,
          }}
        >
          {/* Bảng xếp hạng cá nhân */}
          <StaffRankingTable ranking={staffRanking} />

          {/* Phân bổ xếp loại (luôn hiển thị, truyền thêm ratingDetails) */}
          <Box sx={{ height: "100%" }}>
            <RatingDistribution 
              distribution={ratingDistribution} 
              ratingDetails={ratingDetails} 
            />
          </Box>
        </Box>

        {/* === SECTION 4: So sánh bộ môn === */}
        <DepartmentComparison stats={departmentStats} />

      </Box>
    </Container>
  );
}
