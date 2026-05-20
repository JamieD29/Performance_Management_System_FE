import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  selfScore: number;
  managerScore: number | null;
  maxScore: number;
}

export default function ScoreGauge({
  selfScore,
  managerScore,
  maxScore,
}: ScoreGaugeProps) {
  const primaryScore = managerScore ?? selfScore;
  const percentage = Math.min(100, (primaryScore / maxScore) * 100);
  const isPrimary = managerScore !== null;

  // Xác định màu theo thang điểm
  const getScoreColor = (pct: number) => {
    if (pct >= 86) return { main: "#16a34a", bg: "#f0fdf4", border: "#dcfce7" };
    if (pct >= 60) return { main: "#2563eb", bg: "#eff6ff", border: "#dbeafe" };
    return { main: "#ea580c", bg: "#fff7ed", border: "#ffedd5" };
  };

  const getScoreLabel = (pct: number) => {
    if (pct >= 86) return "Xuất sắc";
    if (pct >= 60) return "Tốt";
    return "Cần cải thiện";
  };

  const colors = getScoreColor(percentage);

  // SVG gauge parameters
  const size = 140;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const startAngle = 135; // Start from bottom-left
  const sweepAngle = 270; // Sweep 270 degrees
  const arcLength = (sweepAngle / 360) * circumference;
  const dashOffset = arcLength - (percentage / 100) * arcLength;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight="700"
        sx={{ mb: 1.5, color: "#1e293b" }}
      >
        📊 {isPrimary ? "Điểm TK chấm" : "Điểm tự khai"}
      </Typography>

      {/* SVG Gauge */}
      <Box sx={{ position: "relative", width: size, height: size, mb: 0.5 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: `rotate(${startAngle}deg)` }}
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.main}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>

        {/* Center text */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Typography
              variant="h3"
              fontWeight="800"
              sx={{ color: colors.main, lineHeight: 1 }}
            >
              {primaryScore.toFixed(1)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", fontSize: "0.7rem" }}
            >
              / {maxScore} điểm
            </Typography>
          </motion.div>
        </Box>
      </Box>

      {/* Label */}
      <Typography
        variant="body2"
        fontWeight="600"
        sx={{ color: colors.main }}
      >
        {getScoreLabel(percentage)}
      </Typography>

      {/* Nếu có cả 2 điểm, show so sánh nhanh */}
      {managerScore !== null && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: colors.border,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            px: 1,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Tự khai
            </Typography>
            <Typography variant="body2" fontWeight="700" color="#64748b">
              {selfScore.toFixed(1)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              TK chấm
            </Typography>
            <Typography variant="body2" fontWeight="700" color={colors.main}>
              {managerScore.toFixed(1)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Chênh lệch
            </Typography>
            <Typography
              variant="body2"
              fontWeight="700"
              color={
                managerScore - selfScore >= 0 ? "#16a34a" : "#dc2626"
              }
            >
              {managerScore - selfScore >= 0 ? "+" : ""}
              {(managerScore - selfScore).toFixed(1)}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
