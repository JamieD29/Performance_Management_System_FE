import { Box, Typography, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { Check, Circle, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OKR_STEPS } from "../useDashboardData";

interface OkrStepperProps {
  currentStep: number; // 0-5
  isRejected?: boolean;
}

export default function OkrStepper({
  currentStep,
  isRejected = false,
}: OkrStepperProps) {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "white",
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight="700"
        sx={{ mb: 3, color: "#1e293b" }}
      >
        {t("dashboard.stepper.title")}
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          position: "relative",
          px: 1,
        }}
      >
        {/* Connecting line */}
        <Box
          sx={{
            position: "absolute",
            top: 18,
            left: 32,
            right: 32,
            height: 3,
            bgcolor: "#e2e8f0",
            borderRadius: 2,
            zIndex: 0,
          }}
        />

        {/* Progress line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(100, (currentStep / (OKR_STEPS.length - 1)) * 100)}%`,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: 18,
            left: 32,
            height: 3,
            background: isRejected
              ? "linear-gradient(90deg, #ef4444, #fca5a5)"
              : "linear-gradient(90deg, #1e3a8a, #3b82f6)",
            borderRadius: 4,
            zIndex: 1,
          }}
        />

        {OKR_STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const isRejectedStep = isRejected && isActive;

          return (
            <Box
              key={step.key}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isRejectedStep
                      ? "#fef2f2"
                      : isComplete
                        ? "#1e3a8a"
                        : isActive
                          ? "#eff6ff"
                          : "#f8fafc",
                    border: "3px solid",
                    borderColor: isRejectedStep
                      ? "#ef4444"
                      : isComplete
                        ? "#1e3a8a"
                        : isActive
                          ? "#3b82f6"
                          : "#e2e8f0",
                    transition: "all 0.3s ease",
                    boxShadow: isActive
                      ? isRejectedStep
                        ? "0 0 0 4px rgba(239,68,68,0.15)"
                        : "0 0 0 4px rgba(59,130,246,0.15)"
                      : "none",
                  }}
                >
                  {isRejectedStep ? (
                    <AlertTriangle size={16} color="#ef4444" />
                  ) : isComplete ? (
                    <Check size={16} color="white" strokeWidth={3} />
                  ) : isActive ? (
                    <Circle size={10} fill="#3b82f6" color="#3b82f6" />
                  ) : (
                    <Circle size={10} fill="#cbd5e1" color="#cbd5e1" />
                  )}
                </Box>
              </motion.div>

              {/* Label */}
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  fontWeight: isActive ? 700 : isComplete ? 600 : 400,
                  color: isRejectedStep
                    ? "#ef4444"
                    : isActive
                      ? "#1e3a8a"
                      : isComplete
                        ? "#1e3a8a"
                        : "#94a3b8",
                  textAlign: "center",
                  fontSize: isActive ? "0.8rem" : "0.7rem",
                  lineHeight: 1.3,
                  maxWidth: 90,
                }}
              >
                {t(step.labelKey)}
              </Typography>

              {/* Active description */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: isRejectedStep ? "#dc2626" : "#64748b",
                      textAlign: "center",
                      fontSize: "0.65rem",
                      maxWidth: 100,
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {isRejectedStep
                      ? t("dashboard.stepper.rejectedStepDesc")
                      : t(step.descriptionKey)}
                  </Typography>
                </motion.div>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
