// src/pages/AuthCallback/AuthCallback.tsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const isFirstUser = searchParams.get("isFirstUser") === "true";
    const error = searchParams.get("error");

    if (error) {
      let errorMessage = "Authentication failed";
      switch (error) {
        case "domain_not_allowed":
          errorMessage = "Your email domain is not authorized";
          break;
        case "auth_failed":
          errorMessage = "Authentication failed. Please try again.";
          break;
        case "no_code":
          errorMessage = "Authorization code missing";
          break;
      }

      navigate("/login", {
        replace: true,
        state: { error: errorMessage },
      });
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));

        // Store authentication data
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        // Redirect based on first user status
        if (isFirstUser) {
          console.log("🎉 First user! Redirecting to Admin Settings...");
          navigate("/admin/settings", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Failed to parse user data:", err);
        navigate("/login", {
          replace: true,
          state: { error: "Authentication failed. Please try again." },
        });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress size={50} />
      <Typography variant="body1" color="text.secondary">
        Completing sign in...
      </Typography>
    </Box>
  );
}
