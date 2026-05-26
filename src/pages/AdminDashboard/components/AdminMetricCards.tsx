import { Box, Typography, Skeleton } from "@mui/material";
import {
  PeopleAlt,
  PersonOff,
  VerifiedUser,
  CheckCircle,
} from "@mui/icons-material";
import type { AdminDashboardStats } from "../useAdminDashboardData";

interface Props {
  stats: AdminDashboardStats | null;
  loading: boolean;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  subtitle?: string;
  color: string;
  bgGradient: string;
  loading: boolean;
  highlight?: boolean;
}

function MetricCard({
  icon,
  label,
  value,
  subtitle,
  color,
  bgGradient,
  loading,
  highlight,
}: MetricCardProps) {
  return (
    <Box
      sx={{
        background: "#ffffff",
        borderRadius: 3,
        p: 3,
        position: "relative",
        overflow: "hidden",
        border: highlight ? `1.5px solid ${color}40` : "1px solid #e2e8f0",
        boxShadow: highlight
          ? `0 4px 24px ${color}20`
          : "0 2px 8px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
        cursor: "default",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 32px ${color}25`,
          borderColor: `${color}60`,
        },
      }}
    >
      {/* Background accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          borderRadius: "0 12px 0 100%",
          background: bgGradient,
          opacity: 0.08,
        }}
      />

      {/* Icon */}
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: bgGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          boxShadow: `0 4px 12px ${color}30`,
        }}
      >
        <Box sx={{ color: "#fff", display: "flex" }}>{icon}</Box>
      </Box>

      {/* Value */}
      {loading ? (
        <Skeleton variant="text" width={60} height={48} sx={{ mb: 0.5 }} />
      ) : (
        <Typography
          variant="h4"
          fontWeight={800}
          color={color}
          lineHeight={1}
          mb={0.5}
          letterSpacing="-1px"
        >
          {value ?? "—"}
        </Typography>
      )}

      {/* Label */}
      <Typography variant="body2" fontWeight={600} color="#334155" mb={0.25}>
        {label}
      </Typography>

      {/* Subtitle */}
      {subtitle && (
        <Typography variant="caption" color="#94a3b8">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default function AdminMetricCards({ stats, loading }: Props) {
  const u = stats?.users;

  const cards: MetricCardProps[] = [
    {
      icon: <PeopleAlt fontSize="medium" />,
      label: "Tổng nhân sự",
      value: u?.total ?? null,
      subtitle: "Tất cả tài khoản trong hệ thống",
      color: "#2563eb",
      bgGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      loading,
    },
    {
      icon: <VerifiedUser fontSize="medium" />,
      label: "Đang hoạt động",
      value: u?.active ?? null,
      subtitle: "Có tương tác trong 30 ngày qua",
      color: "#059669",
      bgGradient: "linear-gradient(135deg, #10b981, #059669)",
      loading,
    },
    {
      icon: <CheckCircle fontSize="medium" />,
      label: "Đã hoàn chỉnh hồ sơ",
      value: u?.completedProfile ?? null,
      subtitle: "Đã điền đầy đủ thông tin cá nhân",
      color: "#7c3aed",
      bgGradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      loading,
    },
    {
      icon: <PersonOff fontSize="medium" />,
      label: "Chưa setup hồ sơ",
      value: u?.incompleteProfile ?? null,
      subtitle: "Cần nhắc nhở hoàn thiện thông tin",
      color: "#dc2626",
      bgGradient: "linear-gradient(135deg, #f87171, #dc2626)",
      loading,
      highlight: (u?.incompleteProfile ?? 0) > 0,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr 1fr",
          md: "repeat(4, 1fr)",
        },
        gap: 2.5,
        mb: 3,
      }}
    >
      {cards.map((card, idx) => (
        <MetricCard key={idx} {...card} />
      ))}
    </Box>
  );
}
