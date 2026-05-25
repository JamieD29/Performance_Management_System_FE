import { Box, Typography, LinearProgress, Chip } from "@mui/material";
import { GraduationCap, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { CycleInfo } from "../useDeanDashboardData";

interface Props {
  userName: string;
  cycle: CycleInfo | null;
}

export default function DeanWelcomeHeader({ userName, cycle }: Props) {
  const statusColor: Record<string, string> = {
    OPEN: "#16a34a",
    CLOSED: "#dc2626",
    ARCHIVED: "#6b7280",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #0F2854 0%, #1C4D8D 60%, #2563eb 100%)",
          borderRadius: 4,
          p: 3.5,
          mb: 3,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            right: 80,
            bottom: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              bgcolor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <GraduationCap size={26} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: "-0.01em" }}>
              Xin chào, {userName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Dashboard Quản lý — Tổng quan hiệu suất toàn khoa
            </Typography>
          </Box>
        </Box>

        {cycle && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
              mt: 2,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Calendar size={16} />
              <Typography variant="body2" fontWeight={600}>
                {cycle.name}
              </Typography>
              <Chip
                label={cycle.status}
                size="small"
                sx={{
                  bgcolor: statusColor[cycle.status] || "#6b7280",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Clock size={16} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {cycle.daysRemaining !== null && cycle.daysRemaining > 0
                  ? `Còn ${cycle.daysRemaining} ngày`
                  : cycle.daysRemaining !== null && cycle.daysRemaining <= 0
                    ? "Đã hết hạn"
                    : "—"}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Tiến độ kỳ
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  {cycle.progressPercent}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={cycle.progressPercent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.15)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    bgcolor: "#FFD60A",
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}
