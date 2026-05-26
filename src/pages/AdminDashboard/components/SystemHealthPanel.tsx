import { Box, Typography, LinearProgress, Tooltip, Skeleton, IconButton, Chip } from "@mui/material";
import { Refresh, Memory, Speed, AccessTime, Computer, FiberManualRecord } from "@mui/icons-material";
import type { SystemHealth } from "../useAdminDashboardData";

interface Props {
  health: SystemHealth | null;
  loading: boolean;
  onRefresh: () => void;
}

interface GaugeBarProps {
  label: string;
  value: number;       // 0–100
  displayLabel: string;
  color: string;
  icon: React.ReactNode;
  loading: boolean;
}

function getColor(value: number) {
  if (value >= 85) return "#ef4444";
  if (value >= 60) return "#f59e0b";
  return "#10b981";
}

function GaugeBar({ label, value, displayLabel, color, icon, loading }: GaugeBarProps) {
  const barColor = color || getColor(value);
  return (
    <Box mb={2.5}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <Box sx={{ color: "#64748b", display: "flex", fontSize: 16 }}>{icon}</Box>
          <Typography variant="body2" fontWeight={600} color="#334155">
            {label}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton width={60} height={18} />
        ) : (
          <Typography variant="body2" fontWeight={700} color={barColor}>
            {displayLabel}
          </Typography>
        )}
      </Box>
      {loading ? (
        <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4 }} />
      ) : (
        <Box sx={{ position: "relative" }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, value)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#f1f5f9",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: value >= 85
                  ? "linear-gradient(90deg, #f97316, #ef4444)"
                  : value >= 60
                    ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                    : `linear-gradient(90deg, ${barColor}bb, ${barColor})`,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}

function InfoRow({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75, borderBottom: "1px solid #f1f5f9" }}>
      <Typography variant="caption" color="#94a3b8" fontWeight={500}>{label}</Typography>
      {loading ? (
        <Skeleton width={80} height={16} />
      ) : (
        <Typography variant="caption" color="#334155" fontWeight={600}>{value}</Typography>
      )}
    </Box>
  );
}

export default function SystemHealthPanel({ health, loading, onRefresh }: Props) {
  const lastUpdate = health?.timestamp
    ? new Date(health.timestamp).toLocaleTimeString("vi-VN")
    : null;

  const cpuPercent = health?.cpu.loadPercent ?? 0;
  const ramPercent = health?.memory.usagePercent ?? 0;
  const nodeHeapPercent = health?.nodeProcess.heapUsagePercent ?? 0;

  const overallStatus =
    cpuPercent >= 85 || ramPercent >= 85
      ? "critical"
      : cpuPercent >= 60 || ramPercent >= 60
        ? "warning"
        : "healthy";

  return (
    <Box
      sx={{
        background: "#ffffff",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        height: "100%",
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
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Computer sx={{ color: "#60a5fa", fontSize: 20 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color="#ffffff">
              System Health
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.45)">
              Cập nhật mỗi 30 giây
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Status badge */}
          <Chip
            size="small"
            icon={
              <FiberManualRecord
                sx={{
                  fontSize: "10px !important",
                  color:
                    overallStatus === "critical"
                      ? "#f87171 !important"
                      : overallStatus === "warning"
                        ? "#fbbf24 !important"
                        : "#4ade80 !important",
                  animation:
                    overallStatus !== "critical"
                      ? "none"
                      : "pulse 1s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.4 },
                  },
                }}
              />
            }
            label={
              overallStatus === "critical"
                ? "Tải cao"
                : overallStatus === "warning"
                  ? "Bình thường"
                  : "Ổn định"
            }
            sx={{
              bgcolor:
                overallStatus === "critical"
                  ? "rgba(239,68,68,0.2)"
                  : overallStatus === "warning"
                    ? "rgba(251,191,36,0.2)"
                    : "rgba(74,222,128,0.2)",
              color:
                overallStatus === "critical"
                  ? "#f87171"
                  : overallStatus === "warning"
                    ? "#fbbf24"
                    : "#4ade80",
              border: `1px solid ${
                overallStatus === "critical"
                  ? "rgba(239,68,68,0.35)"
                  : overallStatus === "warning"
                    ? "rgba(251,191,36,0.35)"
                    : "rgba(74,222,128,0.35)"
              }`,
              fontWeight: 600,
              fontSize: "0.65rem",
              height: 22,
            }}
          />
          <Tooltip title="Làm mới ngay">
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={loading}
              sx={{
                color: "rgba(255,255,255,0.6)",
                "&:hover": { color: "#60a5fa", bgcolor: "rgba(96,165,250,0.1)" },
                transition: "all 0.2s",
              }}
            >
              <Refresh
                fontSize="small"
                sx={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Gauge bars */}
        <GaugeBar
          label="CPU Load"
          value={cpuPercent}
          displayLabel={`${cpuPercent}% · ${health?.cpu.coreCount ?? "?"} cores`}
          color={getColor(cpuPercent)}
          icon={<Speed fontSize="small" />}
          loading={loading && !health}
        />

        <GaugeBar
          label="RAM Hệ thống"
          value={ramPercent}
          displayLabel={`${health?.memory.usedGB ?? "?"} / ${health?.memory.totalGB ?? "?"}  GB`}
          color={getColor(ramPercent)}
          icon={<Memory fontSize="small" />}
          loading={loading && !health}
        />

        <GaugeBar
          label="Node.js Heap"
          value={nodeHeapPercent}
          displayLabel={`${health?.nodeProcess.heapUsedMB ?? "?"}  / ${health?.nodeProcess.heapTotalMB ?? "?"}  MB`}
          color={getColor(nodeHeapPercent)}
          icon={<Memory fontSize="small" />}
          loading={loading && !health}
        />

        {/* Divider */}
        <Box sx={{ borderTop: "1px solid #f1f5f9", my: 2 }} />

        {/* Info rows */}
        <Box>
          <InfoRow
            label="Uptime Server"
            value={health?.uptime.label ?? "—"}
            loading={loading && !health}
          />
          <InfoRow
            label="Platform"
            value={`${health?.system.platform ?? "—"} (${health?.system.arch ?? "—"})`}
            loading={loading && !health}
          />
          <InfoRow
            label="Node.js"
            value={health?.nodeProcess.nodeVersion ?? "—"}
            loading={loading && !health}
          />
          <InfoRow
            label="PID Process"
            value={health?.nodeProcess.pid?.toString() ?? "—"}
            loading={loading && !health}
          />
          <InfoRow
            label="RSS Memory"
            value={health?.nodeProcess.rssMB ? `${health.nodeProcess.rssMB} MB` : "—"}
            loading={loading && !health}
          />
        </Box>

        {/* Last update timestamp */}
        {lastUpdate && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 12, color: "#94a3b8" }} />
            <Typography variant="caption" color="#94a3b8">
              Cập nhật lúc {lastUpdate}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
