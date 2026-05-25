import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
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

export default function ObjectiveBarChart({ evaluationData }: Props) {
  const chartData = evaluationData.map((item) => ({
    name: item.id,
    fullName: item.name,
    "Tự khai": item.selfScore,
    "TK chấm": item.principalScore,
    "Điểm tối đa": item.maxScore,
  }));

  const hasManagerScore = evaluationData.some((d) => d.principalScore > 0);

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white" }}
    >
      <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: "#1e293b" }}>
        📈 Điểm theo Nhiệm vụ
      </Typography>

      <Box sx={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: "#475569" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
            <Bar dataKey="Điểm tối đa" fill="#f1f5f9" radius={[4, 4, 0, 0]} barSize={24} />
            <Bar dataKey="Tự khai" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
            {hasManagerScore && (
              <Bar dataKey="TK chấm" fill="#1e3a8a" radius={[4, 4, 0, 0]} barSize={24} />
            )}
          </BarChart>
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
