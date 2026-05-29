import { Box, MenuItem, Select, Typography } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import type { CycleOption } from "../userDetail.types";

interface CycleSelectorProps {
  cycles: CycleOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function CycleSelector({ cycles, selectedId, onChange }: CycleSelectorProps) {
  if (!cycles || cycles.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Chưa có kỳ đánh giá nào.
      </Typography>
    );
  }

  const handleChange = (e: SelectChangeEvent) => {
    onChange(e.target.value as string);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Kỳ đánh giá:
      </Typography>
      <Select
        value={selectedId}
        onChange={handleChange}
        size="small"
        sx={{
          minWidth: 200,
          bgcolor: "#fff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#cbd5e1" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94a3b8" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" },
        }}
        renderValue={(selected) => {
          const c = cycles.find((x) => x.id === selected);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonth fontSize="small" sx={{ color: "#64748b" }} />
              <Typography variant="body2" fontWeight={500}>
                {c?.name || "Chọn kỳ"}
              </Typography>
            </Box>
          );
        }}
      >
        {cycles.map((cycle) => (
          <MenuItem key={cycle.id} value={cycle.id}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {cycle.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cycle.type === "SEMESTER" ? "Học kỳ" : cycle.type === "QUARTER" ? "Quý" : "Khác"}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
