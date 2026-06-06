import { Box, Typography, Paper, LinearProgress } from "@mui/material";
import { CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CycleProgressProps {
  cycleName: string;
  progressPercent: number;
  startDate: string;
  endDate: string;
}

export default function CycleProgress({ cycleName: _cycleName, progressPercent, startDate, endDate }: CycleProgressProps) {
  const { t, i18n } = useTranslation();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  const formattedStart = start.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  
  const formattedEnd = end.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Calculate days
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.ceil((Math.min(today.getTime(), end.getTime()) - start.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, totalDays - elapsedDays);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "white",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CalendarDays size={16} color="#64748b" />
          <Typography variant="caption" fontWeight="600" color="text.secondary">
            {t("dashboard.cycleProgress.title")}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {t("dashboard.cycleProgress.elapsed", { percent: progressPercent.toFixed(0) })}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: "#e2e8f0",
          mb: 1.5,
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: progressPercent > 80
              ? "linear-gradient(90deg, #ea580c, #ef4444)"
              : "linear-gradient(90deg, #1e3a8a, #3b82f6)",
          },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="caption" fontWeight="600" color="text.secondary">
          {t("dashboard.cycleProgress.start", { date: formattedStart })}
        </Typography>
        <Typography variant="caption" fontWeight="600" color="text.secondary">
          {t("dashboard.cycleProgress.end", { date: formattedEnd })}
        </Typography>
      </Box>

      {/* Mini stats */}
      <Box sx={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: 1, 
        mt: "auto", 
        pt: 2,
        borderTop: "1px dashed #e2e8f0" 
      }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" fontWeight="700" color="#334155" lineHeight={1.2}>
            {totalDays}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
            {t("dashboard.cycleProgress.totalDays")}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>
          <Typography variant="h6" fontWeight="700" color="#3b82f6" lineHeight={1.2}>
            {elapsedDays}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
            {t("dashboard.cycleProgress.elapsedDays")}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" fontWeight="700" color={remainingDays < 5 ? "#ea580c" : "#10b981"} lineHeight={1.2}>
            {remainingDays}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
            {t("dashboard.cycleProgress.remainingDays")}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
