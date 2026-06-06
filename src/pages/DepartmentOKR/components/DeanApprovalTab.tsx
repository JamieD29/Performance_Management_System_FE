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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Alert,
  Avatar,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { Check, Close, ExpandMore, Search } from "@mui/icons-material";
import { api } from "../../../services/api";
import { confirmAction, showSuccess, showError, showInfo } from "../../../utils/swal";
import OkrManagerTree from "./OkrManagerTree";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function DeanApprovalTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pendingOkrs, setPendingOkrs] = useState<any[]>([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedOkr, setSelectedOkr] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialog, setRejectDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [selectedCycle, setSelectedCycle] = useState("ALL");

  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("okr_proposal_accordion_states");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetchPending();
  }, []);

  const filteredOkrs = useMemo(() => {
    return pendingOkrs.filter((okr) => {
      const matchesSearch =
        (okr.user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (okr.user?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesDept =
        selectedDepartment === "ALL" ||
        okr.user?.department?.name === selectedDepartment;
      const matchesCycle =
        selectedCycle === "ALL" ||
        okr.cycle?.name === selectedCycle;
      return matchesSearch && matchesDept && matchesCycle;
    });
  }, [pendingOkrs, searchQuery, selectedDepartment, selectedCycle]);

  const departmentOptions = useMemo(() => {
    const depts = new Set(
      pendingOkrs.map((r) => r.user?.department?.name).filter(Boolean),
    );
    return ["ALL", ...Array.from(depts)];
  }, [pendingOkrs]);

  const cycleOptions = useMemo(() => {
    const cycles = new Set(
      pendingOkrs.map((r) => r.cycle?.name).filter(Boolean),
    );
    return ["ALL", ...Array.from(cycles)];
  }, [pendingOkrs]);

  const groupedByCycle = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredOkrs.forEach((okr) => {
      const cycleName = okr.cycle?.name || "Kỳ mặc định";
      if (!groups[cycleName]) groups[cycleName] = [];
      groups[cycleName].push(okr);
    });
    return groups;
  }, [filteredOkrs]);

  const fetchPending = async () => {
    try {
      const res = await api.get("/okrs/pending-approval");
      setPendingOkrs(res.data || []);
    } catch (error) {
      console.error("Error fetching pending approvals", error);
    }
  };

  const handleApprove = async (okrId: string) => {
    const ok = await confirmAction({
      title: t("deanApprovalTab.alerts.approveConfirmTitle"),
      text: t("deanApprovalTab.alerts.approveConfirmText"),
      icon: "question",
      confirmText: t("deanApprovalTab.alerts.approveBtn"),
      confirmColor: "#16a34a",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okrId}/dean-approve`);
      await showSuccess(
        t("deanApprovalTab.alerts.successTitle"),
        t("deanApprovalTab.alerts.approveSuccessText")
      );
      await showInfo(
        t("deanApprovalTab.alerts.trackProgressTitle"),
        t("deanApprovalTab.alerts.trackProgressText")
      );
      fetchPending();
    } catch (error: any) {
      console.error("Error approving", error);
      const apiMsg = error.response?.data?.message;
      showError(
        t("deanApprovalTab.alerts.errorTitle"),
        apiMsg || t("deanApprovalTab.alerts.approveErrorText")
      );
    }
  };

  const openReject = (okr: any) => {
    setSelectedOkr(okr);
    setRejectReason("");
    setRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedOkr) return;
    try {
      await api.put(`/okrs/${selectedOkr.id}/dean-reject`, {
        reason: rejectReason,
      });
      showSuccess(
        t("deanApprovalTab.alerts.rejectSuccessTitle"),
        t("deanApprovalTab.alerts.rejectSuccessText")
      );
      setRejectDialog(false);
      fetchPending();
    } catch (error: any) {
      console.error("Error rejecting", error);
      const apiMsg = error.response?.data?.message;
      showError(
        t("deanApprovalTab.alerts.errorTitle"),
        apiMsg || t("deanApprovalTab.alerts.rejectErrorText")
      );
    }
  };

  const viewDetails = (okr: any) => {
    setSelectedOkr(okr);
    setViewDialog(true);
  };

  // Remove old renderComments function

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5" fontWeight="bold" color="#1e3a8a">
          {t("deanApprovalTab.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("deanApprovalTab.subtitle")}
        </Typography>
      </Box>

      {/* Control Panel: Search & Filters */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder={t("deanApprovalTab.searchPlaceholder")}
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
            <InputLabel>{t("deanApprovalTab.departmentFilter")}</InputLabel>
            <Select
              value={selectedDepartment}
              label={t("deanApprovalTab.departmentFilter")}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departmentOptions.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept === "ALL" ? t("deanApprovalTab.allDepartments") : dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t("deanApprovalTab.cycleFilter")}</InputLabel>
            <Select
              value={selectedCycle}
              label={t("deanApprovalTab.cycleFilter")}
              onChange={(e) => setSelectedCycle(e.target.value)}
            >
              {cycleOptions.map((cycle) => (
                <MenuItem key={cycle} value={cycle}>
                  {cycle === "ALL" ? t("deanApprovalTab.allCycles") : cycle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {pendingOkrs.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {t("deanApprovalTab.noProposals")}
        </Alert>
      ) : Object.keys(groupedByCycle).length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {t("deanApprovalTab.noProposalsFiltered")}
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Object.entries(groupedByCycle).map(([cycleName, okrs]) => (
            <Accordion
              key={cycleName}
              expanded={expandedStates[cycleName] !== false}
              onChange={(_, expanded) => {
                const nextStates = { ...expandedStates, [cycleName]: expanded };
                setExpandedStates(nextStates);
                localStorage.setItem("okr_proposal_accordion_states", JSON.stringify(nextStates));
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
                    label={t("deanApprovalTab.countProposals", { count: okrs.length })}
                    size="small"
                    color="warning"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                          {t("deanApprovalTab.tableHeaders.staff")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                          {t("deanApprovalTab.tableHeaders.department")}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                          {t("deanApprovalTab.tableHeaders.objective")}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}
                        >
                          {t("deanApprovalTab.tableHeaders.assignedDate")}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}
                        >
                          {t("deanApprovalTab.tableHeaders.negotiationDeadline")}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}
                        >
                          {t("deanApprovalTab.tableHeaders.status")}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}
                        >
                          {t("deanApprovalTab.tableHeaders.proposalContent")}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "600", color: "#475569", fontSize: "0.85rem", whiteSpace: "nowrap", letterSpacing: "0.01em" }}
                        >
                          {t("deanApprovalTab.tableHeaders.actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {okrs.map((okr) => (
                        <TableRow
                          key={okr.id}
                          hover
                          onClick={() => viewDetails(okr)}
                          sx={{ cursor: "pointer", transition: "all 0.2s ease" }}
                        >
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Box
                              sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover .user-name": { textDecoration: "underline" } }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (okr.user?.id) navigate(`/departments/users/${okr.user.id}`, { state: { parentName: "OKR Bộ Môn", parentUrl: "/departments/okr" } });
                              }}
                            >
                              <Avatar
                                src={okr.user?.avatarUrl}
                                sx={{ width: 28, height: 28, flexShrink: 0 }}
                              >
                                {(okr.user?.name || okr.user?.email)?.[0]?.toUpperCase()}
                              </Avatar>
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Tooltip title={okr.user?.name || "(Chưa đặt tên)"} enterDelay={500} arrow>
                                  <Typography variant="body2" fontWeight={500} className="user-name" color="primary.main" noWrap sx={{ maxWidth: 160 }}>
                                    {okr.user?.name || "(Chưa đặt tên)"}
                                  </Typography>
                                </Tooltip>
                                <Tooltip title={okr.user?.email || ""} enterDelay={500} arrow>
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 160 }}>
                                    {okr.user?.email}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 140 }}>
                            <Tooltip title={okr.user?.department?.name || "—"} enterDelay={500} arrow>
                              <Chip
                                label={okr.user?.department?.name || "—"}
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
                          <TableCell sx={{ maxWidth: 220 }}>
                            <Tooltip title={okr.objective || ""} enterDelay={500} arrow>
                              <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 200 }}>
                                {okr.objective}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                            <Typography variant="body2" color="text.secondary">
                              {okr.createdAt
                                ? new Date(okr.createdAt).toLocaleDateString("vi-VN")
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color={okr.deadline && new Date(okr.deadline) < new Date() ? "error.main" : "text.secondary"}
                            >
                              {okr.deadline
                                ? new Date(okr.deadline).toLocaleDateString("vi-VN")
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                            <Chip
                              label={okr.status === "NEGOTIATING" ? t("deanApprovalTab.status.pendingApproval") : t("deanApprovalTab.status.pendingResponse")}
                              size="small"
                              color={okr.status === "NEGOTIATING" ? "warning" : "info"}
                              variant={okr.status === "NEGOTIATING" ? "filled" : "outlined"}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ maxWidth: 200 }}>
                            {(() => {
                              const proposalText = (() => {
                                if (!okr.proposedChanges || Object.keys(okr.proposedChanges).length === 0) {
                                  return "Xem chi tiết...";
                                }
                                let exchangeCount = 0;
                                let commentCount = 0;
                                for (const messages of Object.values(okr.proposedChanges)) {
                                  const msgs = messages as any[];
                                  if (msgs.length === 0) continue;
                                  const senders = new Set(msgs.map((m: any) => m.sender));
                                  const lastSender = msgs[msgs.length - 1]?.sender;
                                  if (senders.has("USER") && senders.has("MANAGER")) {
                                    if (lastSender === "USER") exchangeCount++;
                                  } else {
                                    if (lastSender === "USER") commentCount++;
                                  }
                                }
                                if (exchangeCount > 0) return `${exchangeCount} mục chờ xử lý`;
                                if (commentCount > 0) return `Có nhận xét trên ${commentCount} mục`;
                                return "Đã phản hồi tất cả";
                              })();

                              return (
                                <Tooltip title={proposalText} enterDelay={500} arrow>
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                      maxWidth: 180,
                                      mx: "auto"
                                    }}
                                  >
                                    {proposalText}
                                  </Typography>
                                </Tooltip>
                              );
                            })()}
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <Tooltip title={t("deanApprovalTab.actions.approve")} arrow>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(okr.id);
                                }}
                                sx={{ mr: 0.5, bgcolor: "rgba(46, 125, 50, 0.08)", "&:hover": { bgcolor: "rgba(46, 125, 50, 0.15)" } }}
                              >
                                <Check fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t("deanApprovalTab.actions.reject")} arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReject(okr);
                                }}
                                sx={{ bgcolor: "rgba(211, 47, 47, 0.04)", "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" } }}
                              >
                                <Close fontSize="small" />
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

      {/* View Details Dialog - shows per-objective comments */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: "bold" }}>
          {t("deanApprovalTab.dialog.detailsTitle")}
          <IconButton
            aria-label="close"
            onClick={() => setViewDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("deanApprovalTab.dialog.staff")}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedOkr?.user?.name || selectedOkr?.user?.email || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("deanApprovalTab.dialog.assignedDate")}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedOkr?.createdAt
                  ? new Date(selectedOkr.createdAt).toLocaleDateString("vi-VN")
                  : "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("deanApprovalTab.dialog.negotiationDeadline")}
              </Typography>
              <Typography
                variant="body1"
                fontWeight={600}
                color={selectedOkr?.deadline && new Date(selectedOkr.deadline) < new Date() ? "error.main" : "text.primary"}
              >
                {selectedOkr?.deadline
                  ? new Date(selectedOkr.deadline).toLocaleDateString("vi-VN")
                  : "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {t("deanApprovalTab.dialog.objective")}
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedOkr?.objective}
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {t("deanApprovalTab.dialog.structureDetails")}
          </Typography>
          {selectedOkr && (
            <OkrManagerTree okr={selectedOkr} onRefresh={() => {
              fetchPending();
              // Auto refresh current selected okr might be tricky,
              // For now, let's close the dialog to force them to reopen or handle it better
              // Actually we can just let it be, but they have to close/reopen to see changes if we don't re-fetch selectedOkr
            }} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Close />}
            onClick={() => {
              setViewDialog(false);
              openReject(selectedOkr);
            }}
          >
            {t("deanApprovalTab.actions.reject")}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Check />}
            onClick={() => {
              setViewDialog(false);
              handleApprove(selectedOkr?.id);
            }}
          >
            {t("deanApprovalTab.actions.approve")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog}
        onClose={() => setRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
          {t("deanApprovalTab.dialog.rejectTitle")}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t("deanApprovalTab.dialog.rejectReason")}
            placeholder={t("deanApprovalTab.dialog.rejectReasonPlaceholder")}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialog(false)} color="inherit">
            {t("deanApprovalTab.dialog.cancel")}
          </Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            {t("deanApprovalTab.dialog.confirmReject")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
