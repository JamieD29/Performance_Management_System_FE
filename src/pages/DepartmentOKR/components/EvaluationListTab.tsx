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
  const [tabValue, setTabValue] = useState(0); // 0: SUBMITTED, 1: COMPLETED
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  useEffect(() => {
    fetchEvaluations();
  }, [tabValue]);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const endpoint = tabValue === 0 ? "/okrs/submitted" : "/okrs/completed";
      const res = await api.get(endpoint);
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
      // 1. Lọc theo Phím tìm kiếm (Tên / Email)
      const matchesSearch = report.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            report.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Lọc theo Department
      const matchesDept = selectedDepartment === "ALL" || report.user?.department?.name === selectedDepartment;

      return matchesSearch && matchesDept;
    });
  }, [reports, searchQuery, selectedDepartment]);

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
    // Để an toàn, bulk review manager có thể lấy data selfReportData để lưu luôn
    alert("Chức năng Duyệt hàng loạt hiện đang được bảo trì cho quy trình tính điểm phức hợp.");
  };

  const handleQuickApproveSingle = async (report: any) => {
    try {
      await api.put(`/okrs/${report.id}/manager-review`, {
        managerReportData: report.selfReportData // Đồng ý toàn bộ điểm của nhân sự
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
      await api.put(`/okrs/${updatedReport.id}/manager-review`, {
        managerReportData: updatedReport.managerReportData
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
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>Điểm Tự Khai (Tổng)</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e293b", textAlign: "center" }}>Điểm Q.Lý Duyệt (Tổng)</TableCell>
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
                          {report.managerScore != null ? report.managerScore : report.totalScore}%
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={600} color="text.secondary">
                          {report.totalScore?.toFixed(1) || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {report.status === "COMPLETED" ? (
                          <Typography fontWeight={700} color="#1C4D8D">
                            {report.managerScore?.toFixed(1) || 0}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            Chưa chấm
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {report.status === "COMPLETED" ? (
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
                        {report.status === "SUBMITTED" && (
                          <Tooltip title="Chấp nhận điểm tự khai">
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
