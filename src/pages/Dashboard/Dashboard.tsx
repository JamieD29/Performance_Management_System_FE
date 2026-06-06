import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useDashboardData } from "./useDashboardData";
import WelcomeHeader from "./components/WelcomeHeader";
import OkrStepper from "./components/OkrStepper";
import ObjectiveRadarChart from "./components/ObjectiveRadarChart";
import DataEntryProgress from "./components/DataEntryProgress";
import ActionCard from "./components/ActionCard";
import DeadlineCountdown from "./components/DeadlineCountdown";
import CycleProgress from "./components/CycleProgress";
import EvaluationStatus from "./components/EvaluationStatus";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Retrieve user and roles to check for redirection
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const rawRoles = user?.roles || [];
  const userRoles = Array.isArray(rawRoles)
    ? rawRoles.map((r: any) => {
        const val = typeof r === "string" ? r : r.slug || r.name || "";
        return val.toString().toUpperCase();
      })
    : [];
  const isAdmin = userRoles.includes("ADMIN");
  const hasManagementPosition = !!user?.managementPosition;

  const shouldRedirect = isAdmin || hasManagementPosition;

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin-dashboard", { replace: true });
    } else if (hasManagementPosition) {
      navigate("/dean-dashboard", { replace: true });
    }
  }, [isAdmin, hasManagementPosition, navigate]);

  const { data, loading, error } = useDashboardData(shouldRedirect);

  if (shouldRedirect || loading) {
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
        <CircularProgress size={48} sx={{ color: "#3b82f6" }} />
        <Typography color="text.secondary" variant="body2">
          {t("dashboard.loading")}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          <AlertTitle>{t("dashboard.errorTitle")}</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) return null;

  const { primaryOkr, evaluation, currentCycle, computed } = data;
  const hasOkr = !!primaryOkr;
  const isCompleted = primaryOkr?.status === "COMPLETED";
  const isSubmittedOrCompleted =
    primaryOkr?.status === "SUBMITTED" || isCompleted;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* === SECTION 1: Welcome Header === */}
      <WelcomeHeader
        cycleName={currentCycle?.name || t("dashboard.welcome.noCycle")}
        cycleStatus={currentCycle?.status || "CLOSED"}
      />

      {/* === SECTION 2: Action Card (CTA) + Deadline === */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
          gap: 3,
          mb: 4,
        }}
      >
        <ActionCard
          hasAction={computed.hasActionRequired}
          message={computed.actionMessage}
          route={computed.actionRoute}
          label={computed.actionLabel}
          status={primaryOkr?.status || null}
          scoreProps={
            isSubmittedOrCompleted
              ? {
                  selfScore: primaryOkr?.totalScore || 0,
                  managerScore: primaryOkr?.managerScore ?? null,
                  maxScore: 100,
                }
              : null
          }
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {hasOkr && (
            <DeadlineCountdown
              daysLeft={computed.daysUntilDeadline}
              label={computed.deadlineLabel}
              state={computed.deadlineState as any}
            />
          )}
          {currentCycle && (
            <CycleProgress
              cycleName={currentCycle.name}
              progressPercent={computed.cycleProgressPercent}
              startDate={currentCycle.startDate}
              endDate={currentCycle.endDate}
            />
          )}
        </Box>
      </Box>

      {/* === SECTION 3: OKR Progress Stepper === */}
      {hasOkr && (
        <Box sx={{ mb: 4 }}>
          <OkrStepper
            currentStep={computed.currentStepIndex}
            isRejected={primaryOkr?.status === "REJECTED"}
          />
        </Box>
      )}

      {/* === SECTION 3.5: Data Entry Progress === */}
      {hasOkr && data.dataEntryProgress && data.dataEntryProgress.length > 0 && primaryOkr?.status !== "COMPLETED" && (
        <Box sx={{ mb: 4 }}>
          <DataEntryProgress progressList={data.dataEntryProgress} />
        </Box>
      )}

      {/* === SECTION 4: Chart (chỉ khi có dữ liệu) === */}
      {isSubmittedOrCompleted && evaluation && evaluation.evaluationData && evaluation.evaluationData.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <ObjectiveRadarChart evaluationData={evaluation.evaluationData} />
        </Box>
      )}

      {/* === SECTION 5: Evaluation Status (Phiếu đánh giá) === */}
      {evaluation && isCompleted && (
        <Box sx={{ mb: 4 }}>
          <EvaluationStatus evaluation={evaluation} />
        </Box>
      )}
    </Container>
  );
}
