import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");

  useEffect(() => {
    fetchMyOkrs();
  }, []);

  const fetchMyOkrs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/okrs/my");
      const data = res.data || [];
      setOkrs(data);

      // Auto select the newest cycle if not yet selected
      if (data.length > 0) {
        const cycles: any[] = Array.from(
          new Map<string, any>(
            data
              .map((okr: any) => okr.cycle)
              .filter(Boolean)
              .map((c: any) => [c.id, c])
          ).values()
        );
        const sortedCycles = [...cycles].sort((a: any, b: any) => {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateB - dateA;
        });
        
        setSelectedCycleId((prev) => {
          if (prev) return prev;
          return sortedCycles[0]?.id || "";
        });
      }
    } catch (error) {
      console.error("Error fetching my OKRs", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique cycles
  const cycles: any[] = Array.from(
    new Map<string, any>(
      okrs
        .map((okr) => okr.cycle)
        .filter(Boolean)
        .map((c) => [c.id, c])
    ).values()
  );

  const sortedCycles = [...cycles].sort((a: any, b: any) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });

  const filteredOkrs = okrs.filter((okr) => {
    if (!selectedCycleId) return true;
    return okr.cycle?.id === selectedCycleId;
  });

  const selectedCycle = sortedCycles.find((c) => c.id === selectedCycleId);
  const selectedCycleDeadline = filteredOkrs.find((o) => o.cycle?.id === selectedCycleId && o.deadline)?.deadline;

  const pendingCount = filteredOkrs.filter((o) => o.status === "PENDING").length;
  const acceptedCount = filteredOkrs.filter((o) => o.status === "ACCEPTED").length;

  // Đàm phán hoàn tất nếu tất cả OKR trong kỳ đã được duyệt (không còn PENDING/NEGOTIATING)
  const isNegotiationComplete =
    filteredOkrs.length > 0 &&
    filteredOkrs.every((o) =>
      o.status === "ACCEPTED" || o.status === "SUBMITTED" || o.status === "COMPLETED"
    );

  const acceptedOkrDate = filteredOkrs
    .map((o) => o.acceptedAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
        <Box>
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

        {/* Cycle Selector */}
        {!loading && sortedCycles.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel id="select-cycle-label">Chọn Kỳ đánh giá</InputLabel>
            <Select
              labelId="select-cycle-label"
              value={selectedCycleId}
              label="Chọn Kỳ đánh giá"
              onChange={(e) => setSelectedCycleId(e.target.value as string)}
            >
              {sortedCycles.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} {c.status === "OPEN" ? "(Đang mở)" : "(Đã đóng)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Cycle Summary Info Panel */}
      {!loading && selectedCycle && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="#1e3a8a">
                Kỳ đánh giá: {selectedCycle.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Thời gian: {selectedCycle.startDate ? new Date(selectedCycle.startDate).toLocaleDateString("vi-VN") : "N/A"} 
                {" → "} 
                {selectedCycle.endDate ? new Date(selectedCycle.endDate).toLocaleDateString("vi-VN") : "N/A"}
              </Typography>
              {filteredOkrs.length > 0 && filteredOkrs[0]?.createdAt && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  📅 Ngày được giao OKR:{" "}
                  <strong>
                    {new Date(
                      filteredOkrs
                        .map((o) => o.createdAt)
                        .filter(Boolean)
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
                    ).toLocaleDateString("vi-VN")}
                  </strong>
                </Typography>
              )}
            </Box>
            
            {selectedCycleDeadline && (
              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                {isNegotiationComplete ? (
                  <>
                    <Typography variant="caption" fontWeight="bold" color="#15803d" display="block">
                      ✅ Hoàn tất đàm phán
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Đã chốt OKR ngày {acceptedOkrDate ? new Date(acceptedOkrDate).toLocaleDateString("vi-VN") : new Date(selectedCycleDeadline).toLocaleDateString("vi-VN")}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="caption" fontWeight="bold" color="#b45309" display="block">
                      ⏳ Hạn chót đàm phán & chốt OKR:
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="extrabold" color="#b45309">
                      {new Date(selectedCycleDeadline).toLocaleDateString("vi-VN")}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {pendingCount} OKR đang chờ phản hồi trong kỳ này.</strong> Nhấn vào
          để xem chi tiết và Chấp nhận hoặc Đề xuất điều chỉnh.
        </Alert>
      )}

      {acceptedCount > 0 && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          <strong>Bạn có {acceptedCount} OKR sẵn sàng tự khai điểm trong kỳ này.</strong>{" "}
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
      ) : filteredOkrs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
          Không tìm thấy OKR nào trong kỳ đánh giá được chọn.
        </Paper>
      ) : (
        filteredOkrs.map((okr) => (
          <OkrCard key={okr.id} okr={okr} onRefresh={fetchMyOkrs} />
        ))
      )}
    </Container>
  );
}
