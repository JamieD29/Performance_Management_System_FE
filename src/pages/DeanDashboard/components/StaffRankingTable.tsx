import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from "@mui/material";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { StaffRankItem } from "../useDeanDashboardData";
import { useTranslation } from "react-i18next";

interface Props {
  ranking: StaffRankItem[];
}

const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
export default function StaffRankingTable({ ranking }: Props) {
  const { t } = useTranslation();

  const statusMap: Record<string, { label: string; color: string; bg: string }> = {
    COMPLETED: { label: t("deanDashboard.ranking.status.completed"), color: "#166534", bg: "#dcfce7" },
    SUBMITTED: { label: t("deanDashboard.ranking.status.submitted"), color: "#92400e", bg: "#fef3c7" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{ height: "100%" }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={20} color="#d97706" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
              {t("deanDashboard.ranking.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("deanDashboard.ranking.subtitle")}
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 460 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", width: 50, textAlign: "center" }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>{t("deanDashboard.ranking.table.name")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>{t("deanDashboard.ranking.table.dept")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.ranking.table.selfScore")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.ranking.table.managerScore")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.ranking.table.status")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("deanDashboard.ranking.noData")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ranking.map((item, index) => {
                  const st = statusMap[item.status] || { label: item.status, color: "#475569", bg: "#f1f5f9" };
                  const displayJobTitle = item.jobTitle
                    ? t(`profile.enums.jobTitle.${item.jobTitle}`, { defaultValue: item.jobTitle })
                    : "";
                  return (
                    <TableRow
                      key={item.okrId}
                      sx={{
                        "&:hover": { bgcolor: "#f8fafc" },
                        transition: "background 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ textAlign: "center" }}>
                        {index < 3 ? (
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              bgcolor: rankColors[index],
                              color: "white",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: 13,
                              boxShadow: `0 2px 8px ${rankColors[index]}60`,
                            }}
                          >
                            {index + 1}
                          </Box>
                        ) : (
                          <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {index + 1}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            src={item.userAvatar || undefined}
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: 14,
                              bgcolor: "#e2e8f0",
                              color: "#475569",
                            }}
                          >
                            {item.userName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                              {item.userName}
                            </Typography>
                            {displayJobTitle && (
                              <Typography variant="caption" color="text.secondary">
                                {displayJobTitle}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.deptCode || item.deptName}
                          size="small"
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#1e40af",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 24,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.totalScore}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: item.managerScore !== null ? "#16a34a" : "#94a3b8" }}
                        >
                          {item.managerScore !== null ? item.managerScore : "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          label={st.label}
                          size="small"
                          sx={{
                            bgcolor: st.bg,
                            color: st.color,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            height: 22,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
}
