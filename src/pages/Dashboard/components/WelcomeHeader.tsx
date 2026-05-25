import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { Sparkles } from "lucide-react";

interface WelcomeHeaderProps {
  cycleName: string;
  cycleStatus: string;
}

export default function WelcomeHeader({
  cycleName,
  cycleStatus,
}: WelcomeHeaderProps) {
  // Lấy user từ session
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const statusColor =
    cycleStatus === "OPEN" ? "success" : cycleStatus === "CLOSED" ? "default" : "info";
  const statusLabel =
    cycleStatus === "OPEN" ? "Đang mở" : cycleStatus === "CLOSED" ? "Đã đóng" : "Lưu trữ";

  return (
    <Box
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 4,
        background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -40,
          right: 100,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Sparkles size={20} style={{ opacity: 0.8 }} />
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 500 }}>
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>

          <Typography
            variant="h4"
            fontWeight="800"
            sx={{
              mb: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {getGreeting()}, {user.name || "Thầy/Cô"}! 👋
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Kỳ đánh giá:
            </Typography>
            <Typography variant="body1" fontWeight="700">
              {cycleName}
            </Typography>
            <Chip
              label={statusLabel}
              color={statusColor as any}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
