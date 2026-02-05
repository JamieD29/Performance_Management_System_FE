import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6", // Màu nền xám nhạt giống Dashboard của bạn
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Icon cảm xúc buồn hoặc Domain Error */}
          <SentimentVeryDissatisfiedIcon
            sx={{ fontSize: 80, color: "text.secondary", opacity: 0.5 }}
          />

          {/* Tiêu đề 404 Lớn */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: "#1e3a8a", // Màu xanh đậm HCMUS
              fontSize: { xs: "4rem", md: "6rem" },
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          {/* Thông báo lỗi */}
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            Không tìm thấy trang hoặc Tên miền
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: "400px", mb: 2 }}
          >
            Trang bạn đang tìm kiếm không tồn tại, hoặc tên miền tổ chức
            (Domain) đã bị xóa khỏi hệ thống.
          </Typography>

          {/* Các nút điều hướng */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)} // Quay lại trang trước
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Quay lại
            </Button>

            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")} // Về trang chủ/Login
              sx={{
                bgcolor: "#1e3a8a", // Màu xanh HCMUS
                "&:hover": { bgcolor: "#172554" },
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              Về trang chủ
            </Button>
          </Box>
        </Paper>

        {/* Footer nhỏ (Optional) */}
        <Typography
          variant="caption"
          display="block"
          align="center"
          sx={{ mt: 4, color: "text.disabled" }}
        >
          © 2026 VNU-HCMUS Performance Management System
        </Typography>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
