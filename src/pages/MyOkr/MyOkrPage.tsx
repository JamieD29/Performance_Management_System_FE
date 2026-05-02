import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
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
  Collapse,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  Check,
  Edit,
  Flag,
  ExpandMore,
  ExpandLess,
  Comment,
  Send,
  Assignment,
  Save,
} from "@mui/icons-material";
import { api } from "../../services/api";
import { confirmAction, showSuccess, showError } from "../../utils/swal";

const statusConfig: Record<
  string,
  { label: string; color: "warning" | "info" | "success" | "error" | "default" }
> = {
  PENDING: { label: "Chờ phản hồi", color: "warning" },
  NEGOTIATING: { label: "Đang đàm phán", color: "info" },
  ACCEPTED: { label: "Đã chấp nhận — Sẵn sàng tự khai", color: "success" },
  SUBMITTED: { label: "Đã nộp bài — Chờ duyệt", color: "info" },
  COMPLETED: { label: "Hoàn tất", color: "default" },
  REJECTED: { label: "Bị từ chối", color: "error" },
};

// ============================
// Sub-component: Chi tiết 1 OKR
// ============================
function OkrCard({ okr, onRefresh }: { okr: any; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Self-report state: { "A-1": { quantity: 3, evidence: "link..." } }
  const [reportData, setReportData] = useState<
    Record<string, { quantity: number; evidence: string }>
  >({});
  const [saving, setSaving] = useState(false);

  const structure = Array.isArray(okr.keyResults) ? okr.keyResults : [];
  const isAccepted = okr.status === "ACCEPTED";
  const isSubmitted = okr.status === "SUBMITTED";
  const isCompleted = okr.status === "COMPLETED";
  const isPending = okr.status === "PENDING";
  
  const isCycleStarted = okr.cycle?.startDate 
    ? new Date(new Date().setHours(0, 0, 0, 0)) >= new Date(new Date(okr.cycle.startDate).setHours(0, 0, 0, 0))
    : true; // Nếu không có startDate (lỗi data), mặc định cho phép

  const canReport = isAccepted && isCycleStarted; // Chỉ tự khai khi đã ACCEPTED và kỳ đã bắt đầu

  // Load existing self-report data if any
  useEffect(() => {
    if (okr.selfReportData && typeof okr.selfReportData === "object") {
      setReportData(okr.selfReportData);
    }
  }, [okr.selfReportData]);

  // Calculate total self-report score
  const calcTotalScore = () => {
    let total = 0;
    Object.values(reportData).forEach((item) => {
      total += Number(item.quantity) || 0;
    });
    return total;
  };

  // Calculate max possible score
  const calcMaxScore = () => {
    let max = 0;
    structure.forEach((obj: any) => {
      max += Number(obj.maxScore) || 0;
    });
    return max;
  };

  // Calculate total score for a single objective, capped at its maxScore
  const calcObjectiveScore = (obj: any) => {
    let total = 0;
    const selfReport = okr.selfReportData || {};
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      total += Number(selfReport[krKey]?.score) || 0;
      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        total += Number(selfReport[subKey]?.score) || 0;
      });
    });
    const max = Number(obj.maxScore) || 0;
    return max > 0 ? Math.min(total, max) : total;
  };

  const handleAccept = async () => {
    const ok = await confirmAction({
      title: "Chấp nhận OKR?",
      text: "Sau khi chấp nhận, bạn sẽ bắt đầu tự khai điểm.",
      icon: "question",
      confirmText: "Đồng ý chấp nhận",
      confirmColor: "#16a34a",
    });
    if (!ok) return;
    try {
      await api.put(`/okrs/${okr.id}/accept`);
      onRefresh();
    } catch (error) {
      console.error(error);
      showError("Lỗi", "Có lỗi xảy ra khi chấp nhận OKR.");
    }
  };

  const handleSendChat = async (itemId: string) => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    try {
      await api.post(`/okrs/${okr.id}/chat`, {
        itemId,
        message: chatMessage,
        sender: "USER",
      });
      setChatMessage("");
      onRefresh();
    } catch (error) {
      showError("Lỗi", "Không thể gửi nhận xét. Vui lòng thử lại.");
    } finally {
      setChatLoading(false);
    }
  };

  const renderChatRow = (itemId: string, colSpan: number) => {
    if (activeChatId !== itemId) return null;
    const history = okr.proposedChanges?.[itemId] || [];
    return (
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ p: 0, bgcolor: "#f1f5f9" }}>
          <Box sx={{ p: 2, borderLeft: "3px solid #3b82f6", ml: 2, bgcolor: "#fff", mb: 2, mt: 1, borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "#1e3a8a" }}>Đàm phán mục: {itemId}</Typography>
            {history.length > 0 ? (
              <Box sx={{ mb: 2, maxHeight: 150, overflowY: "auto" }}>
                {history.map((msg: any, idx: number) => (
                  <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: msg.sender === 'USER' ? '#eff6ff' : '#fff7ed', borderRadius: 1, maxWidth: "80%" }}>
                    <Typography variant="caption" fontWeight="bold" color={msg.sender === 'USER' ? 'primary' : 'warning.main'}>
                      {msg.sender === 'USER' ? 'Bạn' : 'Trưởng khoa'} - {new Date(msg.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="body2">{msg.message}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Chưa có trao đổi nào. Bạn có thể đề xuất chỉnh sửa chỉ tiêu/điểm tại đây.</Typography>
            )}
            
            {(isPending || okr.status === 'NEGOTIATING') && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField 
                  size="small" 
                  fullWidth 
                  placeholder="Nhập đề xuất điều chỉnh..." 
                  value={chatMessage} 
                  onChange={(e) => setChatMessage(e.target.value)} 
                  onKeyDown={(e) => { if(e.key === 'Enter') handleSendChat(itemId); }}
                />
                <Button variant="contained" disabled={chatLoading || !chatMessage.trim()} onClick={() => handleSendChat(itemId)} startIcon={<Send />}>Gửi</Button>
              </Box>
            )}
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  const updateReport = (
    krId: string,
    field: "quantity" | "evidence",
    value: any,
  ) => {
    setReportData((prev) => ({
      ...prev,
      [krId]: {
        ...prev[krId],
        [field]: field === "quantity" ? Math.max(0, Number(value) || 0) : value,
      },
    }));
  };

  const handleSubmitReport = async () => {
    const ok = await confirmAction({
      title: "Nộp bài tự khai?",
      text: "Sau khi nộp, bài sẽ được gửi cho Trưởng khoa duyệt. Bạn chắc chắn chứ?",
      icon: "question",
      confirmText: "Nộp bài",
      confirmColor: "#1976d2",
    });
    if (!ok) return;
    setSaving(true);

    // Build report with calculated scores
    const enrichedReport: Record<string, any> = {};
    structure.forEach((obj: any) => {
      obj.items?.forEach((kr: any) => {
        const key = `${obj.id}-${kr.id}`;
        const qty = reportData[key]?.quantity || 0;
        const unitScore = Number(kr.unitScore) || 0;
        const score = unitScore > 0 ? qty * unitScore : qty;
        enrichedReport[key] = {
          quantity: qty,
          evidence: reportData[key]?.evidence || "",
          score: Math.min(score, Number(kr.maxScore) || Infinity),
          krTitle: kr.title,
          objTitle: obj.title,
        };
        // Sub-KRs
        kr.items?.forEach((sub: any) => {
          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
          const subQty = reportData[subKey]?.quantity || 0;
          const subUnitScore = Number(sub.unitScore) || 0;
          const subScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
          enrichedReport[subKey] = {
            quantity: subQty,
            evidence: reportData[subKey]?.evidence || "",
            score: Math.min(subScore, Number(sub.maxScore) || Infinity),
            krTitle: sub.title,
            objTitle: obj.title,
          };
        });
      });
    });

    try {
      await api.put(`/okrs/${okr.id}/self-report`, {
        selfReportData: enrichedReport,
      });
      showSuccess("Thành công!", "Đã nộp bài tự khai thành công.");
      onRefresh();
    } catch (error) {
      console.error(error);
      showError("Lỗi", "Có lỗi xảy ra khi nộp bài.");
    } finally {
      setSaving(false);
    }
  };

  const totalSelfScore = calcTotalScore();
  const maxScore = calcMaxScore();
  const progressPercent =
    maxScore > 0 ? Math.min((totalSelfScore / maxScore) * 100, 100) : 0;

  return (
    <Paper
      sx={{
        mb: 3,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          bgcolor: "#f8fafc",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
            {okr.objective}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            <Chip
              label={isAccepted && !isCycleStarted ? "Chờ kỳ bắt đầu" : (statusConfig[okr.status]?.label || okr.status)}
              color={isAccepted && !isCycleStarted ? "warning" : (statusConfig[okr.status]?.color || "default")}
              size="small"
            />
            {okr.deadline && (
              <Chip
                label={`Deadline: ${new Date(okr.deadline).toLocaleDateString("vi-VN")}`}
                size="small"
                variant="outlined"
              />
            )}
            {(isAccepted || isSubmitted || isCompleted) && (
              <Chip
                label={`Điểm: ${okr.totalScore || totalSelfScore}/${maxScore}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          >
            {expanded ? "Thu gọn" : "Xem chi tiết"}
          </Button>
        </Box>
      </Box>

      {/* Progress bar for ACCEPTED */}
      {(canReport || isSubmitted || isCompleted) && (
        <Box sx={{ px: 2, pb: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {progressPercent.toFixed(0)}% hoàn thành
          </Typography>
        </Box>
      )}

      {/* Expanded content */}
      <Collapse in={expanded}>
        {isAccepted && !isCycleStarted && (
          <Box sx={{ p: 2, bgcolor: "#fffbeb" }}>
            <Alert severity="warning">
              Kỳ đánh giá chưa bắt đầu (Dự kiến bắt đầu từ <strong>{new Date(okr.cycle.startDate).toLocaleDateString('vi-VN')}</strong>). Bạn chưa thể tự khai điểm lúc này.
            </Alert>
          </Box>
        )}
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#1e3a8a" }}>
              <TableRow>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "5%" }}
                >
                  STT
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "30%" }}
                >
                  Nội dung
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "10%" }}
                >
                  Điểm tối đa
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                >
                  Điểm/đơn vị
                </TableCell>
                {canReport && (
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                  >
                    Số lượng tự khai
                  </TableCell>
                )}
                {canReport && (
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "10%" }}
                  >
                    Quy đổi
                  </TableCell>
                )}
                {canReport && (
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "21%" }}
                  >
                    Minh chứng
                  </TableCell>
                )}
                {(isSubmitted || isCompleted) && (
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "10%" }}
                  >
                    Số lượng tự khai
                  </TableCell>
                )}
                {(isSubmitted || isCompleted) && (
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "10%" }}
                  >
                    Điểm khai
                  </TableCell>
                )}
                {(isSubmitted || isCompleted) && (
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "10%" }}
                  >
                    Tổng điểm nhiệm vụ
                  </TableCell>
                )}
                {(isPending || okr.status === 'NEGOTIATING') && (
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold", width: "10%", textAlign: "center" }}
                  >
                    Đàm phán
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {structure.map((obj: any, oIndex: number) => (
                <React.Fragment key={obj.id || oIndex}>
                  {/* Objective row */}
                  <TableRow sx={{ bgcolor: "#dbeafe" }}>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      {obj.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {obj.title}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {obj.maxScore}
                    </TableCell>
                    <TableCell></TableCell>
                    {canReport && <TableCell></TableCell>}
                    {canReport && <TableCell></TableCell>}
                    {canReport && <TableCell></TableCell>}
                    {(isSubmitted || isCompleted) && <TableCell></TableCell>}
                    {(isSubmitted || isCompleted) && <TableCell></TableCell>}
                    {(isSubmitted || isCompleted) && (
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "#15803d",
                          fontSize: "1rem",
                        }}
                      >
                        {calcObjectiveScore(obj)} / {obj.maxScore || 0}
                      </TableCell>
                    )}
                    {(isPending || okr.status === 'NEGOTIATING') && (
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => setActiveChatId(activeChatId === obj.id ? null : obj.id)}>
                          <Comment fontSize="small" color={okr.proposedChanges?.[obj.id]?.length > 0 ? "primary" : "inherit"} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                  {renderChatRow(obj.id, 10)}

                  {/* KR rows */}
                  {obj.items?.map((kr: any, kIndex: number) => {
                    const krKey = `${obj.id}-${kr.id}`;
                    const krQty = reportData[krKey]?.quantity || 0;
                    const krUnitScore = Number(kr.unitScore) || 0;
                    const krCalcScore =
                      krUnitScore > 0 ? krQty * krUnitScore : krQty;
                    const existingReport = okr.selfReportData?.[krKey];

                    return (
                      <React.Fragment key={`${oIndex}-${kIndex}`}>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell sx={{ pl: 3 }}>{kr.id}</TableCell>
                          <TableCell>{kr.title}</TableCell>
                          <TableCell>{kr.maxScore}</TableCell>
                          <TableCell>
                            {kr.unitScore ? (
                              <Chip
                                label={`+${kr.unitScore}/${kr.unit || "đv"}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          {canReport && (
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                value={krQty || ""}
                                onChange={(e) =>
                                  updateReport(
                                    krKey,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                inputProps={{
                                  min: 0,
                                  style: { textAlign: "center" },
                                }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                          )}
                          {canReport && (
                            <TableCell
                              sx={{ fontWeight: "bold", color: "#2563eb" }}
                            >
                              {krCalcScore.toFixed(1)}
                            </TableCell>
                          )}
                          {canReport && (
                            <TableCell>
                              <TextField
                                size="small"
                                fullWidth
                                placeholder="Link minh chứng..."
                                value={reportData[krKey]?.evidence || ""}
                                onChange={(e) =>
                                  updateReport(
                                    krKey,
                                    "evidence",
                                    e.target.value,
                                  )
                                }
                              />
                            </TableCell>
                          )}
                          {(isSubmitted || isCompleted) && (
                            <TableCell>
                              {existingReport?.quantity || 0}
                            </TableCell>
                          )}
                          {(isSubmitted || isCompleted) && (
                            <TableCell
                              sx={{ fontWeight: "bold", color: "#2563eb" }}
                            >
                              {existingReport?.score || 0}
                            </TableCell>
                          )}
                          {(isSubmitted || isCompleted) && <TableCell></TableCell>}
                          {(isPending || okr.status === 'NEGOTIATING') && (
                            <TableCell align="center">
                              <IconButton size="small" onClick={() => setActiveChatId(activeChatId === kr.id ? null : kr.id)}>
                                <Comment fontSize="small" color={okr.proposedChanges?.[kr.id]?.length > 0 ? "primary" : "inherit"} />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                        {renderChatRow(kr.id, 10)}

                        {/* Sub-KR rows */}
                        {kr.items?.map((sub: any, sIndex: number) => {
                          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
                          const subQty = reportData[subKey]?.quantity || 0;
                          const subUnitScore = Number(sub.unitScore) || 0;
                          const subCalcScore =
                            subUnitScore > 0 ? subQty * subUnitScore : subQty;
                          const existingSub = okr.selfReportData?.[subKey];

                          return (
                            <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                              <TableRow>
                              <TableCell sx={{ pl: 6, fontSize: "0.85rem" }}>
                                {sub.id}
                              </TableCell>
                              <TableCell sx={{ fontSize: "0.9rem" }}>
                                {sub.title}
                              </TableCell>
                              <TableCell>{sub.maxScore}</TableCell>
                              <TableCell>
                                {sub.unitScore ? (
                                  <Chip
                                    label={`+${sub.unitScore}/${sub.unit || "đv"}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              {canReport && (
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={subQty || ""}
                                    onChange={(e) =>
                                      updateReport(
                                        subKey,
                                        "quantity",
                                        e.target.value,
                                      )
                                    }
                                    inputProps={{
                                      min: 0,
                                      style: { textAlign: "center" },
                                    }}
                                    sx={{ width: 80 }}
                                  />
                                </TableCell>
                              )}
                              {canReport && (
                                <TableCell sx={{ color: "#2563eb" }}>
                                  {subCalcScore.toFixed(1)}
                                </TableCell>
                              )}
                              {canReport && (
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Link..."
                                    value={reportData[subKey]?.evidence || ""}
                                    onChange={(e) =>
                                      updateReport(
                                        subKey,
                                        "evidence",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </TableCell>
                              )}
                              {(isSubmitted || isCompleted) && (
                                <TableCell>
                                  {existingSub?.quantity || 0}
                                </TableCell>
                              )}
                              {(isSubmitted || isCompleted) && (
                                <TableCell sx={{ color: "#2563eb" }}>
                                  {existingSub?.score || 0}
                                </TableCell>
                              )}
                              {(isSubmitted || isCompleted) && <TableCell></TableCell>}
                              {(isPending || okr.status === 'NEGOTIATING') && (
                                <TableCell align="center">
                                  <IconButton size="small" onClick={() => setActiveChatId(activeChatId === sub.id ? null : sub.id)}>
                                    <Comment fontSize="small" color={okr.proposedChanges?.[sub.id]?.length > 0 ? "primary" : "inherit"} />
                                  </IconButton>
                                </TableCell>
                              )}
                            </TableRow>
                            {renderChatRow(sub.id, 10)}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Chấp nhận OKR */}
        {(isPending || okr.status === 'NEGOTIATING') && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "flex-end",
              bgcolor: "#f1f5f9",
            }}
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={handleAccept}
            >
              Tôi đồng ý Chấp nhận OKR này
            </Button>
          </Box>
        )}

        {/* Submit button for self-report */}
        {canReport && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              bgcolor: "#f1f5f9",
            }}
          >
            <Typography variant="body1" sx={{ flexGrow: 1, pt: 1 }}>
              <strong>Tổng điểm tự khai: {totalSelfScore.toFixed(1)}</strong> /{" "}
              {maxScore} điểm
            </Typography>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSubmitReport}
              disabled={saving}
            >
              {saving ? "Đang nộp..." : "Nộp bài tự khai"}
            </Button>
          </Box>
        )}

        {isCompleted && (
          <Box sx={{ p: 2, bgcolor: "#f0fdf4" }}>
            <Alert severity="success">
              <strong>Điểm cuối cùng: {okr.totalScore} điểm</strong> — Đã được
              Trưởng khoa duyệt.
            </Alert>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}

// ============================
// Main Page
// ============================
export default function MyOkrPage() {
  const [okrs, setOkrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOkrs();
  }, []);

  const fetchMyOkrs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/okrs/my");
      setOkrs(res.data || []);
    } catch (error) {
      console.error("Error fetching my OKRs", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = okrs.filter((o) => o.status === "PENDING").length;
  const acceptedCount = okrs.filter((o) => o.status === "ACCEPTED").length;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#1e3a8a"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Assignment /> OKR Của Tôi
        </Typography>
        <Typography color="text.secondary">
          Xem chi tiết OKR được giao, tự khai điểm, và theo dõi trạng thái.
        </Typography>
      </Box>

      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {pendingCount} OKR đang chờ phản hồi.</strong> Nhấn vào
          để xem chi tiết và Chấp nhận hoặc Đề xuất điều chỉnh.
        </Alert>
      )}

      {acceptedCount > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {acceptedCount} OKR sẵn sàng tự khai điểm.</strong>{" "}
          Nhấn vào, nhập số lượng và minh chứng, rồi nộp bài.
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
        </Paper>
      ) : okrs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
          Bạn chưa được giao OKR nào. Hãy đợi Trưởng khoa giao OKR cho bạn.
        </Paper>
      ) : (
        okrs.map((okr) => (
          <OkrCard key={okr.id} okr={okr} onRefresh={fetchMyOkrs} />
        ))
      )}
    </Container>
  );
}
