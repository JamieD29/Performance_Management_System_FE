import { Paper, Typography, Box, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  FileSearch,
  ClipboardCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ActionItem } from "../useDeanDashboardData";

interface Props {
  items: ActionItem[];
  daysRemaining: number | null;
}

const iconMap: Record<string, React.ReactNode> = {
  PENDING_APPROVAL: <ClipboardCheck size={18} />,
  AWAITING_REVIEW: <FileSearch size={18} />,
  PENDING_EVALUATION: <ClipboardCheck size={18} />,
  LATE_SUBMISSION: <Clock size={18} />,
};

const severityColors: Record<string, { bg: string; border: string; iconBg: string; text: string }> = {
  error: { bg: "#fef2f2", border: "#fecaca", iconBg: "#fee2e2", text: "#991b1b" },
  warning: { bg: "#fffbeb", border: "#fde68a", iconBg: "#fef3c7", text: "#92400e" },
  info: { bg: "#eff6ff", border: "#bfdbfe", iconBg: "#dbeafe", text: "#1e40af" },
  success: { bg: "#f0fdf4", border: "#bbf7d0", iconBg: "#dcfce7", text: "#166534" },
};

export default function ActionPanel({ items, daysRemaining }: Props) {
  const navigate = useNavigate();

  if (items.length === 0 && (daysRemaining === null || daysRemaining > 30)) {
    return null; // Không có gì cần hành động
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #fecaca",
          bgcolor: "#fffbf0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={20} color="#dc2626" />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
            Cần Hành Động
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {items.map((item, i) => {
            const sc = severityColors[item.severity] || severityColors.info;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: sc.bg,
                  border: `1px solid ${sc.border}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateX(4px)",
                    boxShadow: `0 2px 12px ${sc.border}80`,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      bgcolor: sc.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: sc.text,
                    }}
                  >
                    {iconMap[item.type] || <AlertTriangle size={18} />}
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ color: sc.text }}>
                    {item.label}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowRight size={14} />}
                  onClick={() => navigate(item.route)}
                  sx={{
                    color: sc.text,
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    textTransform: "none",
                    "&:hover": { bgcolor: `${sc.border}40` },
                  }}
                >
                  Xử lý
                </Button>
              </Box>
            );
          })}

          {daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && (
            <>
              <Divider sx={{ my: 0.5 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: daysRemaining <= 7 ? "#fef2f2" : "#eff6ff",
                  border: `1px solid ${daysRemaining <= 7 ? "#fecaca" : "#bfdbfe"}`,
                }}
              >
                <Clock size={18} color={daysRemaining <= 7 ? "#dc2626" : "#2563eb"} />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: daysRemaining <= 7 ? "#991b1b" : "#1e40af" }}
                >
                  ⏰ Kỳ đánh giá kết thúc trong {daysRemaining} ngày
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </motion.div>
  );
}
