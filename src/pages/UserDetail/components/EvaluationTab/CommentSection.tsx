import { Box, Paper, Typography, Chip } from "@mui/material";
import { Person, SupportAgent } from "@mui/icons-material";
import { RATING_LABELS } from "../../userDetail.constants";
import { useTranslation } from "react-i18next";

interface CommentSectionProps {
  selfComment?: string;
  selfRating?: string;
  managerComment?: string;
  managerRating?: string;
}

export default function CommentSection({
  selfComment,
  selfRating,
  managerComment,
  managerRating,
}: CommentSectionProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      <Box>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#f8fafc", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Person sx={{ color: "#3b82f6" }} />
            <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">
              {t("userDetail.comment.selfCommentTitle")}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#475569", mb: 2, minHeight: 60, whiteSpace: "pre-wrap" }}>
            {selfComment || t("userDetail.comment.noSelfComment")}
          </Typography>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{t("userDetail.comment.selfRatingLabel")}</Typography>
            <Chip 
              label={selfRating ? (RATING_LABELS[selfRating] ? t(RATING_LABELS[selfRating]) : selfRating) : t("userDetail.status.noRating")} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        </Paper>
      </Box>
      
      <Box>
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#f0fdf4", height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <SupportAgent sx={{ color: "#059669" }} />
            <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">
              {t("userDetail.comment.managerCommentTitle")}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: "#475569", mb: 2, minHeight: 60, whiteSpace: "pre-wrap" }}>
            {managerComment || t("userDetail.comment.noManagerComment")}
          </Typography>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{t("userDetail.comment.managerRatingLabel")}</Typography>
            <Chip 
              label={managerRating ? (RATING_LABELS[managerRating] ? t(RATING_LABELS[managerRating]) : managerRating) : t("userDetail.status.noRating")} 
              size="small" 
              color="success" 
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
