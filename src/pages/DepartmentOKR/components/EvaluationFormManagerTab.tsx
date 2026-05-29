import { useState, useEffect, useMemo } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { CheckCircle, ExpandMore } from "@mui/icons-material";
import { api } from "../../../services/api";
import { showError } from "../../../utils/swal";
import EvaluationFormManagerDialog from "./EvaluationFormManagerDialog";
import { useNavigate } from "react-router-dom";

export default function EvaluationFormManagerTab() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [allCycles, setAllCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedCycle, setSelectedCycle] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("okr_form_approve_accordion_states");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetchEvaluations();
    fetchCycles();
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

  const fetchCycles = async () => {
    try {
      const res = await api.get("/performance/cycles");
      setAllCycles(res.data || []);
    } catch (error) {
      console.error("Error fetching cycles", error);
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
      const matchesCycle = selectedCycle === "ALL" || report.cycle?.name === selectedCycle;
      return matchesSearch && matchesDept && matchesCycle && report.status !== "PENDING_EVALUATION"; // Chỉ hiện đã nộp
    });
  }, [reports, searchQuery, selectedDepartment, selectedCycle]);

  const groupedByCycle = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredReports.forEach((report) => {
      const cycleName = report.cycle?.name || "Kỳ mặc định";
      if (!groups[cycleName]) groups[cycleName] = [];
      groups[cycleName].push(report);
    });
    return groups;
  }, [filteredReports]);

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
      showError("Lỗi", "Không thể cập nhật Phiếu Đánh Giá.");
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
        <TextField
          select
          size="small"
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          sx={{ minWidth: 200, bgcolor: "#fff" }}
        >
          <MenuItem value="ALL">Tất cả Kỳ đánh giá</MenuItem>
          {allCycles.map((c) => (
            <MenuItem key={c.id} value={c.name}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Typography>Đang tải dữ liệu...</Typography>
      ) : filteredReports.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 2, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <Typography color="text.secondary">
            Không có phiếu đánh giá nào đang chờ duyệt.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Object.entries(groupedByCycle).map(([cycleName, cycleReports]) => (
            <Accordion
              key={cycleName}
              expanded={expandedStates[cycleName] !== false}
              onChange={(_, expanded) => {
                const nextStates = { ...expandedStates, [cycleName]: expanded };
                setExpandedStates(nextStates);
                localStorage.setItem("okr_form_approve_accordion_states", JSON.stringify(nextStates));
              }}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px !important",
                overflow: "hidden",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  py: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight="700" color="#1e3a8a">
                    {cycleName}
                  </Typography>
                  <Chip
                    label={`${cycleReports.length} phiếu`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Nhân sự</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Bộ môn</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Kỳ đánh giá</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Tổng Điểm Tính (OKR)</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>NV Xếp Loại</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>QL Kết Luận</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cycleReports.map((report) => (
                        <TableRow hover key={report.id}>
                          <TableCell>
                            <Box 
                              sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer", "&:hover .user-name": { textDecoration: "underline" } }}
                              onClick={() => {
                                if (report.user?.id) navigate(`/departments/users/${report.user.id}`, { state: { parentName: "OKR Bộ Môn", parentUrl: "/departments/okr" } });
                              }}
                            >
                              <Avatar src={report.user?.avatarUrl} sx={{ width: 32, height: 32, bgcolor: "#1C4D8D", fontSize: "0.9rem" }}>
                                {report.user?.name?.[0] || "?"}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold" color="primary.main" className="user-name">
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
                            <Chip label={report.cycle?.name || "Kỳ mặc định"} size="small" variant="outlined" />
                          </TableCell>
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
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
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
