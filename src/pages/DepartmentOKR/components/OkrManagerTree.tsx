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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Comment, Send, Edit, Add, Delete, Save } from "@mui/icons-material";
import { api } from "../../../services/api";
import { showError, showSuccess } from "../../../utils/swal";
import AddCriteriaDialog from "../../MyOkr/components/AddCriteriaDialog";

export default function OkrManagerTree({ okr, onRefresh }: { okr: any; onRefresh: () => void }) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [localStructure, setLocalStructure] = useState<any[]>(Array.isArray(okr.keyResults) ? okr.keyResults : []);
  const [hasChanges, setHasChanges] = useState(false);
  const [localComments, setLocalComments] = useState<Record<string, any[]>>({});

  // Edit/Add Criteria States
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addParentType, setAddParentType] = useState<'KR' | 'SUBKR' | null>(null);
  const [addObjectiveId, setAddObjectiveId] = useState<string | null>(null);
  const [addKrId, setAddKrId] = useState<string | null>(null);
  const [newCriteriaTitle, setNewCriteriaTitle] = useState('');
  const [newCriteriaUnitScore, setNewCriteriaUnitScore] = useState('');
  const [newCriteriaUnit, setNewCriteriaUnit] = useState('');

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
    const newFlat = flatten(localStructure);
    oldFlat.forEach(o => {
      if (!newFlat.find(n => n.id === o.id)) {
        deletedItems.push(o);
      }
    });
  }

  const handleSendChat = async (itemId: string) => {
    if (!chatMessage.trim()) return;
    const newMessage = {
      message: chatMessage,
      sender: "MANAGER",
      createdAt: new Date().toISOString(),
    };
    setLocalComments(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newMessage]
    }));
    setChatMessage("");
    setHasChanges(true);
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
      showSuccess("Thành công", "Đã lưu lại cấu trúc chỉnh sửa.");
    } catch (error) {
      showError("Lỗi", "Không thể cập nhật cấu trúc.");
    }
  };

  const renderChatRow = (itemId: string, colSpan: number) => {
    if (activeChatId !== itemId) return null;
    const history = [...(okr.proposedChanges?.[itemId] || []), ...(localComments[itemId] || [])];
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
    <Box>
    {hasChanges && (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmitChanges} startIcon={<Save />}>
          Lưu lại cấu trúc thay đổi
        </Button>
      </Box>
    )}
    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Mã</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "45%" }}>Nội dung</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Điểm tối đa</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Điểm/Đơn vị</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "15%", textAlign: "center" }}>Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {localStructure.map((obj: any, oIndex: number) => {
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
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <IconButton size="small" onClick={() => handleOpenAddDialog('KR', obj.id)} title="Thêm tiêu chí">
                      <Add fontSize="small" color="success" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleOpenEditDialog('OBJ', obj.id)} title="Chỉnh sửa">
                      <Edit fontSize="small" color="info" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setActiveChatId(activeChatId === obj.id ? null : obj.id)}>
                      <Comment fontSize="small" color={(okr.proposedChanges?.[obj.id]?.length > 0 || localComments[obj.id]?.length > 0) ? "warning" : "inherit"} />
                    </IconButton>
                  </Box>
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
                      {kr.maxScore}
                    </TableCell>
                    <TableCell>
                      {kr.unitScore ? `+${kr.unitScore}/${kr.unit || 'đv'}` : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton size="small" onClick={() => handleOpenAddDialog('SUBKR', obj.id, kr.id)} title="Thêm tiêu chí con">
                          <Add fontSize="small" color="success" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenEditDialog('KR', obj.id, kr.id)} title="Chỉnh sửa">
                          <Edit fontSize="small" color="info" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setActiveChatId(activeChatId === kr.id ? null : kr.id)}>
                          <Comment fontSize="small" color={(okr.proposedChanges?.[kr.id]?.length > 0 || localComments[kr.id]?.length > 0) ? "warning" : "inherit"} />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteItem(obj.id, kr.id)} title="Xóa tiêu chí">
                          <Delete fontSize="small" color="error" />
                        </IconButton>
                      </Box>
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
                          {sub.maxScore}
                        </TableCell>
                        <TableCell>
                          {sub.unitScore ? `+${sub.unitScore}/${sub.unit || 'đv'}` : '—'}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <IconButton size="small" onClick={() => handleOpenEditDialog('SUBKR', obj.id, kr.id, sub.id)} title="Chỉnh sửa">
                              <Edit fontSize="small" color="info" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setActiveChatId(activeChatId === sub.id ? null : sub.id)}>
                              <Comment fontSize="small" color={(okr.proposedChanges?.[sub.id]?.length > 0 || localComments[sub.id]?.length > 0) ? "warning" : "inherit"} />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteItem(obj.id, kr.id, sub.id)} title="Xóa tiêu chí con">
                              <Delete fontSize="small" color="error" />
                            </IconButton>
                          </Box>
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
          <Button variant="contained" onClick={handleSaveEditCriteria}>Lưu thay đổi tạm thời</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
