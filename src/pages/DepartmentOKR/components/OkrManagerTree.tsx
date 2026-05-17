import React, { useState } from "react";
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
  TextField,
  Button,
} from "@mui/material";
import { Comment, Send } from "@mui/icons-material";
import { api } from "../../../services/api";
import { showError } from "../../../utils/swal";

export default function OkrManagerTree({ okr, onRefresh }: { okr: any; onRefresh: () => void }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const structure = Array.isArray(okr.keyResults) ? okr.keyResults : [];
  const originalStructure = okr.proposedChanges?.originalStructure || null;

  const findOriginalItem = (id: string) => {
    if (!originalStructure) return null;
    for (const obj of originalStructure) {
      if (obj.id === id) return obj;
      if (obj.items) {
        for (const kr of obj.items) {
          if (kr.id === id) return kr;
          if (kr.items) {
            for (const sub of kr.items) {
              if (sub.id === id) return sub;
            }
          }
        }
      }
    }
    return null;
  };

  const hasChanged = (newItem: any, oldItem: any) => {
    if (!oldItem) return false;
    return String(newItem.title || '').trim() !== String(oldItem.title || '').trim() || 
           Number(newItem.maxScore || 0) !== Number(oldItem.maxScore || 0) || 
           Number(newItem.unitScore || 0) !== Number(oldItem.unitScore || 0) ||
           String(newItem.unit || '').trim() !== String(oldItem.unit || '').trim();
  };

  const renderOldRow = (oldItem: any, indent: number) => {
    if (!oldItem) return null;
    return (
      <TableRow sx={{ bgcolor: "#f1f5f9", opacity: 0.7 }}>
        <TableCell sx={{ pl: indent, textDecoration: "line-through", color: "text.secondary" }}>{oldItem.id}</TableCell>
        <TableCell sx={{ textDecoration: "line-through", color: "text.secondary" }}>[Cũ] {oldItem.title}</TableCell>
        <TableCell sx={{ textDecoration: "line-through", color: "text.secondary" }}>{oldItem.maxScore || "—"}</TableCell>
        <TableCell sx={{ textDecoration: "line-through", color: "text.secondary" }}>{oldItem.unitScore ? `+${oldItem.unitScore}/${oldItem.unit || 'đv'}` : '—'}</TableCell>
        <TableCell align="center"></TableCell>
      </TableRow>
    );
  };

  const deletedItems: any[] = [];
  if (originalStructure) {
    const flatten = (items: any[]) => {
      let result: any[] = [];
      items.forEach(i => {
        result.push(i);
        if (i.items) result = result.concat(flatten(i.items));
      });
      return result;
    };
    const oldFlat = flatten(originalStructure);
    const newFlat = flatten(structure);
    oldFlat.forEach(o => {
      if (!newFlat.find(n => n.id === o.id)) {
        deletedItems.push(o);
      }
    });
  }

  const handleSendChat = async (itemId: string) => {
    if (!chatMessage.trim()) return;
    setChatLoading(true);
    try {
      await api.post(`/okrs/${okr.id}/chat`, {
        itemId,
        message: chatMessage,
        sender: "MANAGER",
      });
      setChatMessage("");
      onRefresh();
    } catch (error) {
      showError("Lỗi", "Không thể gửi nhận xét. Vui lòng thử lại.");
    } finally {
      setChatLoading(false);
    }
  };

  const updateItemScore = async (itemId: string, field: 'maxScore' | 'unitScore', value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    try {
      await api.put(`/okrs/${okr.id}/edit-item`, {
        itemId,
        updates: { [field]: numValue }
      });
      onRefresh();
    } catch (error) {
      showError("Lỗi", "Không thể cập nhật điểm.");
    }
  };

  const renderChatRow = (itemId: string, colSpan: number) => {
    if (activeChatId !== itemId) return null;
    const history = okr.proposedChanges?.[itemId] || [];
    return (
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ p: 0, bgcolor: "#f1f5f9" }}>
          <Box sx={{ p: 2, borderLeft: "3px solid #f59e0b", ml: 2, bgcolor: "#fff", mb: 2, mt: 1, borderRadius: 1, boxShadow: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: "#92400e" }}>Đàm phán mục: {itemId}</Typography>
            {history.length > 0 ? (
              <Box sx={{ mb: 2, maxHeight: 150, overflowY: "auto" }}>
                {history.map((msg: any, idx: number) => (
                  <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: msg.sender === 'USER' ? '#eff6ff' : '#fff7ed', borderRadius: 1, maxWidth: "80%" }}>
                    <Typography variant="caption" fontWeight="bold" color={msg.sender === 'USER' ? 'primary' : 'warning.main'}>
                      {msg.sender === 'USER' ? 'Nhân viên' : 'Bạn'} - {new Date(msg.createdAt).toLocaleString('vi-VN')}
                    </Typography>
                    <Typography variant="body2">{msg.message}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Chưa có trao đổi nào.</Typography>
            )}
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField 
                size="small" 
                fullWidth 
                placeholder="Nhập phản hồi/đề xuất..." 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter') handleSendChat(itemId); }}
              />
              <Button variant="contained" color="warning" disabled={chatLoading || !chatMessage.trim()} onClick={() => handleSendChat(itemId)} startIcon={<Send />}>Gửi</Button>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Mã</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "45%" }}>Nội dung</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Điểm tối đa</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Điểm/Đơn vị</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%", textAlign: "center" }}>Đàm phán</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {structure.map((obj: any, oIndex: number) => {
            const oldObj = findOriginalItem(obj.id);
            const isObjChanged = hasChanged(obj, oldObj);
            
            return (
            <React.Fragment key={obj.id || oIndex}>
              {/* Objective row */}
              {isObjChanged && renderOldRow(oldObj, 2)}
              <TableRow sx={{ bgcolor: isObjChanged ? "#fef08a" : "#dbeafe" }}>
                <TableCell sx={{ fontWeight: "bold" }}>{obj.id}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{isObjChanged ? '[Mới] ' : ''}{obj.title}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{obj.maxScore}</TableCell>
                <TableCell></TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => setActiveChatId(activeChatId === obj.id ? null : obj.id)}>
                    <Comment fontSize="small" color={okr.proposedChanges?.[obj.id]?.length > 0 ? "warning" : "inherit"} />
                  </IconButton>
                </TableCell>
              </TableRow>
              {renderChatRow(obj.id, 5)}

              {/* KR rows */}
              {obj.items?.map((kr: any, kIndex: number) => {
                const oldKr = findOriginalItem(kr.id);
                const isKrChanged = hasChanged(kr, oldKr);
                const isKrNew = !oldKr;

                return (
                <React.Fragment key={`${oIndex}-${kIndex}`}>
                  {isKrChanged && renderOldRow(oldKr, 3)}
                  <TableRow sx={{ bgcolor: (isKrNew || isKrChanged || kr.isEdited) ? "#fef08a" : "#f8fafc" }}>
                    <TableCell sx={{ pl: 3, fontWeight: (isKrNew || isKrChanged || kr.isEdited) ? "bold" : "normal" }}>{kr.id}</TableCell>
                    <TableCell sx={{ fontWeight: (isKrNew || isKrChanged || kr.isEdited) ? "bold" : "normal" }}>{isKrChanged ? '[Mới] ' : ''}{kr.title}</TableCell>
                    <TableCell>
                      <TextField 
                        size="small" type="number" defaultValue={kr.maxScore} 
                        onBlur={(e) => updateItemScore(kr.id, 'maxScore', e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField 
                        size="small" type="number" defaultValue={kr.unitScore || 0} 
                        onBlur={(e) => updateItemScore(kr.id, 'unitScore', e.target.value)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setActiveChatId(activeChatId === kr.id ? null : kr.id)}>
                        <Comment fontSize="small" color={okr.proposedChanges?.[kr.id]?.length > 0 ? "warning" : "inherit"} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {renderChatRow(kr.id, 5)}

                  {/* Sub-KR rows */}
                  {kr.items?.map((sub: any, sIndex: number) => {
                    const oldSub = findOriginalItem(sub.id);
                    const isSubChanged = hasChanged(sub, oldSub);
                    const isSubNew = !oldSub;

                    return (
                    <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                      {isSubChanged && renderOldRow(oldSub, 6)}
                      <TableRow sx={{ bgcolor: (isSubNew || isSubChanged || sub.isEdited) ? "#fef08a" : "inherit" }}>
                        <TableCell sx={{ pl: 6, fontWeight: (isSubNew || isSubChanged || sub.isEdited) ? "bold" : "normal" }}>{sub.id}</TableCell>
                        <TableCell sx={{ fontWeight: (isSubNew || isSubChanged || sub.isEdited) ? "bold" : "normal" }}>{isSubChanged ? '[Mới] ' : ''}{sub.title}</TableCell>
                        <TableCell>
                          <TextField 
                            size="small" type="number" defaultValue={sub.maxScore} 
                            onBlur={(e) => updateItemScore(sub.id, 'maxScore', e.target.value)}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField 
                            size="small" type="number" defaultValue={sub.unitScore || 0} 
                            onBlur={(e) => updateItemScore(sub.id, 'unitScore', e.target.value)}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => setActiveChatId(activeChatId === sub.id ? null : sub.id)}>
                            <Comment fontSize="small" color={okr.proposedChanges?.[sub.id]?.length > 0 ? "warning" : "inherit"} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      {renderChatRow(sub.id, 5)}
                    </React.Fragment>
                  )})}
                </React.Fragment>
              )})}
            </React.Fragment>
          )})}

          {/* Deleted items at the end */}
          {deletedItems.length > 0 && (
            <>
              <TableRow>
                <TableCell colSpan={5} sx={{ bgcolor: "#fee2e2", fontWeight: "bold", textAlign: "center", color: "#b91c1c" }}>
                  Các tiêu chí đã bị xóa
                </TableCell>
              </TableRow>
              {deletedItems.map((delItem, idx) => (
                  <TableRow key={`del-${idx}`} sx={{ bgcolor: "#fef2f2" }}>
                    <TableCell sx={{ pl: delItem.id.split('.').length === 1 ? 2 : delItem.id.split('.').length === 2 ? 4 : 6, textDecoration: "line-through", color: "error.main" }}>{delItem.id}</TableCell>
                    <TableCell sx={{ textDecoration: "line-through", color: "error.main" }}>{delItem.title}</TableCell>
                    <TableCell sx={{ textDecoration: "line-through", color: "error.main" }}>{delItem.maxScore || "—"}</TableCell>
                    <TableCell sx={{ textDecoration: "line-through", color: "error.main" }}>{delItem.unitScore ? `+${delItem.unitScore}/${delItem.unit || 'đv'}` : '—'}</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
