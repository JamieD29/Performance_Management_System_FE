import { Box, Typography, Chip } from "@mui/material";
import { Assessment } from "@mui/icons-material";
import type { StaffEvaluation } from "../../userDetail.types";
import { EVALUATION_STATUS_MAP } from "../../userDetail.constants";
import ScoreComparisonBar from "./ScoreComparisonBar";
import TaskGroupTable from "./TaskGroupTable";
import CommentSection from "./CommentSection";

interface EvaluationTabPanelProps {
  evaluation: StaffEvaluation | null;
}

export default function EvaluationTabPanel({ evaluation }: EvaluationTabPanelProps) {
  if (!evaluation) {
    return (
      <Box sx={{ py: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Assessment sx={{ fontSize: 64, color: "#e2e8f0", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Không có phiếu đánh giá
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Nhân sự chưa được đánh giá hoặc chưa nộp phiếu trong kỳ này.
        </Typography>
      </Box>
    );
  }

  const statusConfig = EVALUATION_STATUS_MAP[evaluation.status] || EVALUATION_STATUS_MAP.DRAFT;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e293b" }}>
          Phiếu đánh giá hiệu suất
        </Typography>
        <Chip
          label={statusConfig.label}
          sx={{ bgcolor: statusConfig.bgcolor, color: statusConfig.color, fontWeight: 600 }}
        />
      </Box>

      <ScoreComparisonBar 
        selfScore={evaluation.selfScoreTotal} 
        managerScore={evaluation.principalScoreTotal} 
      />

      <TaskGroupTable groups={evaluation.evaluationData || []} />

      <CommentSection 
        selfComment={evaluation.selfComment}
        selfRating={evaluation.selfRating}
        managerComment={evaluation.managerComment}
        managerRating={evaluation.managerRating}
      />
    </Box>
  );
}
