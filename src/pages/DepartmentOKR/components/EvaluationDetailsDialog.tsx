import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CheckCircle, Close, Save } from "@mui/icons-material";

interface EvaluationDetailsDialogProps {
  open: boolean;
  reportData: any;
  onClose: () => void;
  onSave: (updatedReport: any) => void;
}

export default function EvaluationDetailsDialog({ open, reportData, onClose, onSave }: EvaluationDetailsDialogProps) {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (reportData) {
      // Clone tasks để tránh mutate props state
      setTasks(JSON.parse(JSON.stringify(reportData.evaluationData || [])));
    }
  }, [reportData]);

  const handleScoreChange = (taskId: string, newScore: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        // Ràng buộc không vượt quá maxScore
        const validScore = newScore > task.maxScore ? task.maxScore : (newScore < 0 ? 0 : newScore);
        return { ...task, principalScore: validScore };
      }
      return task;
    }));
  };

  const handleTickAll = () => {
    setTasks(prev => prev.map(task => ({
      ...task,
      principalScore: task.maxScore
    })));
  };

  const handleCopySelfScore = () => {
    setTasks(prev => prev.map(task => ({
      ...task,
      principalScore: task.selfScore
    })));
  };

  const calculateTotal = (key: 'selfScore' | 'principalScore') => {
    return tasks.reduce((sum, task) => sum + (task[key] || 0), 0);
  };

  const handleSave = () => {
    const updatedReport = {
      ...reportData,
      evaluationData: tasks,
      principalScoreTotal: calculateTotal('principalScore'),
      status: "EVALUATED"
    };
    onSave(updatedReport);
  };

  if (!reportData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#1e293b">
            Phiếu Kết Quả Đánh Giá
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Căn cứ theo Kết quả thực hiện chức trách, nhiệm vụ được giao
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ bgcolor: "#f8fafc", p: 3 }}>
        {/* User Info Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: "#1C4D8D" }}>
            {reportData.user.name[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="#0f172a">
              {reportData.user.name} - {reportData.user.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mã OKR: #{reportData.id.padStart(4, '0')} • Email: {reportData.user.email}
            </Typography>
          </Box>
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Tooltip title="Sử dụng điểm của người tự đánh giá">
              <Button variant="outlined" size="small" onClick={handleCopySelfScore}>
                Đồng ý Cá nhân
              </Button>
            </Tooltip>
            <Tooltip title="Đánh giá tất cả đạt tối đa điểm">
              <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />} onClick={handleTickAll}>
                Tick All (Tối đa)
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Evaluation Table */}
        <Typography variant="subtitle1" fontWeight={600} color="#1e293b" sx={{ mb: 1.5 }}>
          Kết quả hoạt động của đơn vị / nhiệm vụ được giao (Mục II)
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "10%" }}>STT</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "40%" }}>Tiêu chí / Nhiệm vụ</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "25%", color: "#64748b" }}>
                  Cá nhân<br/>đánh giá (Điểm)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "25%", color: "#1C4D8D" }}>
                  Hiệu trưởng<br/>đánh giá (Điểm)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>{task.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {task.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Tối đa: {task.maxScore} điểm
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight={600} color="text.secondary">
                      {task.selfScore}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <TextField 
                      size="small"
                      type="number"
                      variant="outlined"
                      value={task.principalScore}
                      onChange={(e) => handleScoreChange(task.id, parseInt(e.target.value) || 0)}
                      inputProps={{ min: 0, max: task.maxScore, style: { textAlign: 'center', fontWeight: 'bold', color: '#1C4D8D' } }}
                      sx={{ width: "80px", bgcolor: "#fff" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {/* Row Tổng điểm */}
              <TableRow sx={{ bgcolor: "#fffbeb" }}>
                <TableCell colSpan={2} align="center" sx={{ fontWeight: "bold", color: "#b45309", fontSize: "1.05rem" }}>
                  Tổng điểm
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" color="#b45309" fontSize="1.1rem">
                    {calculateTotal('selfScore')}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" color="#1C4D8D" fontSize="1.1rem">
                    {calculateTotal('principalScore')}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Save />} 
          onClick={handleSave}
          sx={{ px: 3 }}
        >
          Lưu Đánh Giá
        </Button>
      </DialogActions>
    </Dialog>
  );
}
