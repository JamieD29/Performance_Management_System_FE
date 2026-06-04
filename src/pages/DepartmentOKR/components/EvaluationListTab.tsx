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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  Description,
  Search,
  ExpandMore,
} from "@mui/icons-material";
import EvaluationDetailsDialog from "./EvaluationDetailsDialog";
import { api } from "../../../services/api";
import { showInfo, showError } from "../../../utils/swal";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function EvaluationListTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [acceptedReports, setAcceptedReports] = useState<any[]>([]);
  const [submittedReports, setSubmittedReports] = useState<any[]>([]);
  const [completedReports, setCompletedReports] = useState<any[]>([]);
  const [allCycles, setAllCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("okr_report_accordion_states");
    return saved ? JSON.parse(saved) : {};
  });

  // Filters
  const [tabValue, setTabValue] = useState(0); // 0: ACCEPTED, 1: SUBMITTED, 2: COMPLETED
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedCycle, setSelectedCycle] = useState("ALL");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  useEffect(() => {
    fetchEvaluations();
    fetchCycles();
  }, []);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const [acceptedRes, submittedRes, completedRes] = await Promise.all([
        api.get("/okrs/accepted"),
        api.get("/okrs/submitted"),
        api.get("/okrs/completed"),
      ]);
      setAcceptedReports(acceptedRes.data || []);
      setSubmittedReports(submittedRes.data || []);
      setCompletedReports(completedRes.data || []);
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

  const reports = useMemo(() => {
    if (tabValue === 0) return acceptedReports;
    if (tabValue === 1) return submittedReports;
    return completedReports;
  }, [tabValue, acceptedReports, submittedReports, completedReports]);

  // Các tùy chọn phòng ban từ dữ liệu thực tế
  const departmentOptions = useMemo(() => {
    const depts = new Set(
      reports.map((r) => r.user?.department?.name).filter(Boolean),
    );
    return ["ALL", ...Array.from(depts)];
  }, [reports]);

  // Lọc dữ liệu
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // 1. Lọc theo Phím tìm kiếm (Tên / Email)
      const matchesSearch =
        report.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Lọc theo Department
      const matchesDept =
        selectedDepartment === "ALL" ||
        report.user?.department?.name === selectedDepartment;

      // 3. Lọc theo Kỳ đánh giá
      const matchesCycle =
        selectedCycle === "ALL" ||
        report.cycle?.name === selectedCycle;

      return matchesSearch && matchesDept && matchesCycle;
    });
  }, [reports, searchQuery, selectedDepartment, selectedCycle]);

  // Group reports by Evaluation Cycle
  const groupedByCycle = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredReports.forEach((report) => {
      const cycleName = report.cycle?.name || "Kỳ mặc định";
      if (!groups[cycleName]) groups[cycleName] = [];
      groups[cycleName].push(report);
    });
    return groups;
  }, [filteredReports]);

  // Handle Selection
  const handleSelectCycleClick = (cycleReports: any[], checked: boolean) => {
    const cycleIds = cycleReports.map((r) => r.id);
    if (checked) {
      setSelectedRowIds((prev) => {
        const next = [...prev];
        cycleIds.forEach((id) => {
          if (!next.includes(id)) next.push(id);
        });
        return next;
      });
    } else {
      setSelectedRowIds((prev) => prev.filter((id) => !cycleIds.includes(id)));
    }
  };

  const getCycleSelectionStatus = (cycleReports: any[]) => {
    const cycleIds = cycleReports.map((r) => r.id);
    const selectedInCycle = cycleIds.filter((id) => selectedRowIds.includes(id));
    return {
      allSelected: cycleReports.length > 0 && selectedInCycle.length === cycleReports.length,
      indeterminate: selectedInCycle.length > 0 && selectedInCycle.length < cycleReports.length,
    };
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
    showInfo(
      t("evaluationListTab.alerts.noticeTitle"),
      t("evaluationListTab.alerts.bulkApproveMaintenance"),
    );
  };

  const handleQuickApproveSingle = async (report: any) => {
    try {
      await api.put(`/okrs/${report.id}/manager-review`, {
        managerReportData: report.selfReportData, // Đồng ý toàn bộ điểm của nhân sự
      });
      fetchEvaluations();
    } catch (e) {
      console.error(e);
      showError(
        t("evaluationListTab.alerts.errorTitle"),
        t("evaluationListTab.alerts.errorUpdateFailed"),
      );
    }
  };

  const handleSaveEvaluation = async (updatedReport: any) => {
    setDialogOpen(false);
    try {
      await api.put(`/okrs/${updatedReport.id}/manager-review`, {
        managerReportData: updatedReport.managerReportData,
      });
      fetchEvaluations();
    } catch (e) {
      console.error(e);
      showError(
        t("evaluationListTab.alerts.errorTitle"),
        t("evaluationListTab.alerts.errorUpdateFailed"),
      );
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" color="#1e3a8a" sx={{ mb: 3 }}>
        {t("evaluationListTab.headerTitle")}
      </Typography>

      {/* Control Panel: Search & Filters */}
      <Paper
        elevation={0}
        sx={{ border: "1px solid #e2e8f0", borderRadius: 2, mb: 3, overflow: "hidden" }}
      >
        {/* Row 1: Tabs Header */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, bgcolor: "#f8fafc" }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => {
              setTabValue(v);
              setSelectedRowIds([]);
              setSelectedCycle("ALL");
            }}
          >
            <Tab label={t("evaluationListTab.tabs.inProgress", { count: acceptedReports.length })} />
            <Tab label={t("evaluationListTab.tabs.pendingReview", { count: submittedReports.length })} />
            <Tab label={t("evaluationListTab.tabs.completedHistory", { count: completedReports.length })} />
          </Tabs>
        </Box>

        {/* Row 2: Filters Toolbar */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder={t("evaluationListTab.filters.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("evaluationListTab.filters.departmentLabel")}</InputLabel>
            <Select
              value={selectedDepartment}
              label={t("evaluationListTab.filters.departmentLabel")}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departmentOptions.map((dept) => (
                <MenuItem key={dept as string} value={dept as string}>
                  {dept === "ALL" ? t("evaluationListTab.filters.allDepartments") : (dept as string)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("evaluationListTab.filters.cycleLabel")}</InputLabel>
            <Select
              value={selectedCycle}
              label={t("evaluationListTab.filters.cycleLabel")}
              onChange={(e) => setSelectedCycle(e.target.value)}
            >
              <MenuItem value="ALL">{t("evaluationListTab.filters.allCycles")}</MenuItem>
              {allCycles.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Bulk Action Button */}
          {tabValue === 1 && selectedRowIds.length > 0 && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleTickAllSelected}
              sx={{ ml: "auto" }}
            >
              {t("evaluationListTab.buttons.tickAll", { count: selectedRowIds.length })}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Data Table */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {tabValue === 0
            ? t("evaluationListTab.alerts.noReportsInProgress")
            : tabValue === 1
              ? t("evaluationListTab.alerts.noReportsPendingReview")
              : t("evaluationListTab.alerts.noEvaluationHistory")}
        </Alert>
      ) : Object.keys(groupedByCycle).length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {t("evaluationListTab.alerts.noFilteredReportsFound")}
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Object.entries(groupedByCycle).map(([cycleName, cycleReports]) => {
            const { allSelected, indeterminate } = getCycleSelectionStatus(cycleReports);
            return (
              <Accordion
                key={cycleName}
                expanded={expandedStates[cycleName] !== false}
                onChange={(_, expanded) => {
                  const nextStates = { ...expandedStates, [cycleName]: expanded };
                  setExpandedStates(nextStates);
                  localStorage.setItem("okr_report_accordion_states", JSON.stringify(nextStates));
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
                      {cycleName === "Kỳ mặc định" ? t("evaluationListTab.cycleFallback") : cycleName}
                    </Typography>
                    <Chip
                      label={
                        tabValue === 0
                          ? t("evaluationListTab.accordion.inProgressCount", { count: cycleReports.length })
                          : tabValue === 1
                            ? t("evaluationListTab.accordion.pendingReviewCount", { count: cycleReports.length })
                            : t("evaluationListTab.accordion.completedCount", { count: cycleReports.length })
                      }
                      size="small"
                      color={tabValue === 1 ? "warning" : tabValue === 2 ? "success" : "info"}
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "#f8fafc" }}>
                        <TableRow>
                          {tabValue === 1 && (
                            <TableCell padding="checkbox">
                              <Checkbox
                                color="primary"
                                indeterminate={indeterminate}
                                checked={allSelected}
                                onChange={(e) =>
                                  handleSelectCycleClick(cycleReports, e.target.checked)
                                }
                              />
                            </TableCell>
                          )}
                          <TableCell sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                            {t("evaluationListTab.table.headers.employee")}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                            {t("evaluationListTab.table.headers.department")}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "600",
                              color: "#475569",
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {t("evaluationListTab.table.headers.assignedDate")}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "600",
                              color: "#475569",
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {t("evaluationListTab.table.headers.okrProgress")}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "600",
                              color: "#475569",
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {t("evaluationListTab.table.headers.selfScore")}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "600",
                              color: "#475569",
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {t("evaluationListTab.table.headers.managerScore")}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "600",
                              color: "#475569",
                              fontSize: "0.85rem",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.01em",
                            }}
                          >
                            {t("evaluationListTab.table.headers.status")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cycleReports.map((report) => {
                          const isItemSelected = isSelected(report.id);
                          return (
                            <TableRow
                              key={report.id}
                              hover
                              selected={isItemSelected}
                              onClick={() => {
                                setSelectedReport(report);
                                setDialogOpen(true);
                              }}
                              sx={{ cursor: "pointer", transition: "all 0.2s ease" }}
                            >
                              {tabValue === 1 && (
                                <TableCell
                                  padding="checkbox"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Checkbox
                                    color="primary"
                                    checked={isItemSelected}
                                    onChange={() => handleRowClick(report.id)}
                                  />
                                </TableCell>
                              )}
                              <TableCell sx={{ maxWidth: 220 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    cursor: "pointer",
                                    "&:hover .user-name": { textDecoration: "underline" }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (report.user?.id) navigate(`/departments/users/${report.user.id}`, { state: { parentName: "OKR Bộ Môn", parentUrl: "/departments/okr" } });
                                  }}
                                >
                                  <Avatar
                                    src={report.user?.avatarUrl}
                                    sx={{ bgcolor: "#1C4D8D", width: 36, height: 36, flexShrink: 0 }}
                                  >
                                    {report.user?.name?.[0] || "?"}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Tooltip title={report.user?.name || "No name"} enterDelay={500} arrow>
                                      <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        color="primary.main"
                                        className="user-name"
                                        noWrap
                                        sx={{ maxWidth: 160 }}
                                      >
                                        {report.user?.name || "No name"}
                                      </Typography>
                                    </Tooltip>
                                    <Tooltip title={report.user?.email || ""} enterDelay={500} arrow>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                        sx={{ display: "block", maxWidth: 160 }}
                                      >
                                        {report.user?.email}
                                      </Typography>
                                    </Tooltip>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 140 }}>
                                <Tooltip title={report.user?.department?.name || "N/A"} enterDelay={500} arrow>
                                  <Chip
                                    label={report.user?.department?.name || "N/A"}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      maxWidth: "100%",
                                      "& .MuiChip-label": {
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                      }
                                    }}
                                  />
                                </Tooltip>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color="text.secondary">
                                  {report.createdAt
                                    ? new Date(report.createdAt).toLocaleDateString("vi-VN")
                                    : "—"}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    bgcolor: "#ecfdf5",
                                    color: "#059669",
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    fontWeight: "bold",
                                  }}
                                >
                                  {(() => {
                                    const rowMaxScore = (report.keyResults || []).reduce(
                                      (sum: number, obj: any) => sum + (Number(obj.maxScore) || 0),
                                      0
                                    );
                                    const rowScore =
                                      report.managerScore != null
                                        ? report.managerScore
                                        : (report.totalScore || 0);
                                    const rowProgressPercent =
                                      rowMaxScore > 0
                                        ? Math.min((rowScore / rowMaxScore) * 100, 100)
                                        : 0;
                                    return `${rowProgressPercent.toFixed(0)}%`;
                                  })()}
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
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    fontStyle="italic"
                                  >
                                    {t("evaluationListTab.table.notGradedYet")}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">
                                {report.status === "COMPLETED" ? (
                                  <Chip
                                    label={t("evaluationListTab.table.status.completed")}
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                ) : report.status === "ACCEPTED" ? (
                                  <Chip
                                    label={t("evaluationListTab.table.status.inProgress")}
                                    color="info"
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                ) : (
                                  <Chip
                                    label={t("evaluationListTab.table.status.pending")}
                                    color="warning"
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
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
