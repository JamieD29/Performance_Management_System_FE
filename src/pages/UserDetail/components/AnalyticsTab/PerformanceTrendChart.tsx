import { Box, Paper, Typography } from "@mui/material";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp } from "@mui/icons-material";

interface PerformanceTrendChartProps {
  // Vì hiện tại API chỉ trả về data của 1 kỳ (kỳ đang chọn), 
  // biểu đồ này có thể được phát triển thêm ở phase sau khi có API lấy lịch sử các kỳ.
  // Tạm thời hiển thị dummy data hoặc thông báo.
  data?: any[]; 
}

export default function PerformanceTrendChart({ data = [] }: PerformanceTrendChartProps) {
  // Dummy data để demo giao diện
  const mockData = [
    { name: "Học kỳ 1 (24-25)", score: 75, max: 100 },
    { name: "Học kỳ 2 (24-25)", score: 82, max: 100 },
    { name: "Học kỳ 1 (25-26)", score: 88, max: 100 },
    { name: "Học kỳ 2 (25-26)", score: 95, max: 100 },
  ];

  const chartData = data.length > 0 ? data : mockData;

  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
        <TrendingUp sx={{ color: "#3b82f6" }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: "#1e293b" }}>
          Xu hướng đánh giá
        </Typography>
      </Box>

      <Box sx={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
            />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            <Bar dataKey="max" name="Điểm tối đa" fill="#f1f5f9" radius={[4, 4, 0, 0]} barSize={40} />
            <Line type="monotone" dataKey="score" name="Điểm đạt được" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2, fontStyle: "italic" }}>
        * Dữ liệu biểu đồ đang ở chế độ demo. Sẽ tích hợp API lấy lịch sử các kỳ trong tương lai.
      </Typography>
    </Paper>
  );
}
