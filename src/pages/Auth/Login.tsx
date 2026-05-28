// src/pages/Login/Login.tsx - FIXED & TESTED
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Container,
  Paper,
  Stack,
  Fade,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { School as SchoolIcon } from "@mui/icons-material";
import { useTranslation, Trans } from "react-i18next";
import { api } from "../../services/api";
import loginBg from "../../assets/images/login-bg2.jpg";

// --- CUSTOM ICONS (Giữ nguyên như cũ) ---
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const MicrosoftLogo = () => (
  <svg width="20" height="20" viewBox="0 0 23 23">
    <path fill="#f35325" d="M0 0h11v11H0z" />
    <path fill="#81bc06" d="M12 0h11v11H12z" />
    <path fill="#05a6f0" d="M0 12h11v11H0z" />
    <path fill="#ffba08" d="M12 12h11v11H12z" />
  </svg>
);

export default function Login() {
  const { t, i18n } = useTranslation();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMsLoading, setIsMsLoading] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State phục vụ việc bypass đăng nhập cho tester và tự động hóa
  const [showMock, setShowMock] = useState(() => {
    // Luôn luôn ẩn nếu chạy ở môi trường Production
    if (import.meta.env.PROD) return false;

    // Mặc định hiện trên localhost để dev/test nhanh chóng
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  });
  const [mockEmail, setMockEmail] = useState("");
  const [mockRole, setMockRole] = useState("USER");
  const [mockPosition, setMockPosition] = useState("");

  // URL Backend
  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  // --- LOGIC BẮT TOKEN & XỬ LÝ LỖI ---
  useEffect(() => {
    // 1. Kiểm tra Token đăng nhập thành công
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user");

    if (accessToken) {
      setIsLoading(true);

      // 🧹 Xóa dữ liệu cũ trước khi lưu tài khoản mới.
      // Quan trọng: ngăn lỗi khi user chọn đổi tài khoản Google khi đang ở profile-setup.
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      localStorage.setItem('authToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      let parsedUser: any = null;
      if (userParam) {
        try {
          parsedUser = JSON.parse(decodeURIComponent(userParam));
          localStorage.setItem("user", JSON.stringify(parsedUser));
        } catch (e) {
          console.error("Parse user error:", e);
        }
      }

      // Kiểm tra profile đã hoàn tất chưa
      const profileCompleted =
        parsedUser?.jobTitle || parsedUser?.profileCompleted;
      const destination = profileCompleted ? "/dashboard" : "/profile-setup";

      window.history.replaceState({}, document.title, destination);
      navigate(destination, { replace: true });
      return;
    }

    // 2. 🔥 XỬ LÝ LỖI TỪ BACKEND TRẢ VỀ
    const errorParam = searchParams.get("error");

    if (errorParam) {
      // ✅ LOGIC MỚI: Nếu lỗi là "domain_not_allowed" -> Chuyển ngay sang trang 404
      if (errorParam === "domain_not_allowed") {
        // replace: true để user không back lại được trang login có lỗi này
        navigate("/404", { replace: true });
        return;
      }

      // Các lỗi khác (huỷ login, lỗi server...) thì hiện thông báo đỏ tại trang Login
      let errorMessage = t("login.errorAuthFailed");
      switch (errorParam) {
        case "auth_failed":
          errorMessage = t("login.errorAuthFailed");
          break;
        case "access_denied":
          errorMessage = t("login.errorAccessDenied");
          break;
        default:
          errorMessage = t("login.errorDefault", { error: errorParam });
      }

      setError(errorMessage);
      setIsLoading(false);
      setIsMsLoading(false);

      // Xóa query param lỗi trên URL để nhìn cho sạch
      window.history.replaceState({}, document.title, "/login");
    }

    // 3. Chỉ fetch whitelist khi không có token và chưa có lỗi
    if (!accessToken && !errorParam) {
      fetchAllowedDomains();
    }
  }, [searchParams, navigate]);

  const fetchAllowedDomains = async () => {
    try {
      // Gọi API whitelist (Nhớ là Backend đã mở CORS main.ts chưa nhé)
      const response = await api.get("/auth/allowed-domains");
      setAllowedDomains(response.data.domains || ["itec.hcmus.edu.vn"]);
    } catch (err) {
      console.error("Allowed domains fetch error:", err);
      // Fallback nếu lỗi mạng
      setAllowedDomains(["itec.hcmus.edu.vn"]);
    }
  };

  // --- HÀM LOGIN: CHUYỂN HƯỚNG SANG BACKEND ---
  const handleGoogleSignIn = () => {
    setError("");
    setIsLoading(true);
    // Chuyển hướng trình duyệt sang Backend để bắt đầu quy trình OAuth
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const handleMicrosoftSignIn = () => {
    setError("");
    setIsMsLoading(true);
    window.location.href = `${BACKEND_URL}/auth/microsoft`;
  };

  const handleMockLogin = async () => {
    if (!mockEmail) {
      setError("Vui lòng nhập Email để thực hiện Mock Login.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/bypass", {
        email: mockEmail.trim(),
        role: mockRole,
        name: mockEmail.split("@")[0],
        managementPositionSlug: mockPosition || undefined,
      });

      const { access_token, user } = res.data;
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      // Kiểm tra xem profile đã hoàn tất chưa
      const profileCompleted = user.jobTitle || user.profileCompleted;
      const destination = profileCompleted ? "/dashboard" : "/profile-setup";

      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error("Mock Login Error:", err);
      setError(
        "Bypass Login thất bại: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          zIndex: 0,
        },
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        overflow: "hidden",
      }}
    >
      <Fade in={true} timeout={800}>
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={3} alignItems="center">
            {/* LOGO AREA */}
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "inline-flex",
                  p: 1.5,
                  borderRadius: "16px",
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                  color: "#1976d2",
                  mb: 2,
                }}
              >
                <SchoolIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, color: "#1a1a1a", mb: 0.5 }}
              >
                {t("common.systemName")}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#080808", fontWeight: 500, fontSize: "20px" }}
              >
                {t("sidebar.vnuHcmus")}
              </Typography>
            </Box>

            {/* LOGIN CARD */}
            <Paper
              elevation={3}
              sx={{
                position: "relative",
                width: "100%",
                p: { xs: 3, sm: 4 },
                borderRadius: "16px",
                bgcolor: "#ffffff",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
                <Button 
                  onClick={() => i18n.changeLanguage(i18n.language === 'vi' ? 'en' : 'vi')}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    borderRadius: "20px", 
                    textTransform: "none", 
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(4px)",
                    fontWeight: "bold",
                    color: "#1976d2",
                    borderColor: "#1976d2",
                    minWidth: "auto",
                    px: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  {i18n.language === 'en' ? (
                    <>
                      <img src="https://flagcdn.com/w20/us.png" width="20" alt="English" style={{ borderRadius: '2px' }} />
                      EN
                    </>
                  ) : (
                    <>
                      <img src="https://flagcdn.com/w20/vn.png" width="20" alt="Vietnamese" style={{ borderRadius: '2px' }} />
                      VN
                    </>
                  )}
                </Button>
              </Box>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  textAlign: "center",
                  mb: 1,
                  color: "#1a1a1a",
                }}
              >
                {t("login.title")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#666", textAlign: "center", mb: 3 }}
              >
                {t("login.subtitle")}
              </Typography>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
                  {error}
                </Alert>
              )}

              <Stack spacing={2}>
                {/* GOOGLE BUTTON */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isMsLoading}
                  startIcon={
                    isLoading ? <CircularProgress size={20} /> : <GoogleLogo />
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: "10px",
                    borderColor: "#d1d5db",
                    color: "#374151",
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    bgcolor: "#fff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      bgcolor: "#f9fafb",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  {isLoading ? t("login.connecting") : t("login.signInGoogle")}
                </Button>

                <Divider sx={{ color: "#9ca3af", fontSize: "0.85rem", my: 1 }}>
                  {t("login.or")}
                </Divider>

                {/* MICROSOFT BUTTON */}
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleMicrosoftSignIn}
                  disabled={isLoading || isMsLoading}
                  startIcon={
                    isMsLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <MicrosoftLogo />
                    )
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: "10px",
                    borderColor: "#d1d5db",
                    color: "#374151",
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    bgcolor: "#fff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      bgcolor: "#f9fafb",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                >
                  {isMsLoading ? t("login.connecting") : t("login.signInMicrosoft")}
                </Button>
              </Stack>

              {/* DOMAIN INFO BOX */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: "#f0f9ff",
                  borderRadius: "10px",
                  border: "1px solid #e0f2fe",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#0369a1",
                    fontWeight: 600,
                    mb: 0.5,
                    textAlign: "center",
                  }}
                >
                  🔒 {t("login.accessRequirement")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    display: "block",
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  {allowedDomains.length > 0 ? (
                    <Trans 
                      i18nKey="login.authorizedDomains" 
                      values={{ domains: allowedDomains.map((d: any) => `@${d.domain || d.name || d}`).join(", ") }}
                      components={{ 1: <Typography component="span" sx={{ color: "#d32f2f", fontWeight: "bold" }} /> }}
                    />
                  ) : (
                    t("login.restrictedMessage")
                  )}
                </Typography>
              </Box>

              {showMock && (
                <Box sx={{ mt: 3, p: 2.5, border: "1px dashed #3b82f6", borderRadius: "12px", bgcolor: "#f8fafc" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1e3a8a", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                    🧪 Tester Bypass / Mock Login
                  </Typography>
                  <Stack spacing={1.5}>
                    <TextField
                      id="mock-email-input"
                      size="small"
                      label="Mock Email"
                      placeholder="VD: dean@hcmus.edu.vn"
                      value={mockEmail}
                      onChange={(e) => setMockEmail(e.target.value)}
                      fullWidth
                    />
                    <FormControl size="small" fullWidth>
                      <InputLabel id="mock-role-label">Mock Role</InputLabel>
                      <Select
                        labelId="mock-role-label"
                        id="mock-role-select"
                        value={mockRole}
                        label="Mock Role"
                        onChange={(e) => setMockRole(e.target.value)}
                      >
                        <MenuItem value="USER">User (Giảng viên / Nhân sự)</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="mock-position-label">Mock Chức vụ quản lý</InputLabel>
                      <Select
                        labelId="mock-position-label"
                        id="mock-position-select"
                        value={mockPosition}
                        label="Mock Chức vụ quản lý"
                        onChange={(e) => setMockPosition(e.target.value)}
                      >
                        <MenuItem value="">Không có (Nhân sự thường)</MenuItem>
                        <MenuItem value="DEAN">Trưởng khoa (DEAN)</MenuItem>
                        <MenuItem value="VICE_DEAN">Phó khoa (VICE_DEAN)</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      id="mock-login-button"
                      variant="contained"
                      color="info"
                      onClick={handleMockLogin}
                      disabled={isLoading || isMsLoading}
                      fullWidth
                      sx={{ textTransform: "none", fontWeight: "bold", borderRadius: "8px" }}
                    >
                      Đăng nhập Tester
                    </Button>
                  </Stack>
                </Box>
              )}

              {!import.meta.env.PROD && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    onClick={() => setShowMock(!showMock)}
                  >
                    {showMock ? "Ẩn công cụ Tester" : "Hiện công cụ Tester (Bypass Login)"}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* FOOTER */}
            <Typography
              variant="caption"
              sx={{ color: "#070707", fontSize: "20px" }}
            >
              © {new Date().getFullYear()} University of Science - VNUHCM
            </Typography>
          </Stack>
        </Container>
      </Fade>
    </Box>
  );
}
