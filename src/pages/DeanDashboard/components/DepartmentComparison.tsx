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
  LinearProgress,
} from "@mui/material";
import { Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import type { DepartmentStat } from "../useDeanDashboardData";
import { useTranslation } from "react-i18next";

interface Props {
  stats: DepartmentStat[];
}

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#e11d48", "#4f46e5"];

export default function DepartmentComparison({ stats }: Props) {
  const { t } = useTranslation();
  const chartData = stats
    .filter((d) => d.avgScore !== null)
    .map((d) => ({ name: d.deptCode || d.deptName, score: d.avgScore }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={20} color="#2563eb" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
              {t("deanDashboard.comparison.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("deanDashboard.comparison.subtitle")}
            </Typography>
          </Box>
        </Box>

        {/* Bảng so sánh */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>{t("deanDashboard.comparison.table.dept")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.comparison.table.members")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.comparison.table.completed")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", width: 180 }}>{t("deanDashboard.comparison.table.rate")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.comparison.table.submitted")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.comparison.table.unsubmitted")}</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>{t("deanDashboard.comparison.table.avgScore")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map((dept, index) => (
                <TableRow key={dept.deptId} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: COLORS[index % COLORS.length],
                        }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {dept.deptName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({dept.deptCode})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="body2" fontWeight={600}>
                      {dept.memberCount}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: "#16a34a" }}>
                      {dept.completedCount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={dept.completionRate}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            bgcolor:
                              dept.completionRate >= 70
                                ? "#16a34a"
                                : dept.completionRate >= 40
                                  ? "#d97706"
                                  : "#dc2626",
                          },
                        }}
                      />
                      <Typography variant="caption" fontWeight={700} sx={{ minWidth: 36, textAlign: "right" }}>
                        {dept.completionRate}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="body2" color={dept.submittedCount > 0 ? "#d97706" : "text.secondary"}>
                      {dept.submittedCount}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="body2" color={dept.acceptedCount > 0 ? "#dc2626" : "text.secondary"}>
                      {dept.acceptedCount}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: dept.avgScore ? "#1e40af" : "#94a3b8" }}>
                      {dept.avgScore ?? "—"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Bar Chart — ĐTB Điểm (luôn hiển thị) */}
        <Box sx={{ 
          p: 3, 
          pt: 2,
          "& .recharts-wrapper": { outline: "none !important" },
          "& .recharts-surface": { outline: "none !important" },
          "& *:focus": { outline: "none !important" }
        }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
            {t("deanDashboard.comparison.chartTitle")}
          </Typography>
          <ResponsiveContainer width="100%" height={200} style={{ outline: "none" }}>
            <BarChart data={chartData.length > 0 ? chartData : [{ name: "—", score: 0 }]} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} style={{ outline: "none" }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: 13,
                }}
                formatter={(value: any) => [`${value} ${t("deanDashboard.comparison.points")}`, t("deanDashboard.comparison.avgScore")]}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {(chartData.length > 0 ? chartData : [{ name: "—", score: 0 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </motion.div>
  );
}
