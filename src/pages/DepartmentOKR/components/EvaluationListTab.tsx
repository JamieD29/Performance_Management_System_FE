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
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Checkbox,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { CheckCircle, Assessment, Description, Search, CheckBoxOutlineBlank, CheckBox } from "@mui/icons-material";
import EvaluationDetailsDialog from "./EvaluationDetailsDialog";
import { api } from "../../../services/api";

export default function EvaluationListTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filters
  const [tabValue, setTabValue] = useState(0); // 0: PENDING_EVALUATION, 1: EVALUATED
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      // Gọi API Sync để tạo dummy record cho user nếu họ chưa có. Xóa dòng này ở Prod.
      await api.post("/okrs/evaluations/sync");
      const res = await api.get("/okrs/evaluations/submitted");
      setReports(res.data || []);
    } catch (error) {
      console.error("Error fetching evaluations", error);
    } finally {
      setLoading(false);
    }
  };

  // Các tùy chọn phòng ban từ dữ liệu thực tế
  const departmentOptions = useMemo(() => {
    const depts = new Set(reports.map(r => r.user?.department?.name).filter(Boolean));
    return ["ALL", ...Array.from(depts)];
  }, [reports]);

  // Lọc dữ liệu
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // 1. Lọc theo Tab Trạng Thái
      const matchesStatus = tabValue === 0 
        ? report.status === "PENDING_EVALUATION" 
        : report.status === "EVALUATED";
      
      // 2. Lọc theo Phím tìm kiếm (Tên / Email)
      const matchesSearch = report.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            report.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 3. Lọc theo Department
      const matchesDept = selectedDepartment === "ALL" || report.user?.department?.name === selectedDepartment;

      return matchesStatus && matchesSearch && matchesDept;
    });
  }, [reports, tabValue, searchQuery, selectedDepartment]);

  // Handle Selection
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredReports.map((n) => n.id);
      setSelectedRowIds(newSelected);
      return;
    }
    setSelectedRowIds([]);
  };

  const handleRowClick = (id: string) => {
    const selectedIndex = selectedRowIds.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRowIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRowIds.slice(1));
    } else if (selectedIndex === selectedRowIds.length - 1) {
      newSelected = newSelected.concat(selectedRowIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRowIds.slice(0, selectedIndex),
        selectedRowIds.slice(selectedIndex + 1),
      );
    }
    setSelectedRowIds(newSelected);
  };

  const isSelected = (id: string) => selectedRowIds.indexOf(id) !== -1;

  // Handle API Submissions
  const handleTickAllSelected = async () => {
    if (selectedRowIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc đánh giá Max điểm cho ${selectedRowIds.length} nhân viên đã chọn?`)) return;

    try {
      const updates = selectedRowIds.map(id => {
        const report = reports.find(r => r.id === id);
        const maxTasks = report.evaluationData.map((t: any) => ({ ...t, principalScore: t.maxScore }));
        const maxScoreTotal = maxTasks.reduce((sum: number, t: any) => sum + t.principalScore, 0);
        return { evaluationId: id, tasks: maxTasks, principalScoreTotal: maxScoreTotal };
      });

      await api.put("/okrs/evaluations/bulk-review", { updates });
      alert("Đã cập nhật hàng loạt thành công!");
      setSelectedRowIds([]);
      fetchEvaluations();
    } catch (e) {
      console.error(e);
      alert("Đã xảy ra lỗi khi duyệt hàng loạt");
    }
  };

  const handleQuickApproveSingle = async (report: any) => {
    try {
      const maxTasks = report.evaluationData.map((t: any) => ({ ...t, principalScore: t.maxScore }));
      const maxScoreTotal = maxTasks.reduce((sum: number, t: any) => sum + t.principalScore, 0);
      
      await api.put(`/okrs/evaluations/${report.id}/review`, {
        tasks: maxTasks,
        principalScoreTotal: maxScoreTotal
      });
      fetchEvaluations();
    } catch (e) {
      console.error(e);
      alert("Lỗi cập nhật");
    }
  };

  const handleSaveEvaluation = async (updatedReport: any) => {
    setDialogOpen(false);
    try {
      await api.put(`/okrs/evaluations/${updatedReport.id}/review`, {
        tasks: updatedReport.evaluationData,
        principalScoreTotal: updatedReport.principalScoreTotal
      });
      fetchEvaluations();
    } catch (e) {
      console.error(e);
      alert("Lỗi cập nhật");
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" color="#1e3a8a" sx={{ mb: 3 }}>
        Đánh Giá Hiệu Suất / Báo Cáo NV
      </Typography>

      {/* Control Panel: Search & Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          
          <Tabs value={tabValue} onChange={(_, v) => { setTabValue(v); setSelectedRowIds([]); }} sx={{ borderRight: 1, borderColor: "divider", pr: 2 }}>
            <Tab label={`Cần đánh giá (${reports.filter(r => r.status === "PENDING_EVALUATION").length})`} />
            <Tab label={`Lịch sử Đã duyệt (${reports.filter(r => r.status === "EVALUATED").length})`} />
          </Tabs>

          <TextField
            size="small"
            placeholder="Tìm theo Tên hoặc Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Bộ môn / Phòng ban</InputLabel>
            <Select 
              value={selectedDepartment} 
              label="Bộ môn / Phòng ban"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departmentOptions.map(dept => (
                <MenuItem key={dept as string} value={dept as string}>
                  {dept === "ALL" ? "Tất cả Bộ môn" : dept as string}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Bulk Action Button */}
          {tabValue === 0 && selectedRowIds.length > 0 && (
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<CheckCircle />}
              onClick={handleTickAllSelected}
              sx={{ ml: "auto" }}
            >
              Tick All Đạt Tối Đa ({selectedRowIds.length})
            </Button>
          )}

        </Box>
      </Paper>

      {/* Data Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                {tabValue === 0 && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selectedRowIds.length > 0 && selectedRowIds.length < filteredReports.length}
                      checked={filteredReports.length > 0 && selectedRowIds.length === filteredReports.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>Nhân sự</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b" }}>Bộ môn</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>% OKR Hoàn thành</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>Điểm Cá nhân (Tổng)</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>Điểm Hiệu trưởng (Tổng)</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", color: "#1e293b" }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Không có báo cáo nào khớp với điều kiện lọc.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => {
                  const isItemSelected = isSelected(report.id);
                  return (
                    <TableRow 
                      key={report.id} 
                      hover 
                      selected={isItemSelected}
                      sx={{ transition: "all 0.2s ease" }}
                    >
                      {tabValue === 0 && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onChange={() => handleRowClick(report.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: "#1C4D8D", width: 36, height: 36 }}>
                            {report.user?.name?.[0] || "?"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#0f172a">
                              {report.user?.name || "No name"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {report.user?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={report.user?.department?.name || "N/A"} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "#ecfdf5", color: "#059669", px: 1.5, py: 0.5, borderRadius: 2, fontWeight: "bold" }}>
                          {report.completionPercent}%
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={600} color="text.secondary">
                          {report.selfScoreTotal}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {report.principalScoreTotal !== null && report.status === "EVALUATED" ? (
                          <Typography fontWeight={700} color="#1C4D8D">
                            {report.principalScoreTotal}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            Chưa có
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {report.status === "EVALUATED" ? (
                          <Chip label="Đã đánh giá" color="success" size="small" sx={{ fontWeight: 500 }} />
                        ) : (
                          <Chip label="Chờ đánh giá" color="warning" size="small" sx={{ fontWeight: 500 }} />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Đánh giá chi tiết">
                          <IconButton color="primary" onClick={() => { setSelectedReport(report); setDialogOpen(true); }}>
                            <Description />
                          </IconButton>
                        </Tooltip>
                        {report.status === "PENDING_EVALUATION" && (
                          <Tooltip title="Tick All Đạt Tối Đa">
                            <IconButton color="success" onClick={() => handleQuickApproveSingle(report)}>
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog Đánh giá chi tiết */}
      {selectedReport && (
        <EvaluationDetailsDialog 
          open={dialogOpen} 
          reportData={selectedReport} 
          onClose={() => setDialogOpen(false)} 
          onSave={handleSaveEvaluation} 
        />
      )}
    </Box>
  );
}
