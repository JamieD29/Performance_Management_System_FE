import { Box, Typography, Paper, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileCheck2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { UserEvaluationData } from "../useDashboardData";

interface EvaluationStatusProps {
  evaluation: UserEvaluationData;
}

const ratingLabels: Record<string, { key: string; color: string; bg: string }> = {
  EXCELLENT: { key: "dashboard.evaluation.ratings.EXCELLENT", color: "#16a34a", bg: "#f0fdf4" },
  GOOD: { key: "dashboard.evaluation.ratings.GOOD", color: "#2563eb", bg: "#eff6ff" },
  POOR: { key: "dashboard.evaluation.ratings.POOR", color: "#dc2626", bg: "#fef2f2" },
};

const statusLabels: Record<string, { key: string; chipColor: "warning" | "info" | "success" }> = {
  PENDING_EVALUATION: { key: "dashboard.evaluation.status.PENDING_EVALUATION", chipColor: "warning" },
  SUBMITTED: { key: "dashboard.evaluation.status.SUBMITTED", chipColor: "info" },
  EVALUATED: { key: "dashboard.evaluation.status.EVALUATED", chipColor: "success" },
};

export default function EvaluationStatus({ evaluation }: EvaluationStatusProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const statusInfo = statusLabels[evaluation.status] || statusLabels.PENDING_EVALUATION;
  const managerRating = evaluation.managerRating
    ? ratingLabels[evaluation.managerRating]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "white",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FileCheck2 size={20} color="#1e3a8a" />
            <Typography variant="subtitle1" fontWeight="700" color="#1e293b">
              {t("dashboard.evaluation.title")}
            </Typography>
          </Box>
          <Chip
            label={t(statusInfo.key)}
            color={statusInfo.chipColor}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
          {/* Điểm */}
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {t("dashboard.evaluation.selfScore")}
              </Typography>
              <Typography variant="h5" fontWeight="700" color="#64748b">
                {evaluation.selfScoreTotal?.toFixed(1) || "0.0"}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {t("dashboard.evaluation.managerScore")}
              </Typography>
              <Typography variant="h5" fontWeight="700" color="#1e3a8a">
                {evaluation.principalScoreTotal
                  ? evaluation.principalScoreTotal.toFixed(1)
                  : "—"}
              </Typography>
            </Box>
          </Box>

          {managerRating && (
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: managerRating.bg,
                border: `1px solid ${managerRating.color}20`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {t("dashboard.evaluation.ratingResult")}
              </Typography>
              <Typography variant="body2" fontWeight="700" sx={{ color: managerRating.color }}>
                {t(managerRating.key)}
              </Typography>
            </Box>
          )}

          {/* CTA */}
          <Box sx={{ ml: "auto" }}>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{
                color: "#3b82f6",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => navigate("/my-evaluation")}
            >
              {t("dashboard.evaluation.viewDetails")} <ArrowRight size={16} />
            </Typography>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
}
