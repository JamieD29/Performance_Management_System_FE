import { Box, Typography } from "@mui/material";
import { Assignment } from "@mui/icons-material";
import type { StaffOkr } from "../../userDetail.types";
import OkrObjectiveCard from "./OkrObjectiveCard";

interface OkrTabPanelProps {
  okrs: StaffOkr[];
}

export default function OkrTabPanel({ okrs }: OkrTabPanelProps) {
  if (!okrs || okrs.length === 0) {
    return (
      <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Assignment sx={{ fontSize: 64, color: "#e2e8f0", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu OKR
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Nhân sự này chưa được giao hoặc chưa tạo OKR trong kỳ này.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {okrs.map((okr, index) => (
        <OkrObjectiveCard key={okr.id} okr={okr} defaultExpanded={index === 0} />
      ))}
    </Box>
  );
}
