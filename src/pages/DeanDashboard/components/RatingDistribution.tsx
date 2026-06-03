import { useState } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Award } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { RatingPersonItem } from "../useDeanDashboardData";
import RatingDetailDialog from "./RatingDetailDialog";
import { useTranslation } from "react-i18next";

interface Props {
  distribution: Record<string, number>;
  ratingDetails: Record<string, RatingPersonItem[]>;
}

const ratingColors: Record<string, string> = {
  EXCELLENT: "#16a34a",
  GOOD: "#2563eb",
  FAIR: "#d97706",
  AVERAGE: "#6b7280",
  POOR: "#dc2626",
};

export default function RatingDistribution({ distribution, ratingDetails }: Props) {
  const { t } = useTranslation();
  const [selectedRating, setSelectedRating] = useState<string | null>(null);

  const getRatingLabel = (key: string) => {
    return t(`userDetail.rating.${key.toLowerCase()}`, { defaultValue: key });
  };

  const entries = Object.entries(distribution);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const chartData = entries.map(([key, value]) => ({
    key,
    name: getRatingLabel(key),
    value,
    color: ratingColors[key] || "#6b7280",
  }));

  const handleClose = () => setSelectedRating(null);

  const selectedData = selectedRating ? {
    key: selectedRating,
    label: getRatingLabel(selectedRating),
    color: ratingColors[selectedRating] || "#6b7280",
    people: ratingDetails[selectedRating] || []
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      style={{ height: "100%" }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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
              {t("deanDashboard.distribution.title")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("deanDashboard.distribution.subtitle", { total })}
            </Typography>
          </Box>
        </Box>

        {/* Pie chart — căn giữa */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          mb: 1, 
          outline: "none",
          "& .recharts-wrapper": { outline: "none !important" },
          "& .recharts-surface": { outline: "none !important" },
          "& *:focus": { outline: "none !important" }
        }}>
          <PieChart width={200} height={200} style={{ outline: "none" }}>
            <Pie
              data={chartData.length > 0 ? chartData : [{ name: t("deanDashboard.distribution.empty"), value: 1, color: "#e2e8f0" }]}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={chartData.length > 0 ? 3 : 0}
              dataKey="value"
              stroke="none"
              style={{ outline: "none", cursor: chartData.length > 0 ? "pointer" : "default" }}
              onClick={(data) => {
                if (chartData.length > 0 && data && data.payload && data.payload.key) {
                  setSelectedRating(data.payload.key);
                }
              }}
            >
              {(chartData.length > 0 ? chartData : [{ name: t("deanDashboard.distribution.empty"), value: 1, color: "#e2e8f0" }]).map((entry, i) => (
                <Cell key={i} fill={entry.color} style={{ outline: "none" }} />
              ))}
            </Pie>
            {chartData.length > 0 && (
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: 13,
                  cursor: "pointer"
                }}
                formatter={(value: any, name: any) => [
                  t("deanDashboard.distribution.tooltip", {
                    value,
                    percent: total > 0 ? Math.round((value / total) * 100) : 0,
                  }),
                  name,
                ]}
              />
            )}
          </PieChart>
        </Box>

        {/* Legend bars — bên dưới pie, chiếm phần còn lại */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0.5 }}>
          {chartData.length > 0 ? chartData.map((item) => (
            <Box 
              key={item.name} 
              sx={{ mb: 1, cursor: "pointer", transition: "opacity 0.2s", "&:hover": { opacity: 0.8 } }}
              onClick={() => setSelectedRating(item.key)}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: item.color, flexShrink: 0 }} />
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
                  height: 7,
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
          )) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              {t("deanDashboard.distribution.noData")}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Dialog Danh Sách Người */}
      {selectedData && (
        <RatingDetailDialog
          open={Boolean(selectedRating)}
          onClose={handleClose}
          ratingKey={selectedData.key}
          ratingLabel={selectedData.label}
          ratingColor={selectedData.color}
          people={selectedData.people}
        />
      )}
    </motion.div>
  );
}
