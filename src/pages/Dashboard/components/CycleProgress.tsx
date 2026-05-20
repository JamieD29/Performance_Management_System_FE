import React from "react";
import { Box, Typography, Paper, LinearProgress } from "@mui/material";
import { CalendarDays } from "lucide-react";

interface CycleProgressProps {
  cycleName: string;
  progressPercent: number;
  endDate: string;
}

export default function CycleProgress({ cycleName, progressPercent, endDate }: CycleProgressProps) {
  const formattedEnd = new Date(endDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "white",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <CalendarDays size={16} color="#64748b" />
        <Typography variant="caption" fontWeight="600" color="text.secondary">
          Tiến độ kỳ đánh giá
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: "#e2e8f0",
          mb: 1,
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: progressPercent > 80
              ? "linear-gradient(90deg, #ea580c, #ef4444)"
              : "linear-gradient(90deg, #1e3a8a, #3b82f6)",
          },
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          {progressPercent.toFixed(0)}% đã qua
        </Typography>
        <Typography variant="caption" fontWeight="600" color="text.secondary">
          Kết thúc: {formattedEnd}
        </Typography>
      </Box>
    </Paper>
  );
}
