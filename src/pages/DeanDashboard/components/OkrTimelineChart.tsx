import { Paper, Typography, Box } from "@mui/material";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TimelinePoint } from "../useDeanDashboardData";

interface Props {
  data: TimelinePoint[];
}

export default function OkrTimelineChart({ data }: Props) {
  // Tính tích lũy
  let cumulCompleted = 0;
  let cumulSubmitted = 0;
  const cumulativeData = data.map((d) => {
    cumulCompleted += d.completed;
    cumulSubmitted += d.submitted;
    return {
      ...d,
      cumulCompleted,
      cumulSubmitted,
    };
  });

  if (cumulativeData.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          height: 380,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          Chưa có dữ liệu timeline trong kỳ hiện tại
        </Typography>
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
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
            <TrendingUp size={20} color="#2563eb" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
              Tiến Độ OKR Theo Thời Gian
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Số lượng OKR tích lũy qua từng tuần trong kỳ
            </Typography>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cumulativeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradSubmitted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="weekLabel"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                fontSize: 13,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                const label = name === "cumulCompleted" ? "Hoàn thành" : "Đã nộp";
                return [value, label];
              }}
            />
            <Legend
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) =>
                value === "cumulCompleted" ? "Hoàn thành (TK đã chấm)" : "Đã nộp tự khai"
              }
              wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
            />
            <Area
              type="monotone"
              dataKey="cumulSubmitted"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#gradSubmitted)"
              dot={{ r: 3, fill: "#2563eb" }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="cumulCompleted"
              stroke="#16a34a"
              strokeWidth={2.5}
              fill="url(#gradCompleted)"
              dot={{ r: 3, fill: "#16a34a" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>
    </motion.div>
  );
}
