import { Paper, Typography, Box } from "@mui/material";
import { Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface Props {
  distribution: Record<string, number>;
}

const ratingLabels: Record<string, string> = {
  EXCELLENT: "Xuất sắc",
  GOOD: "Tốt",
  FAIR: "Khá",
  AVERAGE: "Trung bình",
  POOR: "Yếu",
};

const ratingColors: Record<string, string> = {
  EXCELLENT: "#16a34a",
  GOOD: "#2563eb",
  FAIR: "#d97706",
  AVERAGE: "#6b7280",
  POOR: "#dc2626",
};

export default function RatingDistribution({ distribution }: Props) {
  const entries = Object.entries(distribution);
  if (entries.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", textAlign: "center" }}>
        <Typography color="text.secondary">Chưa có dữ liệu xếp loại</Typography>
      </Paper>
    );
  }

  const total = entries.reduce((s, [, v]) => s + v, 0);
  const chartData = entries.map(([key, value]) => ({
    name: ratingLabels[key] || key,
    value,
    color: ratingColors[key] || "#6b7280",
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#f0fdf4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Award size={20} color="#16a34a" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
              Phân Bổ Xếp Loại
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tổng {total} phiếu đánh giá đã xếp loại
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 3 }}>
          {/* Pie chart */}
          <Box sx={{ width: 220, height: 220, flexShrink: 0 }}>
            <PieChart width={220} height={220}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: 13,
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [`${value} người (${Math.round((value / total) * 100)}%)`, name]}
              />
            </PieChart>
          </Box>

          {/* Legend bars */}
          <Box sx={{ flex: 1, width: "100%" }}>
            {chartData.map((item) => (
              <Box key={item.name} sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: item.color }} />
                    <Typography variant="body2" fontWeight={600}>
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: item.color }}>
                    {item.value} ({Math.round((item.value / total) * 100)}%)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#f1f5f9",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${(item.value / total) * 100}%`,
                      bgcolor: item.color,
                      borderRadius: 3,
                      transition: "width 0.6s ease",
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
}
