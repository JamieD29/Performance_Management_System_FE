import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Check, Close, Visibility } from '@mui/icons-material';
import { api } from '../../../services/api';

export default function DeanApprovalTab() {
  const [pendingOkrs, setPendingOkrs] = useState<any[]>([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedOkr, setSelectedOkr] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectDialog, setRejectDialog] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/okrs/pending-approval');
      setPendingOkrs(res.data || []);
    } catch (error) {
      console.error('Error fetching pending approvals', error);
    }
  };

  const handleApprove = async (okrId: string) => {
    if (!confirm('Bạn xác nhận duyệt đề xuất điều chỉnh này?')) return;
    try {
      await api.put(`/okrs/${okrId}/dean-approve`);
      alert('✅ Đã duyệt đề xuất!');
      fetchPending();
    } catch (error) {
      console.error('Error approving', error);
      alert('Có lỗi xảy ra.');
    }
  };

  const openReject = (okr: any) => {
    setSelectedOkr(okr);
    setRejectReason('');
    setRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedOkr) return;
    try {
      await api.put(`/okrs/${selectedOkr.id}/dean-reject`, { reason: rejectReason });
      alert('Đã từ chối đề xuất.');
      setRejectDialog(false);
      fetchPending();
    } catch (error) {
      console.error('Error rejecting', error);
      alert('Có lỗi xảy ra.');
    }
  };

  const viewDetails = (okr: any) => {
    setSelectedOkr(okr);
    setViewDialog(true);
  };

  // Parse comments from proposedChanges
  const renderComments = (proposedChanges: any) => {
    if (!proposedChanges?.comments) return <Typography variant="body2" color="text.secondary">Không có ghi chú.</Typography>;
    const comments = proposedChanges.comments;
    const entries = Object.entries(comments).filter(([_, v]) => (v as string).trim() !== '');
    if (entries.length === 0) return <Typography variant="body2" color="text.secondary">Không có ghi chú chi tiết.</Typography>;
    return (
      <Box>
        {entries.map(([objId, comment]) => (
          <Paper key={objId} sx={{ p: 1.5, mb: 1, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">Mục {objId}:</Typography>
            <Typography variant="body2">{comment as string}</Typography>
          </Paper>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" color="text.secondary">Đề xuất điều chỉnh OKR chờ duyệt</Typography>
        <Chip label={pendingOkrs.length} color="warning" size="small" />
      </Box>

      {pendingOkrs.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Không có đề xuất nào đang chờ duyệt.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nhân sự</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Bộ môn</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Mục tiêu</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Nội dung đề xuất</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingOkrs.map(okr => (
                <TableRow key={okr.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={okr.user?.avatarUrl} sx={{ width: 28, height: 28 }}>
                        {(okr.user?.name || okr.user?.email)?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>{okr.user?.name || '(Chưa đặt tên)'}</Typography>
                        <Typography variant="caption" color="text.secondary">{okr.user?.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{okr.user?.department?.name || '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{okr.objective}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {okr.proposedChanges?.comments
                        ? `${Object.values(okr.proposedChanges.comments).filter((v: any) => v.trim()).length} nhận xét`
                        : 'Xem chi tiết...'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<Visibility />} onClick={() => viewDetails(okr)} sx={{ mr: 1 }}>
                      Xem
                    </Button>
                    <Button size="small" variant="contained" color="success" startIcon={<Check />} onClick={() => handleApprove(okr.id)} sx={{ mr: 1 }}>
                      Duyệt
                    </Button>
                    <Button size="small" variant="outlined" color="error" startIcon={<Close />} onClick={() => openReject(okr)}>
                      Từ chối
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Details Dialog - shows per-objective comments */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Chi tiết đề xuất điều chỉnh</DialogTitle>
        <Divider />
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Nhân sự:</Typography>
          <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
            {selectedOkr?.user?.name || selectedOkr?.user?.email || '—'}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary">Mục tiêu OKR:</Typography>
          <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>{selectedOkr?.objective}</Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Nhận xét theo từng mục tiêu:</Typography>
          {renderComments(selectedOkr?.proposedChanges)}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDialog(false)}>Đóng</Button>
          <Button variant="contained" color="success" startIcon={<Check />} onClick={() => { setViewDialog(false); handleApprove(selectedOkr?.id); }}>
            Duyệt
          </Button>
          <Button variant="outlined" color="error" startIcon={<Close />} onClick={() => { setViewDialog(false); openReject(selectedOkr); }}>
            Từ chối
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>Từ chối đề xuất</DialogTitle>
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
          <Button onClick={() => setRejectDialog(false)} color="inherit">Hủy</Button>
          <Button variant="contained" color="error" onClick={handleReject}>
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
