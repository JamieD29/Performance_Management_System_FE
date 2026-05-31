import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

export type DeadlineState = "DEFAULT" | "SUBMITTED_EARLY" | "SUBMITTED_LATE";

interface DeadlineCountdownProps {
  daysLeft: number | null;
  label?: string | null;
  state?: DeadlineState;
}

export default function DeadlineCountdown({ daysLeft, label, state = "DEFAULT" }: DeadlineCountdownProps) {
  if (state === "DEFAULT" && daysLeft === null) {
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

  let bg = "#f8fafc";
  let border = "#e2e8f0";
  let color = "#1e293b";
  let icon = <Clock size={22} color="#1e293b" />;
  let mainValue = "";
  let subText = "";
  
  if (state === "SUBMITTED_EARLY") {
    bg = "#f0fdf4";
    border = "#dcfce7";
    color = "#16a34a";
    icon = <CheckCircle size={22} color="#16a34a" />;
    mainValue = `${daysLeft}`;
    subText = "ngày trước hạn";
  } else if (state === "SUBMITTED_LATE") {
    bg = "#fef2f2";
    border = "#fecaca";
    color = "#dc2626";
    icon = <AlertTriangle size={22} color="#dc2626" />;
    mainValue = "Trễ hạn";
    subText = "Đã nộp trễ so với quy định";
  } else {
    // DEFAULT
    const isOverdue = daysLeft !== null && daysLeft < 0;
    const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
    
    if (isOverdue) {
      bg = "#fef2f2";
      border = "#fecaca";
      color = "#dc2626";
      icon = <AlertTriangle size={22} color="#dc2626" />;
      mainValue = `Quá ${Math.abs(daysLeft as number)}`;
      subText = "ngày quá hạn";
    } else if (isUrgent) {
      bg = "#fff7ed";
      border = "#ffedd5";
      color = "#ea580c";
      icon = <AlertTriangle size={22} color="#ea580c" />;
      mainValue = `${daysLeft}`;
      subText = daysLeft === 0 ? "hôm nay!" : "ngày còn lại";
    } else {
      bg = "#f0fdf4";
      border = "#dcfce7";
      color = "#16a34a";
      icon = <Clock size={22} color="#16a34a" />;
      mainValue = `${daysLeft}`;
      subText = "ngày còn lại";
    }
  }

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
          bgcolor: bg,
          border: `1px solid ${border}`,
          textAlign: "center",
        }}
      >
        <Box sx={{ mb: 0.5 }}>{icon}</Box>
        <Typography variant="subtitle2" sx={{ color: color, mb: 0.5, fontWeight: "bold" }}>
          {state === "SUBMITTED_EARLY" 
            ? "Tuyệt vời! Bạn đã nộp sớm" 
            : state === "SUBMITTED_LATE" 
              ? "Báo cáo nộp trễ" 
              : (label || "Hạn chót")}
        </Typography>
        <Typography variant="h4" fontWeight="800" sx={{ color: color, lineHeight: 1.2 }}>
          {mainValue}
        </Typography>
        {subText && (
          <Typography variant="caption" fontWeight="600" sx={{ color: color }}>
            {subText}
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
}
