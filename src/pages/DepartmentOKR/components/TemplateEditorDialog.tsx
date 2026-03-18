import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Add, Delete, Flag, Save } from '@mui/icons-material';
import { api } from '../../../services/api';

interface TemplateEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function TemplateEditorDialog({
  open,
  onClose,
  onSave,
  initialData,
}: TemplateEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [positionName, setPositionName] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [structure, setStructure] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadData();
      if (initialData) {
        setTitle(initialData.title);
        setDepartmentId(initialData.departmentId || '');
        setPositionId(initialData.positionId || '');
        setPositionName(initialData.positionName || '');
        setJobTitle(initialData.jobTitle || '');
        setStructure(initialData.structure || []);
      } else {
        setTitle('');
        setDepartmentId('');
        setPositionId('');
        setPositionName('');
        setJobTitle('');
        setStructure([]);
      }
    }
  }, [open, initialData]);

  const loadData = async () => {
    try {
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data?.data || deptRes.data || []);

      const posRes = await api.get('/management-positions');
      setPositions(posRes.data?.data || posRes.data || []);
    } catch (error) {
      console.error('Lỗi load data', error);
    }
  };

  const handlePositionChange = (pid: string) => {
    setPositionId(pid);
    const found = positions.find((p: any) => p.id === pid);
    setPositionName(found?.name || '');
  };

  const handleAddObjective = () => {
    const newChar = String.fromCharCode(65 + structure.length);
    setStructure([
      ...structure,
      {
        id: newChar,
        type: 'objective',
        title: '',
        maxScore: 0,
        items: []
      }
    ]);
  };

  const handleAddKR = (objIndex: number) => {
    const newStructure = [...structure];
    const objective = newStructure[objIndex];
    const newId = `${objective.items.length + 1}`;
    objective.items.push({
      id: newId,
      type: 'kr',
      title: '',
      maxScore: 0,
      unitScore: 0,
      unit: '',
      target: 0,
      items: []
    });
    setStructure(newStructure);
  };

  const handleAddSubKR = (objIndex: number, krIndex: number) => {
    const newStructure = [...structure];
    const kr = newStructure[objIndex].items[krIndex];
    const newId = `${kr.id}.${kr.items.length + 1}`;
    kr.items.push({
      id: newId,
      type: 'sub_kr',
      title: '',
      maxScore: 0,
      unitScore: 0,
      unit: '',
      target: 0
    });
    setStructure(newStructure);
  };

  const handleDeleteObj = (objIndex: number) => {
    setStructure(structure.filter((_, i) => i !== objIndex));
  };

  const handleDeleteKR = (objIndex: number, krIndex: number) => {
    const newStructure = [...structure];
    newStructure[objIndex].items.splice(krIndex, 1);
    setStructure(newStructure);
  };

  const handleDeleteSubKR = (objIndex: number, krIndex: number, subIndex: number) => {
    const newStructure = [...structure];
    newStructure[objIndex].items[krIndex].items.splice(subIndex, 1);
    setStructure(newStructure);
  };

  const updateItem = (objIndex: number, field: string, value: any, krIndex?: number, subKrIndex?: number) => {
    const newStructure = [...structure];
    if (krIndex === undefined) {
      newStructure[objIndex][field] = value;
    } else if (subKrIndex === undefined) {
      newStructure[objIndex].items[krIndex][field] = value;
    } else {
      newStructure[objIndex].items[krIndex].items[subKrIndex][field] = value;
    }
    setStructure(newStructure);
  };

  // Clamp to non-negative
  const setNonNeg = (val: string) => Math.max(0, Number(val) || 0);

  const handleSubmit = () => {
    // Get current user info for createdBy
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};

    onSave({
      title,
      departmentId,
      positionId,
      positionName,
      jobTitle,
      structure,
      createdByUserId: user.id || '',
      createdByName: user.name || user.email || 'Unknown',
    });
  };

  const jobTitles = ['Giảng viên', 'Chuyên viên', 'Nghiên cứu viên', 'Khác'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ color: '#1e3a8a', fontWeight: 'bold' }}>
        <Flag sx={{ mr: 1, verticalAlign: 'middle' }} />
        {initialData ? 'Chỉnh sửa Template OKR' : 'Tạo mới Template OKR'}
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ mt: 2, bgcolor: '#f8fafc' }}>
        {/* Header fields */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            sx={{ flex: 2, minWidth: 300 }}
            label="Tên Template (VD: OKR Phó khoa - Giảng viên)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <FormControl sx={{ flex: 1, minWidth: 180 }}>
            <InputLabel>Bộ môn</InputLabel>
            <Select value={departmentId} label="Bộ môn" onChange={(e) => setDepartmentId(e.target.value)}>
              {departments.map((d: any) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1, minWidth: 180 }}>
            <InputLabel>Chức vụ</InputLabel>
            <Select value={positionId} label="Chức vụ" onChange={(e) => handlePositionChange(e.target.value)}>
              <MenuItem value="">-- Không chọn --</MenuItem>
              {positions.map((p: any) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1, minWidth: 180 }}>
            <InputLabel>Chức danh</InputLabel>
            <Select value={jobTitle} label="Chức danh" onChange={(e) => setJobTitle(e.target.value)}>
              <MenuItem value="">-- Không chọn --</MenuItem>
              {jobTitles.map((jt) => <MenuItem key={jt} value={jt}>{jt}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        {/* Structure header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Cấu trúc Điểm chuẩn OKR</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddObjective}>Thêm Mục tiêu lớn (A, B...)</Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#1e3a8a' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '6%' }}>STT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '34%' }}>Nội dung</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '12%' }}>Điểm tối đa</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '12%' }}>Điểm/đơn vị</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '12%' }}>Đơn vị tính</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '12%' }}>Số liệu (quy đổi)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '12%' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structure.map((obj, oIndex) => (
                <React.Fragment key={obj.id || oIndex}>
                  {/* === OBJECTIVE ROW (Emphasized) === */}
                  <TableRow sx={{ bgcolor: '#1e3a8a', '& td': { color: 'white', borderBottom: '2px solid #3b82f6' } }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{obj.id}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth size="small" placeholder="Tên mục tiêu lớn..."
                        value={obj.title}
                        onChange={(e) => updateItem(oIndex, 'title', e.target.value)}
                        sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }, '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.6)' } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth size="small" type="number" value={obj.maxScore}
                        onChange={(e) => updateItem(oIndex, 'maxScore', setNonNeg(e.target.value))}
                        inputProps={{ min: 0 }}
                        sx={{ '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.15)', color: 'white' } }}
                      />
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined" sx={{ color: 'white', borderColor: 'white', mr: 0.5 }} onClick={() => handleAddKR(oIndex)}>
                        <Add fontSize="small" /> KR
                      </Button>
                      <IconButton size="small" sx={{ color: '#fca5a5' }} onClick={() => handleDeleteObj(oIndex)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* === KR ROWS === */}
                  {obj.items.map((kr: any, kIndex: number) => (
                    <React.Fragment key={`${oIndex}-${kIndex}`}>
                      <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                        <TableCell sx={{ pl: 3, fontWeight: 'bold' }}>{kr.id}</TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" placeholder="Kết quả then chốt..." value={kr.title} onChange={(e) => updateItem(oIndex, 'title', e.target.value, kIndex)} />
                        </TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" type="number" value={kr.maxScore} onChange={(e) => updateItem(oIndex, 'maxScore', setNonNeg(e.target.value), kIndex)} inputProps={{ min: 0 }} />
                        </TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" type="number" placeholder="+2" value={kr.unitScore || ''} onChange={(e) => updateItem(oIndex, 'unitScore', setNonNeg(e.target.value), kIndex)} inputProps={{ min: 0 }} />
                        </TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" placeholder="học phần" value={kr.unit || ''} onChange={(e) => updateItem(oIndex, 'unit', e.target.value, kIndex)} />
                        </TableCell>
                        <TableCell>
                          <TextField fullWidth size="small" type="number" placeholder="Target" value={kr.target || ''} onChange={(e) => updateItem(oIndex, 'target', setNonNeg(e.target.value), kIndex)} inputProps={{ min: 0 }} />
                        </TableCell>
                        <TableCell>
                          <Button size="small" onClick={() => handleAddSubKR(oIndex, kIndex)}><Add fontSize="small" />Sub</Button>
                          <IconButton size="small" color="error" onClick={() => handleDeleteKR(oIndex, kIndex)}><Delete fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>

                      {/* === SUB-KR ROWS === */}
                      {kr.items && kr.items.map((subKr: any, sIndex: number) => (
                        <TableRow key={`${oIndex}-${kIndex}-${sIndex}`}>
                          <TableCell sx={{ pl: 6, fontSize: '0.85rem' }}>{subKr.id}</TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" placeholder="Tiêu chí chi tiết..." value={subKr.title} onChange={(e) => updateItem(oIndex, 'title', e.target.value, kIndex, sIndex)} />
                          </TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" type="number" value={subKr.maxScore} onChange={(e) => updateItem(oIndex, 'maxScore', setNonNeg(e.target.value), kIndex, sIndex)} inputProps={{ min: 0 }} />
                          </TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" type="number" placeholder="+1" value={subKr.unitScore || ''} onChange={(e) => updateItem(oIndex, 'unitScore', setNonNeg(e.target.value), kIndex, sIndex)} inputProps={{ min: 0 }} />
                          </TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" placeholder="đề cương" value={subKr.unit || ''} onChange={(e) => updateItem(oIndex, 'unit', e.target.value, kIndex, sIndex)} />
                          </TableCell>
                          <TableCell>
                            <TextField fullWidth size="small" type="number" value={subKr.target || ''} onChange={(e) => updateItem(oIndex, 'target', setNonNeg(e.target.value), kIndex, sIndex)} inputProps={{ min: 0 }} />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="error" onClick={() => handleDeleteSubKR(oIndex, kIndex, sIndex)}><Delete fontSize="small" /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
              {structure.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có dữ liệu, hãy thêm Mục tiêu lớn.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} disabled={!title}>
          Lưu Template
        </Button>
      </DialogActions>
    </Dialog>
  );
}
