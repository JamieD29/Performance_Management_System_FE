import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Avatar,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { api } from "../../../services/api";
import EvaluationFormManagerDialog from "./EvaluationFormManagerDialog";

export default function EvaluationFormManagerTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/okrs/evaluations/submitted");
      setReports(res.data || []);
    } catch (error) {
      console.error("Error fetching evaluations", error);
    } finally {
      setLoading(false);
    }
  };

  const departmentOptions = useMemo(() => {
    const depts = new Set(reports.map(r => r.user?.department?.name).filter(Boolean));
    return ["ALL", ...Array.from(depts)];
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            report.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDepartment === "ALL" || report.user?.department?.name === selectedDepartment;
      return matchesSearch && matchesDept && report.status !== "PENDING_EVALUATION"; // Chỉ hiện đã nộp
    });
  }, [reports, searchQuery, selectedDepartment]);

  const handleOpenDialog = (report: any) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleSaveEvaluation = async (updatedReport: any) => {
    try {
      await api.put(`/okrs/evaluations/${updatedReport.id}/review`, {
        managerComment: updatedReport.managerComment,
        managerRating: updatedReport.managerRating
      });
      setDialogOpen(false);
      fetchEvaluations();
    } catch (e) {
      console.error(e);
      window.alert("Lỗi cập nhật Phiếu");
    }
  };

  const getRatingLabel = (code: string) => {
    switch (code) {
      case "EXCELLENT": return "Hoàn thành Tốt";
      case "GOOD": return "Hoàn thành";
      case "POOR": return "Không hoàn thành";
      default: return "Chưa xếp loại";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Tìm kiếm nhân sự..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 250, bgcolor: "#fff" }}
        />
        <TextField
          select
          size="small"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          sx={{ minWidth: 200, bgcolor: "#fff" }}
        >
          {departmentOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option === "ALL" ? "Tất cả Phòng Ban" : option}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Typography>Đang tải dữ liệu...</Typography>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Nhân sự</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Bộ môn</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tổng Điểm Tính (OKR)</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>NV Xếp Loại</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>QL Kết Luận</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow hover key={report.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "#1C4D8D", fontSize: "0.9rem" }}>
                        {report.user?.name?.[0] || "?"}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {report.user?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{report.user?.department?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="#2563eb">{report.selfScoreTotal?.toFixed(1) || 0}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getRatingLabel(report.selfRating)} variant="outlined" color={report.selfRating === 'EXCELLENT' ? 'success' : report.selfRating === 'POOR' ? 'error' : 'primary'} size="small"/>
                  </TableCell>
                  <TableCell>
                    {report.status === "EVALUATED" ? (
                      <Chip label={getRatingLabel(report.managerRating)} color={report.managerRating === 'EXCELLENT' ? 'success' : report.managerRating === 'POOR' ? 'error' : 'primary'} size="small"/>
                    ) : (
                      <Typography variant="body2" fontStyle="italic" color="text.secondary">Chưa đánh giá</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {report.status === "EVALUATED" ? (
                      <Chip label="Đã hoàn tất" color="success" size="small" />
                    ) : (
                      <Chip label="Chờ duyệt" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Xem & Đánh giá">
                      <IconButton color="primary" onClick={() => handleOpenDialog(report)}>
                        <CheckCircle />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    Không có phiếu đánh giá nào đang chờ duyệt.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {dialogOpen && (
        <EvaluationFormManagerDialog
          open={dialogOpen}
          reportData={selectedReport}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveEvaluation}
        />
      )}
    </Box>
  );
}
