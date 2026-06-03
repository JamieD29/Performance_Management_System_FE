import { Box, Typography, LinearProgress, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";

interface ScoreComparisonBarProps {
  selfScore: number;
  managerScore: number;
  maxScore?: number;
}

export default function ScoreComparisonBar({ selfScore, managerScore, maxScore = 100 }: ScoreComparisonBarProps) {
  const { t } = useTranslation();
  const selfPercent = Math.min((selfScore / maxScore) * 100, 100);
  const managerPercent = Math.min((managerScore / maxScore) * 100, 100);

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#fff", mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1e293b", mb: 3 }}>
        {t("userDetail.evaluation.totalEvaluationScore")}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{t("userDetail.evaluation.selfEvaluation")}</Typography>
          <Typography variant="body2" fontWeight="bold" color="#3b82f6">{selfScore.toFixed(1)} / {maxScore}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={selfPercent}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: "#f1f5f9",
            "& .MuiLinearProgress-bar": { bgcolor: "#3b82f6", borderRadius: 5 },
          }}
        />
      </Box>

      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" color="text.secondary">{t("userDetail.evaluation.managerEvaluation")}</Typography>
          <Typography variant="body2" fontWeight="bold" color="#059669">{managerScore.toFixed(1)} / {maxScore}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={managerPercent}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: "#f1f5f9",
            "& .MuiLinearProgress-bar": { bgcolor: "#059669", borderRadius: 5 },
          }}
        />
      </Box>
    </Paper>
  );
}
