import { Box, Paper, Typography, FormControl, Select, MenuItem, Chip } from "@mui/material";
import { Calendar } from "lucide-react";
import type { CycleInfo } from "../useDeanDashboardData";
import { useTranslation } from "react-i18next";

interface Props {
  cycles: CycleInfo[];
  selectedCycleId: string;
  onCycleChange: (id: string) => void;
  currentCycle: CycleInfo | null;
}

export default function CycleSelectorBar({ cycles, selectedCycleId, onCycleChange, currentCycle }: Props) {
  const { t, i18n } = useTranslation();

  if (cycles.length === 0) return null;

  const formatDateLocale = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US");
  };

  const getStatusLabel = (status: string) => {
    if (status === "OPEN") return t("deanDashboard.cycleSelector.status.open");
    if (status === "UPCOMING") return t("deanDashboard.cycleSelector.status.upcoming");
    return t("deanDashboard.cycleSelector.status.closed");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Calendar size={20} color="#2563eb" />
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
            {t("deanDashboard.cycleSelector.title")}
          </Typography>
          <FormControl size="small" variant="standard" sx={{ minWidth: 200 }}>
            <Select
              disableUnderline
              value={selectedCycleId}
              onChange={(e) => onCycleChange(e.target.value as string)}
              sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}
            >
              {cycles.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {currentCycle && (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={getStatusLabel(currentCycle.status)}
            color={currentCycle.status === "OPEN" ? "success" : currentCycle.status === "UPCOMING" ? "warning" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {currentCycle.startDate && currentCycle.endDate && (
            <Chip
              label={`${formatDateLocale(currentCycle.startDate)} - ${formatDateLocale(currentCycle.endDate)}`}
              variant="outlined"
              size="small"
            />
          )}
        </Box>
      )}
    </Paper>
  );
}
