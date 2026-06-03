import { Box, Typography, Chip, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { ExpandMore, Flag } from "@mui/icons-material";
import type { StaffOkr } from "../../userDetail.types";
import { OKR_STATUS_MAP } from "../../userDetail.constants";
import KeyResultRow from "./KeyResultRow";
import { useTranslation } from "react-i18next";

interface OkrObjectiveCardProps {
  okr: StaffOkr;
  defaultExpanded?: boolean;
}

export default function OkrObjectiveCard({ okr, defaultExpanded = true }: OkrObjectiveCardProps) {
  const { t } = useTranslation();
  const statusConfig = OKR_STATUS_MAP[okr.status] || OKR_STATUS_MAP.PENDING;

  // Tính tổng điểm thực tế từ các KR (nếu chưa có totalScore)
  const calculatedScore = okr.keyResults.reduce((sum, kr) => sum + (kr.score || 0), 0);
  const displayScore = okr.totalScore > 0 ? okr.totalScore : calculatedScore;

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      elevation={0}
      sx={{
        border: "1px solid #e2e8f0",
        borderRadius: "12px !important",
        mb: 2,
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", pr: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Flag sx={{ color: "#3b82f6" }} />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#1e293b" }}>
              {okr.objective}
            </Typography>
            <Chip
              label={t(statusConfig.labelKey)}
              size="small"
              sx={{ bgcolor: statusConfig.bgcolor, color: statusConfig.color, fontWeight: 600, fontSize: "0.7rem" }}
            />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {t("userDetail.okr.totalScore")}
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold" color="#0f766e">
              {displayScore.toFixed(1)}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3, bgcolor: "#fff" }}>
        {okr.keyResults.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            {t("userDetail.okr.noKeyResults")}
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {okr.keyResults.map((kr) => {
              const selfEvidence = okr.selfReportData?.[kr.id]?.evidence;
              // Nếu bạn lưu điểm quản lý từng KR trong managerReportData
              // const managerScore = okr.managerReportData?.[kr.id]?.score; 
              
              return (
                <KeyResultRow
                  key={kr.id}
                  kr={kr}
                  selfEvidence={selfEvidence}
                />
              );
            })}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
