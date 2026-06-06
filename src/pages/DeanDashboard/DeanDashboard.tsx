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
  // Pass selectedCycleId to hook (if empty, backend will use the default cycle)
  const { data, loading, error } = useDeanDashboardData(selectedCycleId || undefined);

  // Sync selectedCycleId when data is loaded for the first time (to display correctly in Select)
  useEffect(() => {
    if (data?.cycle?.id && !selectedCycleId) {
      setSelectedCycleId(data.cycle.id);
    }
  }, [data?.cycle?.id, selectedCycleId]);

  // Get user from session
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
      {/* All sections use gap: 3 for consistent spacing */}
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
          {/* Staff ranking table */}
          <StaffRankingTable ranking={staffRanking} />

          {/* Rating distribution (always visible, with ratingDetails) */}
          <Box sx={{ height: "100%" }}>
            <RatingDistribution 
              distribution={ratingDistribution} 
              ratingDetails={ratingDetails} 
            />
          </Box>
        </Box>

        {/* === SECTION 4: Department comparison === */}
        <DepartmentComparison stats={departmentStats} />

      </Box>
    </Container>
  );
}
