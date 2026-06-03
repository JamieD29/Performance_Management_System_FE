import { Box, Typography } from "@mui/material";
import { Assignment } from "@mui/icons-material";
import type { StaffOkr } from "../../userDetail.types";
import OkrObjectiveCard from "./OkrObjectiveCard";
import { useTranslation } from "react-i18next";

interface OkrTabPanelProps {
  okrs: StaffOkr[];
}

export default function OkrTabPanel({ okrs }: OkrTabPanelProps) {
  const { t } = useTranslation();
  if (!okrs || okrs.length === 0) {
    return (
      <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Assignment sx={{ fontSize: 64, color: "#e2e8f0", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {t("userDetail.okr.noOkrData")}
        </Typography>
        <Typography variant="body2" color="text.disabled">
          {t("userDetail.okr.noOkrDataDesc")}
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
