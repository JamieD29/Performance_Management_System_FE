import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import type { TaskGroupData } from "../../userDetail.types";
import { useTranslation } from "react-i18next";

interface TaskGroupTableProps {
  groups: TaskGroupData[];
}

export default function TaskGroupTable({ groups }: TaskGroupTableProps) {
  const { t } = useTranslation();
  if (!groups || groups.length === 0) return null;

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, mb: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: "#f8fafc" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>{t("userDetail.evaluation.taskGroup")}</TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", color: "#475569" }}>{t("userDetail.evaluation.maxScore")}</TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", color: "#3b82f6" }}>{t("userDetail.evaluation.selfScore")}</TableCell>
            <TableCell align="right" sx={{ fontWeight: "bold", color: "#059669" }}>{t("userDetail.evaluation.managerScore")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.groupCode} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {group.groupCode}. {group.groupName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("userDetail.evaluation.weight")} {group.weight}%
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="text.secondary">{group.maxScore}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold" color="#3b82f6">
                  {group.selfScoreTotal?.toFixed(1) || 0}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold" color="#059669">
                  {group.principalScoreTotal?.toFixed(1) || 0}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
