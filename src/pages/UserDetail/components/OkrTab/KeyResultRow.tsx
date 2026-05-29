import { Box, Typography } from "@mui/material";
import type { KeyResult } from "../../userDetail.types";
import { LinearProgress } from "@mui/material";

interface KeyResultRowProps {
  kr: KeyResult;
  selfEvidence?: string;
  managerScore?: number;
}

export default function KeyResultRow({ kr, selfEvidence, managerScore }: KeyResultRowProps) {
  const progress = kr.target > 0 ? (kr.actual / kr.target) * 100 : 0;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <Box sx={{ py: 2, borderBottom: "1px dashed #e2e8f0", "&:last-child": { borderBottom: "none" } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="body2" fontWeight={500} sx={{ color: "#334155", flex: 1 }}>
          {kr.content}
        </Typography>
        <Box sx={{ textAlign: "right", minWidth: 120 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ color: "#0f766e" }}>
            {kr.actual} / {kr.target} {kr.unit}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={clampedProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#f1f5f9",
              "& .MuiLinearProgress-bar": {
                bgcolor: clampedProgress >= 100 ? "#10b981" : "#3b82f6",
                borderRadius: 3,
              },
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: "#64748b", minWidth: 40, textAlign: "right" }}>
          {Math.round(clampedProgress)}%
        </Typography>
      </Box>

      {/* Chi tiết điểm & Minh chứng */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1.5, bgcolor: "#f8fafc", p: 1.5, borderRadius: 2 }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Minh chứng tự khai:
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569", mt: 0.5, fontStyle: selfEvidence ? "normal" : "italic" }}>
            {selfEvidence || "Chưa có minh chứng"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Trọng số / Max
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {kr.weight}% / {kr.maxScore}đ
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Điểm hệ thống
            </Typography>
            <Typography variant="body2" fontWeight={500} color="#3b82f6">
              {kr.score?.toFixed(1) || 0}đ
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Điểm quản lý
            </Typography>
            <Typography variant="body2" fontWeight="bold" color={managerScore !== undefined ? "#059669" : "text.disabled"}>
              {managerScore !== undefined ? `${managerScore.toFixed(1)}đ` : "—"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
