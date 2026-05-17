import React, { useState, useEffect } from "react";
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
  Divider,
  Alert,
  IconButton,
  LinearProgress,
  TextField,
  DialogActions,
} from "@mui/material";
import {
  Check,
  ExpandMore,
  ExpandLess,
  Comment,
  Send,
  Save,
  Add,
  Close,
  Delete,
  Edit,
} from "@mui/icons-material";
import { api } from "../../../services/api";
import { confirmAction, showSuccess, showError } from "../../../utils/swal";
import { statusConfig } from "../okr.constants";
import NegotiationChat from "./NegotiationChat";
import AddCriteriaDialog from "./AddCriteriaDialog";

interface OkrCardProps {
  okr: any;
  onRefresh: () => void;
}

const OkrCard: React.FC<OkrCardProps> = ({ okr, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Self-report state
  const [reportData, setReportData] = useState<
    Record<string, { quantity: number; evidence: string }>
  >({});
  const [saving, setSaving] = useState(false);

  // Add KR/SubKR State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addParentType, setAddParentType] = useState<'KR' | 'SUBKR' | null>(null);
  const [addObjectiveId, setAddObjectiveId] = useState<string | null>(null);
  const [addKrId, setAddKrId] = useState<string | null>(null);
  const [newCriteriaTitle, setNewCriteriaTitle] = useState('');
  const [newCriteriaUnitScore, setNewCriteriaUnitScore] = useState('');
  const [newCriteriaUnit, setNewCriteriaUnit] = useState('');

  const [localStructure, setLocalStructure] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [localComments, setLocalComments] = useState<Record<string, any[]>>({});

  // Edit Criteria State
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editItemInfo, setEditItemInfo] = useState<{
    type: 'OBJ' | 'KR' | 'SUBKR';
    objId: string;
    krId?: string;
    subId?: string;
  } | null>(null);
  const [editCriteriaTitle, setEditCriteriaTitle] = useState('');
  const [editCriteriaMaxScore, setEditCriteriaMaxScore] = useState('');
  const [editCriteriaUnitScore, setEditCriteriaUnitScore] = useState('');
  const [editCriteriaUnit, setEditCriteriaUnit] = useState('');

  const isAccepted = okr.status === "ACCEPTED";
  const isSubmitted = okr.status === "SUBMITTED";
  const isCompleted = okr.status === "COMPLETED";
  const isPending = okr.status === "PENDING";
  
  const isCycleStarted = okr.cycle?.startDate 
    ? new Date(new Date().setHours(0, 0, 0, 0)) >= new Date(new Date(okr.cycle.startDate).setHours(0, 0, 0, 0))
    : true;

  const canReport = isAccepted && isCycleStarted;

  useEffect(() => {
    if (okr.selfReportData && typeof okr.selfReportData === "object") {
      setReportData(okr.selfReportData);
    }
    setLocalStructure(Array.isArray(okr.keyResults) ? okr.keyResults : []);
    setHasChanges(false);
  }, [okr.selfReportData, okr.keyResults]);

  const calcTotalScore = () => {
    let total = 0;
    Object.values(reportData).forEach((item) => {
      total += Number(item.quantity) || 0;
    });
    return total;
  };

  const calcMaxScore = () => {
    let max = 0;
    localStructure.forEach((obj: any) => {
      max += Number(obj.maxScore) || 0;
    });
    return max;
  };

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

  const handleOpenAddDialog = (type: 'KR' | 'SUBKR', objId: string, krId?: string) => {
    setAddParentType(type);
    setAddObjectiveId(objId);
    setAddKrId(krId || null);
    setNewCriteriaTitle('');
    setNewCriteriaUnitScore('');
    setNewCriteriaUnit('');
    setOpenAddDialog(true);
  };

  const handleSaveNewCriteria = () => {
    if (!newCriteriaTitle.trim()) {
      showError("Lỗi", "Vui lòng nhập nội dung.");
      return;
    }
    const newStructure = JSON.parse(JSON.stringify(localStructure));
    
    let generatedId = "";

    if (addParentType === 'KR') {
      const obj = newStructure.find((o: any) => o.id === addObjectiveId);
      if (obj) {
        if (!obj.items) obj.items = [];
        const lastItem = obj.items[obj.items.length - 1];
        if (lastItem && lastItem.id) {
          const parts = String(lastItem.id).split('.');
          if (parts.length > 1) {
            const lastNum = parseInt(parts[parts.length - 1], 10);
            parts[parts.length - 1] = isNaN(lastNum) ? "1" : String(lastNum + 1);
            generatedId = parts.join('.');
          } else {
            const lastNum = parseInt(lastItem.id, 10);
            if (!isNaN(lastNum)) {
              generatedId = String(lastNum + 1);
            } else {
              generatedId = `${lastItem.id}.1`;
            }
          }
        } else {
          generatedId = `${obj.id}.1`;
        }

        const newItem = {
          id: generatedId,
          title: newCriteriaTitle,
          unitScore: Number(newCriteriaUnitScore) || 0,
          unit: newCriteriaUnit || 'đv',
          isNew: true,
          items: []
        };
        obj.items.push(newItem);
      }
    } else if (addParentType === 'SUBKR') {
      const obj = newStructure.find((o: any) => o.id === addObjectiveId);
      if (obj) {
        const kr = obj.items?.find((k: any) => k.id === addKrId);
        if (kr) {
          if (!kr.items) kr.items = [];
          const lastItem = kr.items[kr.items.length - 1];
          if (lastItem && lastItem.id) {
            const parts = String(lastItem.id).split('.');
            if (parts.length > 1) {
              const lastNum = parseInt(parts[parts.length - 1], 10);
              parts[parts.length - 1] = isNaN(lastNum) ? "1" : String(lastNum + 1);
              generatedId = parts.join('.');
            } else {
              generatedId = `${lastItem.id}.1`;
            }
          } else {
            generatedId = `${kr.id}.1`;
          }

          const newItem = {
            id: generatedId,
            title: newCriteriaTitle,
            unitScore: Number(newCriteriaUnitScore) || 0,
            unit: newCriteriaUnit || 'đv',
            isNew: true,
            items: []
          };
          kr.items.push(newItem);
        }
      }
    }

    setLocalStructure(newStructure);
    setHasChanges(true);
    setOpenAddDialog(false);
  };

  const handleDeleteItem = (objId: string, krId?: string, subId?: string) => {
    const newStructure = JSON.parse(JSON.stringify(localStructure));
    
    if (subId && krId) {
       const obj = newStructure.find((o:any) => o.id === objId);
       if (obj) {
          const kr = obj.items?.find((k:any) => k.id === krId);
          if (kr && kr.items) {
             kr.items = kr.items.filter((s:any) => s.id !== subId);
          }
       }
    } else if (krId) {
       const obj = newStructure.find((o:any) => o.id === objId);
       if (obj && obj.items) {
          obj.items = obj.items.filter((k:any) => k.id !== krId);
       }
    }
    
    setLocalStructure(newStructure);
    setHasChanges(true);
  };

  const handleOpenEditDialog = (type: 'OBJ' | 'KR' | 'SUBKR', objId: string, krId?: string, subId?: string) => {
    let item: any = null;
    const obj = localStructure.find(o => o.id === objId);
    if (type === 'OBJ') {
      item = obj;
    } else if (type === 'KR') {
      item = obj?.items?.find((k: any) => k.id === krId);
    } else if (type === 'SUBKR') {
      const kr = obj?.items?.find((k: any) => k.id === krId);
      item = kr?.items?.find((s: any) => s.id === subId);
    }

    if (item) {
      setEditItemInfo({ type, objId, krId, subId });
      setEditCriteriaTitle(item.title || '');
      setEditCriteriaMaxScore(String(item.maxScore ?? ''));
      setEditCriteriaUnitScore(String(item.unitScore ?? ''));
      setEditCriteriaUnit(item.unit || '');
      setOpenEditDialog(true);
    }
  };

  const handleSaveEditCriteria = () => {
    if (!editCriteriaTitle.trim()) {
      showError("Lỗi", "Vui lòng nhập nội dung.");
      return;
    }
    const newStructure = JSON.parse(JSON.stringify(localStructure));
    const obj = newStructure.find((o: any) => o.id === editItemInfo?.objId);
    let targetItem: any = null;

    if (editItemInfo?.type === 'OBJ') {
      targetItem = obj;
    } else if (editItemInfo?.type === 'KR') {
      targetItem = obj?.items?.find((k: any) => k.id === editItemInfo.krId);
    } else if (editItemInfo?.type === 'SUBKR') {
      const kr = obj?.items?.find((k: any) => k.id === editItemInfo.krId);
      targetItem = kr?.items?.find((s: any) => s.id === editItemInfo.subId);
    }

    if (targetItem) {
      targetItem.title = editCriteriaTitle;
      targetItem.maxScore = Number(editCriteriaMaxScore) || 0;
      targetItem.unitScore = Number(editCriteriaUnitScore) || 0;
      targetItem.unit = editCriteriaUnit;
      targetItem.isEdited = true;
    }

    setLocalStructure(newStructure);
    setHasChanges(true);
    setOpenEditDialog(false);
  };

  const handleSubmitChanges = async () => {
    try {
      await api.put(`/okrs/${okr.id}/structure`, { 
        keyResults: localStructure,
        localComments: Object.keys(localComments).length > 0 ? localComments : undefined
      });
      setHasChanges(false);
      setLocalComments({});
      onRefresh();
      showSuccess("Thành công", "Đã gửi cấu trúc mới.");
    } catch (error) {
      showError("Lỗi", "Không thể cập nhật cấu trúc.");
    }
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
    const newMessage = {
      message: chatMessage,
      sender: "USER",
      createdAt: new Date().toISOString(),
    };
    setLocalComments(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newMessage]
    }));
    setChatMessage("");
    setHasChanges(true);
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

    const enrichedReport: Record<string, any> = {};
    localStructure.forEach((obj: any) => {
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
  const progressPercent = maxScore > 0 ? Math.min((totalSelfScore / maxScore) * 100, 100) : 0;

  return (
    <Paper
      sx={{
        mb: 3,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {/* Card Header */}
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

      {/* Expanded Dialog */}
      <Dialog 
        open={expanded} 
        onClose={() => setExpanded(false)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{ sx: { minHeight: '80vh', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ bgcolor: "#1e3a8a", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>Chi tiết OKR: {okr.objective}</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {(isPending || okr.status === 'NEGOTIATING') && hasChanges && (
              <Button 
                variant="contained" 
                color="success" 
                size="small" 
                onClick={handleSubmitChanges}
                startIcon={<Save />}
              >
                Gửi thay đổi
              </Button>
            )}
            <IconButton onClick={() => setExpanded(false)} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
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
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "5%" }}>STT</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "30%" }}>Nội dung</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Điểm tối đa</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", width: "12%" }}>Điểm/đơn vị</TableCell>
                  {canReport && (
                    <>
                      <TableCell sx={{ color: "white", fontWeight: "bold", width: "12%" }}>Số lượng tự khai</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Quy đổi</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", width: "21%" }}>Minh chứng</TableCell>
                    </>
                  )}
                  {(isSubmitted || isCompleted) && (
                    <>
                      <TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Số lượng tự khai</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Điểm khai</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold", width: "10%" }}>Tổng điểm nhiệm vụ</TableCell>
                    </>
                  )}
                  {(isPending || okr.status === 'NEGOTIATING') && (
                    <TableCell sx={{ color: "white", fontWeight: "bold", width: "10%", textAlign: "center" }}>Đàm phán</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {localStructure.map((obj: any, oIndex: number) => (
                  <React.Fragment key={obj.id || oIndex}>
                    <TableRow sx={{ bgcolor: "#dbeafe" }}>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>{obj.id}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{obj.title}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{obj.maxScore}</TableCell>
                      <TableCell></TableCell>
                      {canReport && <><TableCell></TableCell><TableCell></TableCell><TableCell></TableCell></>}
                      {(isSubmitted || isCompleted) && (
                        <><TableCell></TableCell><TableCell></TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "#15803d", fontSize: "1rem" }}>
                            {calcObjectiveScore(obj)} / {obj.maxScore || 0}
                          </TableCell>
                        </>
                      )}
                      {(isPending || okr.status === 'NEGOTIATING') && (
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton size="small" onClick={() => handleOpenAddDialog('KR', obj.id)} title="Thêm tiêu chí">
                              <Add fontSize="small" color="success" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleOpenEditDialog('OBJ', obj.id)} title="Chỉnh sửa">
                              <Edit fontSize="small" color="info" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setActiveChatId(activeChatId === obj.id ? null : obj.id)}>
                              <Comment fontSize="small" color={(okr.proposedChanges?.[obj.id]?.length > 0 || localComments[obj.id]?.length > 0) ? "primary" : "inherit"} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                    <NegotiationChat 
                      itemId={obj.id}
                      activeChatId={activeChatId}
                      history={[...(okr.proposedChanges?.[obj.id] || []), ...(localComments[obj.id] || [])]}
                      chatMessage={chatMessage}
                      setChatMessage={setChatMessage}
                      onSend={handleSendChat}
                      loading={chatLoading}
                      colSpan={11}
                      status={okr.status}
                    />

                    {obj.items?.map((kr: any, kIndex: number) => {
                      const krKey = `${obj.id}-${kr.id}`;
                      const krQty = reportData[krKey]?.quantity || 0;
                      const krUnitScore = Number(kr.unitScore) || 0;
                      const krCalcScore = krUnitScore > 0 ? krQty * krUnitScore : krQty;
                      const existingReport = okr.selfReportData?.[krKey];

                      return (
                        <React.Fragment key={`${oIndex}-${kIndex}`}>
                          <TableRow sx={{ bgcolor: kr.isNew ? "#fef08a" : "#f8fafc" }}>
                            <TableCell sx={{ pl: 3, fontWeight: kr.isNew ? "bold" : "normal" }}>{kr.id}</TableCell>
                            <TableCell sx={{ fontWeight: kr.isNew ? "bold" : "normal" }}>{kr.title}</TableCell>
                            <TableCell sx={{ fontWeight: kr.isNew ? "bold" : "normal" }}>{kr.maxScore || "—"}</TableCell>
                            <TableCell>
                              {kr.unitScore ? (
                                <Chip label={`+${kr.unitScore}/${kr.unit || "đv"}`} size="small" color="primary" variant="outlined" />
                              ) : "—"}
                            </TableCell>
                            {canReport && (
                              <>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={krQty || ""}
                                    onChange={(e) => updateReport(krKey, "quantity", e.target.value)}
                                    inputProps={{ min: 0, style: { textAlign: "center" } }}
                                    sx={{ width: 80 }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{krCalcScore.toFixed(1)}</TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Link minh chứng..."
                                    value={reportData[krKey]?.evidence || ""}
                                    onChange={(e) => updateReport(krKey, "evidence", e.target.value)}
                                  />
                                </TableCell>
                              </>
                            )}
                            {(isSubmitted || isCompleted) && (
                              <>
                                <TableCell>{existingReport?.quantity || 0}</TableCell>
                                <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{existingReport?.score || 0}</TableCell>
                                <TableCell></TableCell>
                              </>
                            )}
                            {(isPending || okr.status === 'NEGOTIATING') && (
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                  <IconButton size="small" onClick={() => handleOpenAddDialog('SUBKR', obj.id, kr.id)} title="Thêm tiêu chí con">
                                    <Add fontSize="small" color="success" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleOpenEditDialog('KR', obj.id, kr.id)} title="Chỉnh sửa">
                                    <Edit fontSize="small" color="info" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => setActiveChatId(activeChatId === kr.id ? null : kr.id)}>
                                    <Comment fontSize="small" color={(okr.proposedChanges?.[kr.id]?.length > 0 || localComments[kr.id]?.length > 0) ? "primary" : "inherit"} />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => handleDeleteItem(obj.id, kr.id)} title="Xóa tiêu chí">
                                    <Delete fontSize="small" color="error" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            )}
                          </TableRow>
                          <NegotiationChat 
                            itemId={kr.id}
                            activeChatId={activeChatId}
                            history={[...(okr.proposedChanges?.[kr.id] || []), ...(localComments[kr.id] || [])]}
                            chatMessage={chatMessage}
                            setChatMessage={setChatMessage}
                            onSend={handleSendChat}
                            loading={chatLoading}
                            colSpan={11}
                            status={okr.status}
                          />

                          {kr.items?.map((sub: any, sIndex: number) => {
                            const subKey = `${obj.id}-${kr.id}-${sub.id}`;
                            const subQty = reportData[subKey]?.quantity || 0;
                            const subUnitScore = Number(sub.unitScore) || 0;
                            const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
                            const existingSub = okr.selfReportData?.[subKey];

                            return (
                              <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                                <TableRow sx={{ bgcolor: sub.isNew ? "#fef08a" : "inherit" }}>
                                  <TableCell sx={{ pl: 6, fontSize: "0.85rem", fontWeight: sub.isNew ? "bold" : "normal" }}>{sub.id}</TableCell>
                                  <TableCell sx={{ fontSize: "0.9rem", fontWeight: sub.isNew ? "bold" : "normal" }}>{sub.title}</TableCell>
                                  <TableCell sx={{ fontWeight: sub.isNew ? "bold" : "normal" }}>{sub.maxScore || "—"}</TableCell>
                                  <TableCell>
                                    {sub.unitScore ? (
                                      <Chip label={`+${sub.unitScore}/${sub.unit || "đv"}`} size="small" variant="outlined" />
                                    ) : "—"}
                                  </TableCell>
                                  {canReport && (
                                    <>
                                      <TableCell>
                                        <TextField
                                          size="small"
                                          type="number"
                                          value={subQty || ""}
                                          onChange={(e) => updateReport(subKey, "quantity", e.target.value)}
                                          inputProps={{ min: 0, style: { textAlign: "center" } }}
                                          sx={{ width: 80 }}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{subCalcScore.toFixed(1)}</TableCell>
                                      <TableCell>
                                        <TextField
                                          size="small"
                                          fullWidth
                                          placeholder="Link..."
                                          value={reportData[subKey]?.evidence || ""}
                                          onChange={(e) => updateReport(subKey, "evidence", e.target.value)}
                                        />
                                      </TableCell>
                                    </>
                                  )}
                                  {(isSubmitted || isCompleted) && (
                                    <>
                                      <TableCell>{existingSub?.quantity || 0}</TableCell>
                                      <TableCell sx={{ fontWeight: "bold", color: "#2563eb" }}>{existingSub?.score || 0}</TableCell>
                                      <TableCell></TableCell>
                                    </>
                                  )}
                                  {(isPending || okr.status === 'NEGOTIATING') && (
                                    <TableCell align="center">
                                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                        <IconButton size="small" onClick={() => handleOpenEditDialog('SUBKR', obj.id, kr.id, sub.id)} title="Chỉnh sửa">
                                          <Edit fontSize="small" color="info" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => setActiveChatId(activeChatId === sub.id ? null : sub.id)}>
                                          <Comment fontSize="small" color={(okr.proposedChanges?.[sub.id]?.length > 0 || localComments[sub.id]?.length > 0) ? "primary" : "inherit"} />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDeleteItem(obj.id, kr.id, sub.id)} title="Xóa tiêu chí con">
                                          <Delete fontSize="small" color="error" />
                                        </IconButton>
                                      </Box>
                                    </TableCell>
                                  )}
                                </TableRow>
                                <NegotiationChat 
                                  itemId={sub.id}
                                  activeChatId={activeChatId}
                                  history={[...(okr.proposedChanges?.[sub.id] || []), ...(localComments[sub.id] || [])]}
                                  chatMessage={chatMessage}
                                  setChatMessage={setChatMessage}
                                  onSend={handleSendChat}
                                  loading={chatLoading}
                                  colSpan={11}
                                  status={okr.status}
                                />
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

          {(isPending || okr.status === 'NEGOTIATING') && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", bgcolor: "#f1f5f9" }}>
              <Button variant="contained" color="success" startIcon={<Check />} onClick={handleAccept}>Tôi đồng ý Chấp nhận OKR này</Button>
            </Box>
          )}

          {canReport && (
            <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 2, bgcolor: "#f1f5f9" }}>
              <Typography variant="body1" sx={{ flexGrow: 1, pt: 1 }}>
                <strong>Tổng điểm tự khai: {totalSelfScore.toFixed(1)}</strong> / {maxScore} điểm
              </Typography>
              <Button variant="contained" startIcon={<Send />} onClick={handleSubmitReport} disabled={saving}>
                {saving ? "Đang nộp..." : "Nộp bài tự khai"}
              </Button>
            </Box>
          )}

          {isCompleted && (
            <Box sx={{ p: 2, bgcolor: "#f0fdf4" }}>
              <Alert severity="success">
                <strong>Điểm cuối cùng: {okr.totalScore} điểm</strong> — Đã được Trưởng khoa duyệt.
              </Alert>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <AddCriteriaDialog 
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSave={handleSaveNewCriteria}
        parentType={addParentType}
        title={newCriteriaTitle}
        setTitle={setNewCriteriaTitle}
        unitScore={newCriteriaUnitScore}
        setUnitScore={setNewCriteriaUnitScore}
        unit={newCriteriaUnit}
        setUnit={setNewCriteriaUnit}
      />

      {/* Dialog Sửa Tiêu chí */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa Tiêu chí</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField 
              label="Nội dung tiêu chí" 
              fullWidth 
              value={editCriteriaTitle} 
              onChange={(e) => setEditCriteriaTitle(e.target.value)} 
            />
            <TextField 
              label="Điểm tối đa" 
              type="number" 
              fullWidth 
              value={editCriteriaMaxScore} 
              onChange={(e) => setEditCriteriaMaxScore(e.target.value)} 
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Điểm / Đơn vị" 
                type="number" 
                fullWidth 
                value={editCriteriaUnitScore} 
                onChange={(e) => setEditCriteriaUnitScore(e.target.value)} 
              />
              <TextField 
                label="Đơn vị tính" 
                fullWidth 
                value={editCriteriaUnit} 
                onChange={(e) => setEditCriteriaUnit(e.target.value)} 
                placeholder="VD: bài, đv, giờ..."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEditCriteria}>Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default OkrCard;
