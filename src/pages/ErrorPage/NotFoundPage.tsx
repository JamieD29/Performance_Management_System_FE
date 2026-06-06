import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6", // Light gray background matching the dashboard layout
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
          {/* Sad emotion or Domain Error icon */}
          <SentimentVeryDissatisfiedIcon
            sx={{ fontSize: 80, color: "text.secondary", opacity: 0.5 }}
          />

          {/* Large 404 header */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              color: "#1e3a8a", // Deep blue color matching brand identity
              fontSize: { xs: "4rem", md: "6rem" },
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          {/* Error messages */}
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {t("notFound.title")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: "400px", mb: 2 }}
          >
            {t("notFound.description")}
          </Typography>

          {/* Navigation action buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)} // Navigate back to the previous page
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {t("notFound.goBack")}
            </Button>

            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/")} // Navigate back to home/login
              sx={{
                bgcolor: "#1e3a8a", // Brand blue color
                "&:hover": { bgcolor: "#172554" },
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              {t("notFound.goHome")}
            </Button>
          </Box>
        </Paper>

        {/* Small footer copyright label (Optional) */}
        <Typography
          variant="caption"
          display="block"
          align="center"
          sx={{ mt: 4, color: "text.disabled" }}
        >
          © 2026 {t("sidebar.vnuHcmus")} {t("common.systemName")}
        </Typography>
      </Container>
    </Box>
  );
};

export default NotFoundPage;
