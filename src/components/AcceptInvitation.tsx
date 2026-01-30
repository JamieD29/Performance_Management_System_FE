import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CheckCircle, ErrorOutline, Email } from "@mui/icons-material";
import { GoogleLogin } from "@react-oauth/google";

interface InvitationData {
  email: string;
  role: string;
}

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/invitations/verify/${token}`,
      );

      if (response.ok) {
        const data = await response.json();
        setInvitation(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Invalid invitation");
      }
    } catch (err) {
      setError("Failed to verify invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsAccepting(true);

    try {
      // Decode JWT to get user info
      const decoded = JSON.parse(
        atob(credentialResponse.credential.split(".")[1]),
      );

      // Check if email matches invitation
      if (decoded.email !== invitation?.email) {
        setError(
          `Please sign in with ${invitation?.email} to accept this invitation`,
        );
        setIsAccepting(false);
        return;
      }

      // Accept invitation
      const response = await fetch(
        "http://localhost:3000/api/invitations/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();

        // Save auth token and user info
        sessionStorage.setItem("authToken", data.access_token);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        // Redirect to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to accept invitation");
      }
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("Failed to accept invitation");
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Verifying invitation...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.50",
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 500,
            width: "100%",
            p: 4,
            textAlign: "center",
          }}
        >
          <ErrorOutline
            sx={{
              fontSize: 80,
              color: "error.main",
              mb: 2,
            }}
          />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Invalid Invitation
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            fullWidth
          >
            Go to Login
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          p: 4,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <CheckCircle
            sx={{
              fontSize: 80,
              color: "success.main",
              mb: 2,
            }}
          />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            You're Invited!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Accept your invitation to join OKR & KPI Management
          </Typography>
        </Box>

        <Alert severity="info" icon={<Email />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            Invitation for: {invitation?.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Role: {invitation?.role}
          </Typography>
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in with your invited email address to accept this invitation and
          create your account.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          {isAccepting ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Accepting invitation...
              </Typography>
            </Box>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in failed")}
              useOneTap={false}
              text="signin_with"
              shape="rectangular"
              size="large"
            />
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center" }}
        >
          Make sure to sign in with <strong>{invitation?.email}</strong>
        </Typography>
      </Card>
    </Box>
  );
}
