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

export default function OkrManagerTree({ okr, onRefresh }: { okr: any; onRefresh: () => void }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const structure = Array.isArray(okr.keyResults) ? okr.keyResults : [];

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
      alert("Lỗi khi gửi nhận xét");
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
      alert("Lỗi cập nhật điểm");
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
          {structure.map((obj: any, oIndex: number) => (
            <React.Fragment key={obj.id || oIndex}>
              {/* Objective row */}
              <TableRow sx={{ bgcolor: "#dbeafe" }}>
                <TableCell sx={{ fontWeight: "bold" }}>{obj.id}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{obj.title}</TableCell>
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
              {obj.items?.map((kr: any, kIndex: number) => (
                <React.Fragment key={`${oIndex}-${kIndex}`}>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ pl: 3 }}>{kr.id}</TableCell>
                    <TableCell>{kr.title}</TableCell>
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
                  {kr.items?.map((sub: any, sIndex: number) => (
                    <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                      <TableRow>
                        <TableCell sx={{ pl: 6 }}>{sub.id}</TableCell>
                        <TableCell>{sub.title}</TableCell>
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
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
