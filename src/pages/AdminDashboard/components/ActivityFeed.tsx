import { useState, useCallback } from "react";
import { Box, Typography, Chip, Avatar, Skeleton, IconButton, Tooltip } from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Login,
  Logout,
  HelpOutline,
  History,
  Refresh,
} from "@mui/icons-material";
import type { SystemLog } from "../useAdminDashboardData";

interface Props {
  logs: SystemLog[];
  loading: boolean;
  onRefresh?: () => Promise<void>;
}

function getActionMeta(action: string) {
  switch (action) {
    case "CREATE":
      return { icon: <Add fontSize="small" />, color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Tạo mới" };
    case "UPDATE":
      return { icon: <Edit fontSize="small" />, color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Cập nhật" };
    case "DELETE":
      return { icon: <Delete fontSize="small" />, color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Xóa" };
    case "LOGIN":
      return { icon: <Login fontSize="small" />, color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", label: "Đăng nhập" };
    case "LOGOUT":
      return { icon: <Logout fontSize="small" />, color: "#6b7280", bg: "rgba(107,114,128,0.12)", label: "Đăng xuất" };
    default:
      return { icon: <HelpOutline fontSize="small" />, color: "#64748b", bg: "rgba(100,116,139,0.12)", label: action };
  }
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function formatClockTime(date: Date) {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();
}

function LogSkeleton() {
  return (
    <Box sx={{ display: "flex", gap: 2, py: 2, borderBottom: "1px solid #f1f5f9" }}>
      <Skeleton variant="circular" width={36} height={36} />
      <Box flex={1}>
        <Skeleton variant="text" width="60%" height={18} />
        <Skeleton variant="text" width="40%" height={14} />
      </Box>
      <Skeleton variant="rounded" width={60} height={22} />
    </Box>
  );
}

export default function ActivityFeed({ logs, loading, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
      setLastUpdated(new Date());
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing]);

  return (
    <Box
      sx={{
        background: "#ffffff",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a, #1e293b)",
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <History sx={{ color: "#60a5fa", fontSize: 20 }} />
        <Box flex={1}>
          <Typography variant="subtitle2" fontWeight={700} color="#ffffff">
            Hoạt động gần đây
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.45)">
            Cập nhật lúc {formatClockTime(lastUpdated)} · Tự động mỗi 15 giây
          </Typography>
        </Box>

        {/* Nút Refresh thủ công */}
        <Tooltip title="Làm mới ngay" placement="left">
          <IconButton
            size="small"
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{
              color: "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
              "&:hover": { color: "#ffffff", bgcolor: "rgba(255,255,255,0.1)" },
              "& svg": {
                transition: "transform 0.5s ease",
                transform: refreshing ? "rotate(360deg)" : "rotate(0deg)",
                animation: refreshing ? "spin 0.8s linear infinite" : "none",
                "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
              },
            }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Feed list — tối đa 10 bản ghi, scroll để xem thêm */}
      <Box sx={{ flex: 1, overflowY: "auto", maxHeight: 380, px: 3,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 2 },
      }}>
        {(loading || refreshing) && logs.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <LogSkeleton key={i} />)
        ) : logs.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
              gap: 1,
            }}
          >
            <History sx={{ fontSize: 40, color: "#cbd5e1" }} />
            <Typography variant="body2" color="#94a3b8">
              Chưa có hoạt động nào được ghi nhận
            </Typography>
          </Box>
        ) : (
          logs.slice(0, 10).map((log, idx) => {
            const meta = getActionMeta(log.action);
            const isFailed = log.status === "FAILED";
            return (
              <Box
                key={log.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  py: 1.75,
                  borderBottom: idx < logs.length - 1 ? "1px solid #f8fafc" : "none",
                  alignItems: "flex-start",
                  transition: "background 0.15s",
                  borderRadius: 1,
                  mx: -1,
                  px: 1,
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                {/* Action icon */}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: isFailed ? "rgba(239,68,68,0.1)" : meta.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: isFailed ? "#ef4444" : meta.color,
                  }}
                >
                  {meta.icon}
                </Box>

                {/* Content */}
                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="body2"
                    color="#1e293b"
                    fontWeight={500}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.message || `${log.action} · ${log.resource}`}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                    {log.user && (
                      <>
                        <Avatar
                          sx={{
                            width: 16,
                            height: 16,
                            fontSize: "0.55rem",
                            bgcolor: "#e0e7ff",
                            color: "#4f46e5",
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(log.user.name)}
                        </Avatar>
                        <Typography variant="caption" color="#64748b" noWrap>
                          {log.user.name}
                        </Typography>
                        <Typography variant="caption" color="#cbd5e1">·</Typography>
                      </>
                    )}
                    <Typography variant="caption" color="#94a3b8">
                      {formatRelativeTime(log.createdAt)}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: status + action chip */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
                  {isFailed && (
                    <Chip
                      label="FAILED"
                      size="small"
                      sx={{
                        bgcolor: "rgba(239,68,68,0.12)",
                        color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.3)",
                        fontWeight: 700,
                        fontSize: "0.6rem",
                        height: 18,
                      }}
                    />
                  )}
                  <Chip
                    label={meta.label}
                    size="small"
                    sx={{
                      bgcolor: meta.bg,
                      color: meta.color,
                      fontWeight: 600,
                      fontSize: "0.6rem",
                      height: 18,
                    }}
                  />
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

