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

interface Props {
  stats: DepartmentStat[];
}

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#e11d48", "#4f46e5"];

export default function DepartmentComparison({ stats }: Props) {
  if (stats.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", textAlign: "center" }}>
        <Typography color="text.secondary">Chưa có dữ liệu bộ môn</Typography>
      </Paper>
    );
  }

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
              So Sánh Đơn Vị / Bộ Môn
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tổng quan tiến độ và hiệu suất từng đơn vị
            </Typography>
          </Box>
        </Box>

        {/* Bảng so sánh */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Đơn vị</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>Nhân sự</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>Hoàn thành</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", width: 180 }}>Tỷ lệ</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>Chờ chấm</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>Chưa nộp</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>ĐTB</TableCell>
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

        {/* Bar Chart — ĐTB Điểm */}
        {chartData.length > 0 && (
          <Box sx={{ 
            p: 3, 
            pt: 2,
            "& .recharts-wrapper": { outline: "none !important" },
            "& .recharts-surface": { outline: "none !important" },
            "& *:focus": { outline: "none !important" }
          }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
              Điểm Trung Bình Theo Đơn Vị
            </Typography>
            <ResponsiveContainer width="100%" height={200} style={{ outline: "none" }}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }} style={{ outline: "none" }}>
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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} điểm`, "ĐTB"]}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
}
