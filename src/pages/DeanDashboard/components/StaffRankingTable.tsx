import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
} from "@mui/material";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { StaffRankItem } from "../useDeanDashboardData";

interface Props {
  ranking: StaffRankItem[];
}

const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  COMPLETED: { label: "Hoàn thành", color: "#166534", bg: "#dcfce7" },
  SUBMITTED: { label: "Chờ chấm", color: "#92400e", bg: "#fef3c7" },
};

const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze

export default function StaffRankingTable({ ranking }: Props) {
  if (ranking.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <Typography color="text.secondary">Chưa có dữ liệu xếp hạng</Typography>
      </Paper>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{ height: "100%" }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, pb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={20} color="#d97706" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
              Bảng Xếp Hạng Cá Nhân
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Xếp theo điểm Trưởng khoa chấm (cao → thấp)
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 460 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", width: 50, textAlign: "center" }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Họ tên</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Bộ môn</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>Tự khai</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>TK chấm</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", textAlign: "center" }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.map((item, index) => {
                const st = statusMap[item.status] || { label: item.status, color: "#475569", bg: "#f1f5f9" };
                return (
                  <TableRow
                    key={item.okrId}
                    sx={{
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background 0.15s ease",
                    }}
                  >
                    <TableCell sx={{ textAlign: "center" }}>
                      {index < 3 ? (
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            bgcolor: rankColors[index],
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 13,
                            boxShadow: `0 2px 8px ${rankColors[index]}60`,
                          }}
                        >
                          {index + 1}
                        </Box>
                      ) : (
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                          {index + 1}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          src={item.userAvatar || undefined}
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: 14,
                            bgcolor: "#e2e8f0",
                            color: "#475569",
                          }}
                        >
                          {item.userName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                            {item.userName}
                          </Typography>
                          {item.jobTitle && (
                            <Typography variant="caption" color="text.secondary">
                              {item.jobTitle}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.deptCode || item.deptName}
                        size="small"
                        sx={{
                          bgcolor: "#eff6ff",
                          color: "#1e40af",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.totalScore}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: item.managerScore !== null ? "#16a34a" : "#94a3b8" }}
                      >
                        {item.managerScore !== null ? item.managerScore : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Chip
                        label={st.label}
                        size="small"
                        sx={{
                          bgcolor: st.bg,
                          color: st.color,
                          fontWeight: 600,
                          fontSize: "0.72rem",
                          height: 22,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
}
