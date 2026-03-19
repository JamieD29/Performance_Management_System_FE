import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Check, Edit, Flag, ExpandMore, ExpandLess, Comment, Send, Assignment, Save } from '@mui/icons-material';
import { api } from '../../services/api';

const statusConfig: Record<string, { label: string; color: 'warning' | 'info' | 'success' | 'error' | 'default' }> = {
  PENDING: { label: 'Chờ phản hồi', color: 'warning' },
  NEGOTIATING: { label: 'Đang đàm phán', color: 'info' },
  ACCEPTED: { label: 'Đã chấp nhận — Sẵn sàng tự khai', color: 'success' },
  SUBMITTED: { label: 'Đã nộp bài — Chờ duyệt', color: 'info' },
  COMPLETED: { label: 'Hoàn tất', color: 'default' },
  REJECTED: { label: 'Bị từ chối', color: 'error' },
};

// ============================
// Sub-component: Chi tiết 1 OKR
// ============================
function OkrCard({ okr, onRefresh }: { okr: any; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [negotiateDialog, setNegotiateDialog] = useState(false);
  const [commentsByObj, setCommentsByObj] = useState<Record<string, string>>({});

  // Self-report state: { "A-1": { quantity: 3, evidence: "link..." } }
  const [reportData, setReportData] = useState<Record<string, { quantity: number; evidence: string }>>({});
  const [saving, setSaving] = useState(false);

  const structure = Array.isArray(okr.keyResults) ? okr.keyResults : [];
  const isAccepted = okr.status === 'ACCEPTED';
  const isSubmitted = okr.status === 'SUBMITTED';
  const isCompleted = okr.status === 'COMPLETED';
  const isPending = okr.status === 'PENDING';
  const canReport = isAccepted; // Chỉ tự khai khi đã ACCEPTED

  // Load existing self-report data if any
  useEffect(() => {
    if (okr.selfReportData && typeof okr.selfReportData === 'object') {
      setReportData(okr.selfReportData);
    }
  }, [okr.selfReportData]);

  // Calculate total self-report score
  const calcTotalScore = () => {
    let total = 0;
    Object.values(reportData).forEach(item => {
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

  const handleAccept = async () => {
    if (!confirm('Bạn xác nhận chấp nhận OKR này? Sau khi chấp nhận, bạn sẽ bắt đầu tự khai điểm.')) return;
    try {
      await api.put(`/okrs/${okr.id}/accept`);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra.');
    }
  };

  const openNegotiate = () => {
    const initial: Record<string, string> = {};
    structure.forEach((obj: any) => { initial[obj.id] = ''; });
    setCommentsByObj(initial);
    setNegotiateDialog(true);
  };

  const handleNegotiate = async () => {
    const hasComment = Object.values(commentsByObj).some(c => c.trim() !== '');
    if (!hasComment) {
      alert('Vui lòng nhập ít nhất 1 nhận xét.');
      return;
    }
    try {
      await api.put(`/okrs/${okr.id}/negotiate`, {
        proposedChanges: { comments: commentsByObj, originalKeyResults: okr.keyResults }
      });
      alert('✅ Đề xuất đã gửi cho Trưởng khoa!');
      setNegotiateDialog(false);
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra.');
    }
  };

  const updateReport = (krId: string, field: 'quantity' | 'evidence', value: any) => {
    setReportData(prev => ({
      ...prev,
      [krId]: { ...prev[krId], [field]: field === 'quantity' ? Math.max(0, Number(value) || 0) : value }
    }));
  };

  const handleSubmitReport = async () => {
    if (!confirm('Bạn xác nhận nộp bài tự khai? Sau khi nộp sẽ chờ Trưởng khoa duyệt.')) return;
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
          evidence: reportData[key]?.evidence || '',
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
            evidence: reportData[subKey]?.evidence || '',
            score: Math.min(subScore, Number(sub.maxScore) || Infinity),
            krTitle: sub.title,
            objTitle: obj.title,
          };
        });
      });
    });

    try {
      await api.put(`/okrs/${okr.id}/self-report`, { selfReportData: enrichedReport });
      alert('✅ Đã nộp bài tự khai thành công!');
      onRefresh();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  const totalSelfScore = calcTotalScore();
  const maxScore = calcMaxScore();
  const progressPercent = maxScore > 0 ? Math.min((totalSelfScore / maxScore) * 100, 100) : 0;

  return (
    <Paper sx={{ mb: 3, border: '1px solid #e2e8f0', overflow: 'hidden', borderRadius: 2 }}>
      {/* Header */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f8fafc', cursor: 'pointer', '&:hover': { bgcolor: '#f1f5f9' } }}
        onClick={() => setExpanded(!expanded)}
      >
        <IconButton size="small" sx={{ mr: 1 }}>
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a">{okr.objective}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={statusConfig[okr.status]?.label || okr.status}
              color={statusConfig[okr.status]?.color || 'default'}
              size="small"
            />
            {okr.deadline && (
              <Chip label={`Deadline: ${new Date(okr.deadline).toLocaleDateString('vi-VN')}`} size="small" variant="outlined" />
            )}
            {(isAccepted || isSubmitted || isCompleted) && (
              <Chip label={`Điểm: ${okr.totalScore || totalSelfScore}/${maxScore}`} size="small" color="primary" variant="outlined" />
            )}
          </Box>
        </Box>
        {isPending && (
          <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
            <Button size="small" variant="contained" color="success" startIcon={<Check />} onClick={handleAccept}>
              Chấp nhận
            </Button>
            <Button size="small" variant="outlined" color="warning" startIcon={<Comment />} onClick={openNegotiate}>
              Đề xuất
            </Button>
          </Box>
        )}
      </Box>

      {/* Progress bar for ACCEPTED */}
      {(canReport || isSubmitted || isCompleted) && (
        <Box sx={{ px: 2, pb: 1 }}>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }} />
          <Typography variant="caption" color="text.secondary">{progressPercent.toFixed(0)}% hoàn thành</Typography>
        </Box>
      )}

      {/* Expanded content */}
      <Collapse in={expanded}>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#1e3a8a' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '5%' }}>STT</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>Nội dung</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Điểm tối đa</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '12%' }}>Điểm/đơn vị</TableCell>
                {canReport && <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '12%' }}>Số lượng tự khai</TableCell>}
                {canReport && <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Quy đổi</TableCell>}
                {canReport && <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '21%' }}>Minh chứng</TableCell>}
                {(isSubmitted || isCompleted) && <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>SL Khai</TableCell>}
                {(isSubmitted || isCompleted) && <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>Điểm khai</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {structure.map((obj: any, oIndex: number) => (
                <React.Fragment key={obj.id || oIndex}>
                  {/* Objective row */}
                  <TableRow sx={{ bgcolor: '#dbeafe' }}>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{obj.id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{obj.title}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{obj.maxScore}</TableCell>
                    <TableCell></TableCell>
                    {canReport && <TableCell></TableCell>}
                    {canReport && <TableCell></TableCell>}
                    {canReport && <TableCell></TableCell>}
                    {(isSubmitted || isCompleted) && <TableCell></TableCell>}
                    {(isSubmitted || isCompleted) && <TableCell></TableCell>}
                  </TableRow>

                  {/* KR rows */}
                  {obj.items?.map((kr: any, kIndex: number) => {
                    const krKey = `${obj.id}-${kr.id}`;
                    const krQty = reportData[krKey]?.quantity || 0;
                    const krUnitScore = Number(kr.unitScore) || 0;
                    const krCalcScore = krUnitScore > 0 ? krQty * krUnitScore : krQty;
                    const existingReport = okr.selfReportData?.[krKey];

                    return (
                      <React.Fragment key={`${oIndex}-${kIndex}`}>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ pl: 3 }}>{kr.id}</TableCell>
                          <TableCell>{kr.title}</TableCell>
                          <TableCell>{kr.maxScore}</TableCell>
                          <TableCell>
                            {kr.unitScore ? <Chip label={`+${kr.unitScore}/${kr.unit || 'đv'}`} size="small" color="primary" variant="outlined" /> : '—'}
                          </TableCell>
                          {canReport && (
                            <TableCell>
                              <TextField
                                size="small" type="number" value={krQty || ''}
                                onChange={(e) => updateReport(krKey, 'quantity', e.target.value)}
                                inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                          )}
                          {canReport && (
                            <TableCell sx={{ fontWeight: 'bold', color: '#2563eb' }}>
                              {krCalcScore.toFixed(1)}
                            </TableCell>
                          )}
                          {canReport && (
                            <TableCell>
                              <TextField
                                size="small" fullWidth placeholder="Link minh chứng..."
                                value={reportData[krKey]?.evidence || ''}
                                onChange={(e) => updateReport(krKey, 'evidence', e.target.value)}
                              />
                            </TableCell>
                          )}
                          {(isSubmitted || isCompleted) && <TableCell>{existingReport?.quantity || 0}</TableCell>}
                          {(isSubmitted || isCompleted) && <TableCell sx={{ fontWeight: 'bold', color: '#2563eb' }}>{existingReport?.score || 0}</TableCell>}
                        </TableRow>

                        {/* Sub-KR rows */}
                        {kr.items?.map((sub: any, sIndex: number) => {
                          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
                          const subQty = reportData[subKey]?.quantity || 0;
                          const subUnitScore = Number(sub.unitScore) || 0;
                          const subCalcScore = subUnitScore > 0 ? subQty * subUnitScore : subQty;
                          const existingSub = okr.selfReportData?.[subKey];

                          return (
                            <TableRow key={`${oIndex}-${kIndex}-${sIndex}`}>
                              <TableCell sx={{ pl: 6, fontSize: '0.85rem' }}>{sub.id}</TableCell>
                              <TableCell sx={{ fontSize: '0.9rem' }}>{sub.title}</TableCell>
                              <TableCell>{sub.maxScore}</TableCell>
                              <TableCell>
                                {sub.unitScore ? <Chip label={`+${sub.unitScore}/${sub.unit || 'đv'}`} size="small" variant="outlined" /> : '—'}
                              </TableCell>
                              {canReport && (
                                <TableCell>
                                  <TextField
                                    size="small" type="number" value={subQty || ''}
                                    onChange={(e) => updateReport(subKey, 'quantity', e.target.value)}
                                    inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                    sx={{ width: 80 }}
                                  />
                                </TableCell>
                              )}
                              {canReport && <TableCell sx={{ color: '#2563eb' }}>{subCalcScore.toFixed(1)}</TableCell>}
                              {canReport && (
                                <TableCell>
                                  <TextField size="small" fullWidth placeholder="Link..."
                                    value={reportData[subKey]?.evidence || ''}
                                    onChange={(e) => updateReport(subKey, 'evidence', e.target.value)} />
                                </TableCell>
                              )}
                              {(isSubmitted || isCompleted) && <TableCell>{existingSub?.quantity || 0}</TableCell>}
                              {(isSubmitted || isCompleted) && <TableCell sx={{ color: '#2563eb' }}>{existingSub?.score || 0}</TableCell>}
                            </TableRow>
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

        {/* Submit button for self-report */}
        {canReport && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: '#f1f5f9' }}>
            <Typography variant="body1" sx={{ flexGrow: 1, pt: 1 }}>
              <strong>Tổng điểm tự khai: {totalSelfScore.toFixed(1)}</strong> / {maxScore} điểm
            </Typography>
            <Button variant="contained" startIcon={<Send />} onClick={handleSubmitReport} disabled={saving}>
              {saving ? 'Đang nộp...' : 'Nộp bài tự khai'}
            </Button>
          </Box>
        )}

        {isCompleted && (
          <Box sx={{ p: 2, bgcolor: '#f0fdf4' }}>
            <Alert severity="success">
              <strong>Điểm cuối cùng: {okr.totalScore} điểm</strong> — Đã được Trưởng khoa duyệt.
            </Alert>
          </Box>
        )}
      </Collapse>

      {/* Negotiate Dialog */}
      <Dialog open={negotiateDialog} onClose={() => setNegotiateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#1e3a8a' }}>
          <Comment sx={{ mr: 1, verticalAlign: 'middle' }} /> Đề xuất điều chỉnh
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nhập nhận xét cho từng mục tiêu bạn muốn điều chỉnh:
          </Typography>
          {structure.map((obj: any) => (
            <Paper key={obj.id} sx={{ p: 2, mb: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" fontWeight="bold" color="#1e3a8a" sx={{ mb: 1 }}>
                {obj.id}. {obj.title}
                {obj.maxScore > 0 && <Chip label={`Tối đa: ${obj.maxScore} điểm`} size="small" sx={{ ml: 1 }} />}
              </Typography>
              <TextField
                fullWidth multiline rows={2} size="small"
                placeholder={`Nhận xét cho mục ${obj.id}... (để trống nếu không có ý kiến)`}
                value={commentsByObj[obj.id] || ''}
                onChange={(e) => setCommentsByObj(prev => ({ ...prev, [obj.id]: e.target.value }))}
              />
            </Paper>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNegotiateDialog(false)} color="inherit">Hủy</Button>
          <Button variant="contained" onClick={handleNegotiate} startIcon={<Send />}>Gửi đề xuất</Button>
        </DialogActions>
      </Dialog>
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
      const res = await api.get('/okrs/my');
      setOkrs(res.data || []);
    } catch (error) {
      console.error('Error fetching my OKRs', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = okrs.filter(o => o.status === 'PENDING').length;
  const acceptedCount = okrs.filter(o => o.status === 'ACCEPTED').length;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e3a8a" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assignment /> OKR Của Tôi
        </Typography>
        <Typography color="text.secondary">Xem chi tiết OKR được giao, tự khai điểm, và theo dõi trạng thái.</Typography>
      </Box>

      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {pendingCount} OKR đang chờ phản hồi.</strong> Nhấn vào để xem chi tiết và Chấp nhận hoặc Đề xuất điều chỉnh.
        </Alert>
      )}

      {acceptedCount > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {acceptedCount} OKR sẵn sàng tự khai điểm.</strong> Nhấn vào, nhập số lượng và minh chứng, rồi nộp bài.
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
        </Paper>
      ) : okrs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
          Bạn chưa được giao OKR nào. Hãy đợi Trưởng khoa giao OKR cho bạn.
        </Paper>
      ) : (
        okrs.map(okr => <OkrCard key={okr.id} okr={okr} onRefresh={fetchMyOkrs} />)
      )}
    </Container>
  );
}
