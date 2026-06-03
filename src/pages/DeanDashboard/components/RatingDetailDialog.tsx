import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type { RatingPersonItem } from "../useDeanDashboardData";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onClose: () => void;
  ratingKey: string | null;
  ratingLabel: string;
  ratingColor: string;
  people: RatingPersonItem[];
}

export default function RatingDetailDialog({ open, onClose, ratingLabel, ratingColor, people }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: ratingColor }} />
          <Typography variant="h6" fontWeight="bold">
            {t("deanDashboard.distribution.dialog.title", { label: ratingLabel })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1, bgcolor: "#f1f5f9", px: 1, py: 0.5, borderRadius: 2 }}>
            {t("deanDashboard.distribution.dialog.staffCount", { count: people.length })}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 0 }}>
        {people.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">{t("deanDashboard.distribution.dialog.empty")}</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>{t("deanDashboard.distribution.dialog.table.staff")}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t("deanDashboard.distribution.dialog.table.dept")}</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>{t("deanDashboard.distribution.dialog.table.selfScore")}</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>{t("deanDashboard.distribution.dialog.table.managerScore")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {people.map((person, idx) => (
                  <TableRow key={person.userId + idx} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar src={person.userAvatar || undefined} sx={{ width: 32, height: 32 }}>
                          {person.userName.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {person.userName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {person.deptName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography variant="body2" fontWeight={600} color={person.selfScore !== null ? "#1e40af" : "text.secondary"}>
                        {person.selfScore !== null ? person.selfScore : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography variant="body2" fontWeight={700} color={person.managerScore !== null ? "#16a34a" : "text.secondary"}>
                        {person.managerScore !== null ? person.managerScore : "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
