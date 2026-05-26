import { Box, Typography, Chip, LinearProgress, Tooltip } from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  TrendingUp,
  School,
} from "@mui/icons-material";
import type { EvaluationCycle } from "../useAdminDashboardData";

interface Props {
  cycle: EvaluationCycle | null;
  adminName?: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminHeroHeader({ cycle, adminName }: Props) {
  const now = new Date();
  const timeGreet =
    now.getHours() < 12
      ? "Chào buổi sáng"
      : now.getHours() < 18
        ? "Chào buổi chiều"
        : "Chào buổi tối";

  const cycleStatus = cycle?.status === "OPEN" ? "OPEN" : "CLOSED";
  const daysLeft = cycle?.daysRemaining ?? null;
  const progress = cycle?.progressPercent ?? 0;

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
        borderRadius: 3,
        p: { xs: 3, md: 4 },
        mb: 3,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(29, 78, 216, 0.35)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -80,
          left: "40%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        },
      }}
    >
      {/* Decorative grid lines */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 41px)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        {/* LEFT: Title */}
        <Box>
          {/* Icon + Tên khoa */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <School sx={{ color: "#ffffff", fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight={800}
                color="#ffffff"
                letterSpacing="-0.5px"
                lineHeight={1.1}
              >
                Khoa Công Nghệ Thông Tin
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.6)" mt={0.25}>
                {timeGreet}{adminName ? `, ${adminName}` : ""} · Admin Portal
              </Typography>
            </Box>
          </Box>

          {/* Badges */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="Admin"
              size="small"
              sx={{
                bgcolor: "rgba(251,191,36,0.2)",
                color: "#fbbf24",
                border: "1px solid rgba(251,191,36,0.4)",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
              }}
            />
            <Chip
              label="Hệ thống quản lý OKR-KPI"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: "0.7rem",
              }}
            />
          </Box>
        </Box>

        {/* RIGHT: Cycle Card */}
        {cycle ? (
          <Box
            sx={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 2.5,
              p: 2.5,
              minWidth: { xs: "100%", md: 320 },
              flexShrink: 0,
            }}
          >
            {/* Cycle header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday sx={{ color: "#93c5fd", fontSize: 16 }} />
                <Typography variant="caption" color="#93c5fd" fontWeight={600} textTransform="uppercase" letterSpacing="0.08em">
                  Chu kỳ đánh giá
                </Typography>
              </Box>
              <Chip
                label={cycleStatus === "OPEN" ? "Đang mở" : "Đã đóng"}
                size="small"
                sx={{
                  bgcolor: cycleStatus === "OPEN" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                  color: cycleStatus === "OPEN" ? "#4ade80" : "#f87171",
                  border: `1px solid ${cycleStatus === "OPEN" ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  height: 20,
                }}
              />
            </Box>

            <Typography variant="subtitle1" color="#ffffff" fontWeight={700} mb={0.5} noWrap>
              {cycle.name}
            </Typography>

            {/* Dates */}
            <Typography variant="caption" color="rgba(255,255,255,0.5)" sx={{ display: "block", mb: 1.5 }}>
              {formatDate(cycle.startDate)} → {formatDate(cycle.endDate)}
            </Typography>

            {/* Progress bar */}
            <Box mb={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="rgba(255,255,255,0.6)">
                  <TrendingUp sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
                  Tiến độ
                </Typography>
                <Typography variant="caption" color="#93c5fd" fontWeight={700}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                    background: progress >= 80
                      ? "linear-gradient(90deg, #f87171, #ef4444)"
                      : "linear-gradient(90deg, #60a5fa, #34d399)",
                  },
                }}
              />
            </Box>

            {/* Days remaining */}
            {daysLeft !== null && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AccessTime sx={{ fontSize: 13, color: daysLeft <= 7 ? "#f87171" : "#fbbf24" }} />
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color={daysLeft <= 0 ? "#f87171" : daysLeft <= 7 ? "#fb923c" : "#fbbf24"}
                >
                  {daysLeft <= 0
                    ? "Đã kết thúc"
                    : `Còn ${daysLeft} ngày`}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              background: "rgba(255,255,255,0.06)",
              border: "1px dashed rgba(255,255,255,0.2)",
              borderRadius: 2.5,
              p: 2.5,
              minWidth: { xs: "100%", md: 280 },
              textAlign: "center",
            }}
          >
            <Tooltip title="Vào Admin Settings → Evaluation Cycles để tạo chu kỳ mới">
              <Typography variant="body2" color="rgba(255,255,255,0.5)">
                Chưa có chu kỳ đánh giá nào
              </Typography>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}
