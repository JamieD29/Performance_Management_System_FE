import { Box, Paper, Typography, Button } from "@mui/material";
import { Users, ClipboardCheck, CheckCircle2, FileSearch } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { DashboardSummary, ActionItem } from "../useDeanDashboardData";

interface Props {
  summary: DashboardSummary;
  actionItems: ActionItem[];
}

const cards = [
  {
    key: "pendingApproval",
    label: "Chờ duyệt",
    icon: ClipboardCheck,
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    iconColor: "#dc2626",
    textColor: "#991b1b",
    actionType: "PENDING_APPROVAL", // to match actionItems
  },
  {
    key: "awaitingReview",
    label: "Chờ chấm",
    icon: FileSearch,
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    iconColor: "#d97706",
    textColor: "#92400e",
    actionType: "AWAITING_REVIEW",
  },
  {
    key: "completed",
    label: "Hoàn thành",
    icon: CheckCircle2,
    bgColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    iconColor: "#16a34a",
    textColor: "#166534",
  },
  {
    key: "totalStaff",
    label: "Tổng nhân sự",
    icon: Users,
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    iconColor: "#2563eb",
    textColor: "#1e40af",
  },
] as const;

export default function SummaryCards({ summary, actionItems }: Props) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2.5,
      }}
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = summary[card.key as keyof DashboardSummary];
        
        // Tìm xem có action tương ứng với card này không
        const actionItem = (card as any).actionType 
          ? actionItems.find(a => a.type === (card as any).actionType)
          : null;

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            style={{ display: "flex" }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: card.bgColor,
                border: `1px solid ${card.borderColor}`,
                transition: "all 0.25s ease",
                cursor: "default",
                display: "flex",
                flexDirection: "column",
                width: "100%",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: `0 8px 24px ${card.borderColor}80`,
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    bgcolor: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <Icon size={20} color={card.iconColor} />
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: card.textColor, opacity: 0.8 }}>
                  {card.label}
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", mt: "auto", pt: 1 }}>
                <Typography variant="h3" fontWeight={800} sx={{ color: card.textColor, lineHeight: 1 }}>
                  {value}
                </Typography>
                
                {actionItem && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate(actionItem.route)}
                    sx={{
                      bgcolor: card.textColor,
                      color: "white",
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: card.iconColor,
                        boxShadow: "none",
                      },
                    }}
                  >
                    Xử lý
                  </Button>
                )}
              </Box>
            </Paper>
          </motion.div>
        );
      })}
    </Box>
  );
}
