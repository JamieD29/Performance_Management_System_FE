import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, MessageCircle, FileText, Clock,
  CheckCircle, AlertTriangle, Target,
} from "lucide-react";
import ScoreGauge from "./ScoreGauge";

interface ActionCardProps {
  hasAction: boolean;
  message: string;
  route: string;
  label: string;
  status: string | null;
  scoreProps?: {
    selfScore: number;
    managerScore: number | null;
    maxScore: number;
  } | null;
}

const statusIconMap: Record<string, React.ReactNode> = {
  PENDING: <MessageCircle size={22} />,
  NEGOTIATING: <MessageCircle size={22} />,
  ACCEPTED: <FileText size={22} />,
  SUBMITTED: <Clock size={22} />,
  COMPLETED: <CheckCircle size={22} />,
  REJECTED: <AlertTriangle size={22} />,
};

const statusStyleMap: Record<string, { bg: string; border: string; accent: string; btnColor: string }> = {
  PENDING: { bg: "#fff7ed", border: "#ffedd5", accent: "#ea580c", btnColor: "#ea580c" },
  NEGOTIATING: { bg: "#eff6ff", border: "#dbeafe", accent: "#2563eb", btnColor: "#2563eb" },
  ACCEPTED: { bg: "#f0fdf4", border: "#dcfce7", accent: "#16a34a", btnColor: "#16a34a" },
  SUBMITTED: { bg: "#eff6ff", border: "#dbeafe", accent: "#3b82f6", btnColor: "#3b82f6" },
  COMPLETED: { bg: "#f0fdf4", border: "#dcfce7", accent: "#16a34a", btnColor: "#16a34a" },
  REJECTED: { bg: "#fef2f2", border: "#fecaca", accent: "#dc2626", btnColor: "#dc2626" },
};

const defaultStyle = { bg: "#f8fafc", border: "#e2e8f0", accent: "#64748b", btnColor: "#64748b" };

export default function ActionCard({ hasAction, message, route, label, status, scoreProps }: ActionCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const style = status ? (statusStyleMap[status] || defaultStyle) : defaultStyle;
  const icon = status ? (statusIconMap[status] || <Target size={22} />) : <Target size={22} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ height: "100%" }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 3,
          bgcolor: style.bg,
          border: `1px solid ${style.border}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Box for text and action */}
        <Box sx={{ 
          p: 3, 
          display: "flex", 
          flexDirection: "column", 
          gap: 2, 
          flex: 1 
        }}>
          {/* Pulse indicator for actions */}
          {hasAction && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: style.accent,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%": { boxShadow: `0 0 0 0 ${style.accent}40` },
                  "70%": { boxShadow: `0 0 0 8px ${style.accent}00` },
                  "100%": { boxShadow: `0 0 0 0 ${style.accent}00` },
                },
              }}
            />
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ color: style.accent }}>{icon}</Box>
            <Typography variant="subtitle1" fontWeight="700" sx={{ color: style.accent }}>
              {hasAction ? t("dashboard.actionCard.nextAction") : t("dashboard.actionCard.currentState")}
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: "#334155", lineHeight: 1.6 }}>
            {message}
          </Typography>

          <Box sx={{ mt: "auto", pt: 2 }}>
            <Button
              variant={hasAction ? "contained" : "outlined"}
              endIcon={<ArrowRight size={18} />}
              onClick={() => navigate(route)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                bgcolor: hasAction ? style.btnColor : "transparent",
                borderColor: style.btnColor,
                color: hasAction ? "white" : style.btnColor,
                "&:hover": {
                  bgcolor: hasAction ? style.accent : `${style.accent}10`,
                },
              }}
            >
              {label}
            </Button>
          </Box>
        </Box>

        {/* Box for ScoreGauge if available */}
        {scoreProps && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: { md: 280 },
              borderLeft: { md: `1px dashed ${style.border}` },
              borderTop: { xs: `1px dashed ${style.border}`, md: "none" },
              p: 3,
              bgcolor: "rgba(255,255,255,0.4)" // Slight background difference
            }}
          >
            <ScoreGauge {...scoreProps} transparent />
          </Box>
        )}
      </Paper>
    </motion.div>
  );
}
