import React from "react";
import { Box, Typography, Paper } from "@mui/material";
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
  const chartData = evaluationData.map((item) => {
    return {
      name: item.id,
      fullName: item.name,
      "Tự khai (%)": item.maxScore > 0 ? Math.round((item.selfScore / item.maxScore) * 100) : 0,
      "TK chấm (%)": item.maxScore > 0 ? Math.round((item.principalScore / item.maxScore) * 100) : 0,
      fullMark: 100,
      "Tự khai (Điểm)": item.selfScore,
      "TK chấm (Điểm)": item.principalScore,
      "Tối đa (Điểm)": item.maxScore,
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
            Tối đa: {data["Tối đa (Điểm)"]} điểm
          </Typography>
          <Typography variant="body2" color="#10b981">
            Tự khai: {data["Tự khai (Điểm)"]} điểm ({data["Tự khai (%)"]}%)
          </Typography>
          {hasManagerScore && (
            <Typography variant="body2" color="#3b82f6">
              TK chấm: {data["TK chấm (Điểm)"]} điểm ({data["TK chấm (%)"]}%)
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
        🕸️ Phân tích Năng lực theo Nhiệm vụ
      </Typography>

      <Box sx={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
            <Radar name="Tự khai" dataKey="Tự khai (%)" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            {hasManagerScore && (
              <Radar name="TK chấm" dataKey="TK chấm (%)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </Box>

      {!hasManagerScore && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
          * Điểm Trưởng khoa chấm sẽ hiện khi OKR được duyệt hoàn tất.
        </Typography>
      )}
    </Paper>
  );
}
