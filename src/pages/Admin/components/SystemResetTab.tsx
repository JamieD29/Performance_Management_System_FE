import { useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Alert
} from "@mui/material";
import { Warning as WarningIcon, DeleteForever } from "@mui/icons-material";
import { api } from "../../../services/api";

export default function SystemResetTab() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const response = await api.post("/admin/system/reset");
      setSuccessMsg(response.data.message || "Đã khôi phục cài đặt gốc thành công!");
      setOpen(false);
      
      // Tải lại trang sau 2 giây để clear state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Đã xảy ra lỗi khi reset hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" color="error" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon /> Danger Zone
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Khu vực chứa các chức năng nhạy cảm có thể ảnh hưởng lớn đến hệ thống. Hãy cân nhắc kỹ trước khi sử dụng.
        </Typography>

        {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

        <Box sx={{ border: '1px solid #fecdd3', borderRadius: 2, p: 3, bgcolor: '#fff1f2' }}>
          <Typography variant="subtitle1" fontWeight="bold" color="#be123c">
            Khôi phục Cài đặt Gốc (Factory Reset)
          </Typography>
          <Typography variant="body2" color="#9f1239" sx={{ mt: 1, mb: 2 }}>
            Hành động này sẽ <b>XÓA TOÀN BỘ</b> dữ liệu hệ thống bao gồm: Người dùng, OKR, Kỳ đánh giá, Logs... 
            Hệ thống sẽ được đưa về trạng thái trống giống như lúc mới cài đặt (nhưng vẫn giữ lại các Bộ môn mặc định).
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteForever />}
            onClick={() => setOpen(true)}
          >
            Factory Reset
          </Button>
        </Box>
      </Box>

      <Dialog open={open} onClose={() => !loading && setOpen(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          CẢNH BÁO NGUY HIỂM!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#000', fontWeight: 500 }}>
            Bạn đang yêu cầu <b>XÓA SẠCH</b> dữ liệu toàn bộ hệ thống. Hành động này là <b>không thể hoàn tác</b>!
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Bạn có thực sự chắc chắn muốn tiếp tục không?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} disabled={loading} color="inherit">
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleReset} 
            color="error" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "VẪN TIẾP TỤC XÓA"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
