import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { X, CheckCircle, XCircle, ExternalLink, Save } from 'lucide-react';
import { performanceService } from '../../../services/performanceService';

interface ReviewDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  cycleId: string;
  onUpdateSuccess: () => void; // Hàm callback để reload lại bảng bên ngoài
}

const ReviewDetailModal = ({
  open,
  onClose,
  userId,
  userName,
  cycleId,
  onUpdateSuccess,
}: ReviewDetailModalProps) => {
  const [kpiList, setKpiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State lưu thay đổi tạm thời (trước khi bấm Save)
  // Key là kpiId, Value là { score, comment }
  const [edits, setEdits] = useState<
    Record<string, { score: number; comment: string }>
  >({});

  // 1. Load dữ liệu khi mở Modal
  useEffect(() => {
    if (open && userId && cycleId) {
      loadUserKpis();
    }
  }, [open, userId, cycleId]);

  const loadUserKpis = async () => {
    setLoading(true);
    try {
      const data = await performanceService.getUserKpis(userId, cycleId);
      setKpiList(data);
      // Init state edits bằng giá trị hiện tại
      const initialEdits: any = {};
      data.forEach((item: any) => {
        initialEdits[item.id] = {
          score: item.managerScore || item.selfScore, // Mặc định lấy điểm tự chấm nếu chưa duyệt
          comment: item.managerComment || '',
        };
      });
      setEdits(initialEdits);
    } catch (error) {
      console.error('Lỗi tải chi tiết KPI:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý nhập liệu
  const handleEditChange = (
    id: string,
    field: 'score' | 'comment',
    value: any,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // 3. Hành động Duyệt (Approve) hoặc Từ chối (Reject)
  const handleReviewAction = async (
    kpiId: string,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    const editData = edits[kpiId];
    if (!editData) return;

    try {
      await performanceService.reviewKpi({
        id: kpiId,
        managerScore: Number(editData.score),
        managerComment: editData.comment,
        status: status,
      });

      // Cập nhật lại UI cục bộ cho mượt (hoặc load lại API)
      setKpiList((prev) =>
        prev.map((item) =>
          item.id === kpiId
            ? {
                ...item,
                status,
                managerScore: editData.score,
                managerComment: editData.comment,
              }
            : item,
        ),
      );

      onUpdateSuccess(); // Báo ra ngoài để cập nhật tổng điểm
    } catch (error) {
      alert('Lỗi khi cập nhật!');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle className="flex justify-between items-center border-b">
        <Box>
          <Typography variant="h6" className="font-bold">
            Đánh giá nhân sự: {userName}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            Xem chi tiết và duyệt kết quả
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <X />
        </IconButton>
      </DialogTitle>

      <DialogContent className="bg-gray-50 p-0">
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="30%">
                  <strong>Tiêu chí</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>SL</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Điểm tự chấm</strong>
                </TableCell>
                <TableCell align="center" width="10%">
                  <strong>Điểm Duyệt</strong>
                </TableCell>
                <TableCell width="25%">
                  <strong>Nhận xét của Sếp</strong>
                </TableCell>
                <TableCell align="center" width="15%">
                  <strong>Thao tác</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {kpiList.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  className={item.status === 'APPROVED' ? 'bg-green-50' : ''}
                >
                  {/* Cột 1: Nội dung & Minh chứng */}
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {item.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-gray-500 block"
                    >
                      {item.category?.name}
                    </Typography>
                    {item.evidenceUrl && (
                      <a
                        href={item.evidenceUrl}
                        target="_blank"
                        className="flex items-center gap-1 text-blue-600 text-xs mt-1 hover:underline"
                      >
                        <ExternalLink size={12} /> Xem minh chứng
                      </a>
                    )}
                  </TableCell>

                  {/* Cột 2: Số lượng */}
                  <TableCell align="center">
                    {item.quantity} {item.template?.unit}
                  </TableCell>

                  {/* Cột 3: Điểm tự chấm */}
                  <TableCell
                    align="center"
                    className="text-gray-600 font-medium"
                  >
                    {item.selfScore}
                  </TableCell>

                  {/* Cột 4: INPUT ĐIỂM DUYỆT */}
                  <TableCell align="center">
                    <TextField
                      type="number"
                      size="small"
                      value={edits[item.id]?.score || 0}
                      onChange={(e) =>
                        handleEditChange(item.id, 'score', e.target.value)
                      }
                      inputProps={{
                        style: {
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: '#166534',
                        },
                      }}
                      disabled={item.status === 'APPROVED'} // Đã duyệt thì khóa lại (hoặc mở tùy logic)
                    />
                  </TableCell>

                  {/* Cột 5: INPUT NHẬN XÉT */}
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Nhập lời phê..."
                      value={edits[item.id]?.comment || ''}
                      onChange={(e) =>
                        handleEditChange(item.id, 'comment', e.target.value)
                      }
                      disabled={item.status === 'APPROVED'}
                    />
                  </TableCell>

                  {/* Cột 6: BUTTON ACTION */}
                  <TableCell align="center">
                    {item.status === 'APPROVED' ? (
                      <Chip
                        icon={<CheckCircle size={14} />}
                        label="Đã Duyệt"
                        color="success"
                        size="small"
                      />
                    ) : item.status === 'REJECTED' ? (
                      <Chip
                        icon={<XCircle size={14} />}
                        label="Đã Từ chối"
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Box className="flex gap-2 justify-center">
                        <Tooltip title="Duyệt / Đồng ý">
                          <IconButton
                            color="success"
                            onClick={() =>
                              handleReviewAction(item.id, 'APPROVED')
                            }
                            className="bg-green-100 hover:bg-green-200"
                          >
                            <CheckCircle size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Từ chối / Yêu cầu làm lại">
                          <IconButton
                            color="error"
                            onClick={() =>
                              handleReviewAction(item.id, 'REJECTED')
                            }
                            className="bg-red-100 hover:bg-red-200"
                          >
                            <XCircle size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions className="p-4 border-t">
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDetailModal;
