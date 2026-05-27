import { Box, Container, Typography, CircularProgress, Alert, AlertTitle, Button } from "@mui/material";
import { Settings } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAdminDashboardData } from "./useAdminDashboardData";
import AdminHeroHeader from "./components/AdminHeroHeader";
import AdminMetricCards from "./components/AdminMetricCards";
import SystemHealthPanel from "./components/SystemHealthPanel";
import ActivityFeed from "./components/ActivityFeed";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, loading, healthLoading, error, refetch, refetchHealth, refetchLogs } =
    useAdminDashboardData();

  // Lấy tên admin từ session
  let adminName = "";
  try {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};
    adminName = user.name || "";
  } catch {
    // ignore
  }

  if (loading && !data.stats && !data.systemHealth) {
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
          Đang tải Admin Dashboard...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* === ZONE 1: Hero Header === */}
      <AdminHeroHeader cycle={data.currentCycle} adminName={adminName} />

      {/* === Quick nav to Admin Settings === */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2.5, mt: -1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Settings fontSize="small" />}
          onClick={() => navigate("/admin/settings")}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "0.8rem",
            borderColor: "#cbd5e1",
            color: "#475569",
            transition: "all 0.2s",
            "&:hover": {
              borderColor: "#2563eb",
              color: "#2563eb",
              bgcolor: "#eff6ff",
              transform: "translateY(-1px)",
            },
          }}
        >
          Cấu hình hệ thống
        </Button>
      </Box>

      {/* === ZONE 2: Metric Cards === */}
      <AdminMetricCards stats={data.stats} loading={loading} />

      {/* === ZONE 3+4: System Health + Activity Feed (2 cột) === */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          gap: 3,
          mb: 3,
          alignItems: "stretch",
        }}
      >
        {/* System Health Panel */}
        <SystemHealthPanel
          health={data.systemHealth}
          loading={healthLoading}
          onRefresh={refetchHealth}
        />

        {/* Activity Feed */}
        <ActivityFeed
          logs={data.recentLogs}
          loading={loading}
          onRefresh={refetchLogs}
        />
      </Box>
    </Container>
  );
}
