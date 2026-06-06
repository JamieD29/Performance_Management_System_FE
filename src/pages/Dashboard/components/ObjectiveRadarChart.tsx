import { Box, Typography, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend
} from "recharts";

interface EvalItem {
  id: string;
  name: string;
  maxScore: number;
  selfScore: number;
  principalScore: number;
}

interface Props {
  evaluationData: EvalItem[];
}

export default function ObjectiveRadarChart({ evaluationData }: Props) {
  const { t } = useTranslation();

  const chartData = evaluationData.map((item) => {
    return {
      name: item.id,
      fullName: item.name,
      selfPercent: item.maxScore > 0 ? Math.round((item.selfScore / item.maxScore) * 100) : 0,
      managerPercent: item.maxScore > 0 ? Math.round((item.principalScore / item.maxScore) * 100) : 0,
      fullMark: 100,
      selfScore: item.selfScore,
      managerScore: item.principalScore,
      maxScore: item.maxScore,
    };
  });

  const hasManagerScore = evaluationData.some((d) => d.principalScore > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 1.5, opacity: 0.9 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>{data.fullName}</Typography>
          <Typography variant="body2" color="#64748b">
            {t("dashboard.chart.maxScoreLabel", { score: data.maxScore })}
          </Typography>
          <Typography variant="body2" color="#10b981">
            {t("dashboard.chart.selfReportLabel", { score: data.selfScore, percent: data.selfPercent })}
          </Typography>
          {hasManagerScore && (
            <Typography variant="body2" color="#3b82f6">
              {t("dashboard.chart.managerScoreLabel", { score: data.managerScore, percent: data.managerPercent })}
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white", height: "100%" }}
    >
      <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: "#1e293b" }}>
        {t("dashboard.chart.title")}
      </Typography>

      <Box sx={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Radar name={t("dashboard.chart.selfReport")} dataKey="selfPercent" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            {hasManagerScore && (
              <Radar name={t("dashboard.chart.managerScore")} dataKey="managerPercent" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </Box>

      {!hasManagerScore && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
          {t("dashboard.chart.note")}
        </Typography>
      )}
    </Paper>
  );
}
