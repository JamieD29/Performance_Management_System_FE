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
} from "@mui/material";
import { Check, Close, Visibility, ExpandMore, Search } from "@mui/icons-material";
import { api } from "../../../services/api";
import { confirmAction, showSuccess, showError, showInfo } from "../../../utils/swal";
import OkrManagerTree from "./OkrManagerTree";

export default function DeanApprovalTab() {
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
      title: "Duyệt đề xuất?",
      text: "Bạn xác nhận duyệt đề xuất điều chỉnh này?",
      icon: "question",
      confirmText: "Duyệt",
      confirmColor: "#16a34a",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okrId}/dean-approve`);
      await showSuccess("Thành công!", "Đã duyệt đề xuất.");
      await showInfo(
        "Theo dõi tiến độ",
        "OKR đã được chốt. Bạn có thể theo dõi tiến độ thực hiện của nhân sự tại tab \"Đánh giá / Báo cáo OKR\"."
      );
      fetchPending();
    } catch (error) {
      console.error("Error approving", error);
      showError("Lỗi", "Có lỗi xảy ra khi duyệt.");
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
      showSuccess("Đã từ chối", "Đề xuất đã bị từ chối.");
      setRejectDialog(false);
      fetchPending();
    } catch (error) {
      console.error("Error rejecting", error);
      showError("Lỗi", "Có lỗi xảy ra khi từ chối.");
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
          Duyệt Đề Xuất Điều Chỉnh OKR
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Xem và phản hồi các đề xuất điều chỉnh mục tiêu, chỉ tiêu từ nhân sự trong khoa.
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
            placeholder="Tìm theo Tên hoặc Email..."
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
            <InputLabel>Bộ môn / Phòng ban</InputLabel>
            <Select
              value={selectedDepartment}
              label="Bộ môn / Phòng ban"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departmentOptions.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept === "ALL" ? "Tất cả Bộ môn" : dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Kỳ đánh giá</InputLabel>
            <Select
              value={selectedCycle}
              label="Kỳ đánh giá"
              onChange={(e) => setSelectedCycle(e.target.value)}
            >
              {cycleOptions.map((cycle) => (
                <MenuItem key={cycle} value={cycle}>
                  {cycle === "ALL" ? "Tất cả các kỳ" : cycle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {pendingOkrs.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Không có đề xuất nào đang chờ duyệt.
        </Alert>
      ) : Object.keys(groupedByCycle).length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Không tìm thấy đề xuất nào khớp với điều kiện lọc.
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
                    label={`${okrs.length} đề xuất`}
                    size="small"
                    color="warning"
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Nhân sự</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Bộ môn</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Mục tiêu</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Ngày giao</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Nội dung đề xuất</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {okrs.map((okr) => (
                        <TableRow key={okr.id} hover>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Avatar
                                src={okr.user?.avatarUrl}
                                sx={{ width: 28, height: 28 }}
                              >
                                {(okr.user?.name || okr.user?.email)?.[0]?.toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {okr.user?.name || "(Chưa đặt tên)"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {okr.user?.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{okr.user?.department?.name || "—"}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {okr.objective}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {okr.createdAt
                                ? new Date(okr.createdAt).toLocaleDateString("vi-VN")
                                : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={okr.status === "NEGOTIATING" ? "Chờ bạn duyệt" : "Chờ nhân sự phản hồi"}
                              size="small"
                              color={okr.status === "NEGOTIATING" ? "warning" : "info"}
                              variant={okr.status === "NEGOTIATING" ? "filled" : "outlined"}
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 250,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {(() => {
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
                                    // Trao đổi 2 chiều: chỉ tính "đang trao đổi" nếu tin cuối là USER (chờ Manager xử lý)
                                    if (lastSender === "USER") {
                                      exchangeCount++;
                                    }
                                    // Nếu tin cuối là MANAGER → đã phản hồi, không tính
                                  } else {
                                    // Chỉ 1 phía nhắn → nhận xét
                                    if (lastSender === "USER") {
                                      commentCount++;
                                    }
                                    // Nếu chỉ MANAGER nhắn → không cần hiện
                                  }
                                }
                                if (exchangeCount > 0) {
                                  return `${exchangeCount} mục chờ xử lý`;
                                }
                                if (commentCount > 0) {
                                  return `Có nhận xét trên ${commentCount} mục`;
                                }
                                return "Đã phản hồi tất cả";
                              })()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => viewDetails(okr)}
                              sx={{ mr: 1 }}
                            >
                              Chi tiết & Sửa
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<Check />}
                              onClick={() => handleApprove(okr.id)}
                              sx={{ mr: 1 }}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Close />}
                              onClick={() => openReject(okr)}
                            >
                              Từ chối
                            </Button>
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
          Chi tiết đề xuất điều chỉnh
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
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Nhân sự:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedOkr?.user?.name || selectedOkr?.user?.email || "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Ngày giao OKR:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedOkr?.createdAt
                  ? new Date(selectedOkr.createdAt).toLocaleDateString("vi-VN")
                  : "—"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Mục tiêu OKR:
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedOkr?.objective}
              </Typography>
            </Box>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Chi tiết cấu trúc và đàm phán:
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
            Từ chối
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
            Duyệt
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
          Từ chối đề xuất
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Lý do từ chối"
            placeholder="VD: Tiêu chuẩn đánh giá không thể thay đổi..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
