import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface DeadlineCountdownProps {
  daysLeft: number | null;
}

export default function DeadlineCountdown({ daysLeft }: DeadlineCountdownProps) {
  if (daysLeft === null) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
          textAlign: "center",
        }}
      >
        <Clock size={20} color="#94a3b8" />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          Chưa có deadline
        </Typography>
      </Paper>
    );
  }

  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;
  const isSafe = daysLeft > 3;

  const config = isOverdue
    ? { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", icon: <AlertTriangle size={22} color="#dc2626" /> }
    : isUrgent
      ? { bg: "#fff7ed", border: "#ffedd5", color: "#ea580c", icon: <AlertTriangle size={22} color="#ea580c" /> }
      : { bg: "#f0fdf4", border: "#dcfce7", color: "#16a34a", icon: <CheckCircle size={22} color="#16a34a" /> };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          bgcolor: config.bg,
          border: `1px solid ${config.border}`,
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: 0.5 }}>{config.icon}</Box>
        <Typography variant="h4" fontWeight="800" sx={{ color: config.color, lineHeight: 1.2 }}>
          {isOverdue ? `Quá ${Math.abs(daysLeft)}` : daysLeft}
        </Typography>
        <Typography variant="caption" fontWeight="600" sx={{ color: config.color }}>
          {isOverdue ? "ngày quá hạn" : daysLeft === 0 ? "Hạn chót hôm nay!" : "ngày còn lại"}
        </Typography>
      </Paper>
    </motion.div>
  );
}
