import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import {
  Assignment,
} from "@mui/icons-material";
import { api } from "../../services/api";
import OkrCard from "./components/OkrCard";

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
      const res = await api.get("/okrs/my");
      setOkrs(res.data || []);
    } catch (error) {
      console.error("Error fetching my OKRs", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = okrs.filter((o) => o.status === "PENDING").length;
  const acceptedCount = okrs.filter((o) => o.status === "ACCEPTED").length;

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          color="#1e3a8a"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Assignment /> OKR Của Tôi
        </Typography>
        <Typography color="text.secondary">
          Xem chi tiết OKR được giao, tự khai điểm, và theo dõi trạng thái.
        </Typography>
      </Box>

      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {pendingCount} OKR đang chờ phản hồi.</strong> Nhấn vào
          để xem chi tiết và Chấp nhận hoặc Đề xuất điều chỉnh.
        </Alert>
      )}

      {acceptedCount > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {acceptedCount} OKR sẵn sàng tự khai điểm.</strong>{" "}
          Nhấn vào, nhập số lượng và minh chứng, rồi nộp bài.
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Đang tải dữ liệu...</Typography>
        </Paper>
      ) : okrs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
          Bạn chưa được giao OKR nào. Hãy đợi Trưởng khoa giao OKR cho bạn.
        </Paper>
      ) : (
        okrs.map((okr) => (
          <OkrCard key={okr.id} okr={okr} onRefresh={fetchMyOkrs} />
        ))
      )}
    </Container>
  );
}
