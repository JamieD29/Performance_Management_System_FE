import React from "react";
import { Box, Typography, Paper, LinearProgress, Stack } from "@mui/material";

interface ProgressItem {
  id: string;
  name: string;
  totalItems: number;
  filledItems: number;
  percent: number;
}

interface DataEntryProgressProps {
  progressList: ProgressItem[];
}

export default function DataEntryProgress({ progressList }: DataEntryProgressProps) {
  if (!progressList || progressList.length === 0) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white", height: "100%" }}>
      <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: "#1e293b" }}>
        📝 Tiến độ nhập liệu báo cáo
      </Typography>
      <Stack spacing={2}>
        {progressList.map((item) => (
          <Box key={item.id}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2" fontWeight="600" sx={{ color: "#334155" }}>
                {item.name}
              </Typography>
              <Typography variant="body2" fontWeight="500" sx={{ color: item.percent === 100 ? "#10b981" : "#64748b" }}>
                {item.filledItems} / {item.totalItems} mục ({item.percent}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.percent}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#f1f5f9",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: item.percent === 100 ? "#10b981" : "#3b82f6",
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
