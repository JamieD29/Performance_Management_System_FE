import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  Fade,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { api } from "../../services/api";
import { useProfileValidation } from "../../hooks/useProfileValidation";

import type { DepartmentOption, ProfileFormData } from "./types";
import { FALLBACK_ACADEMIC_RANKS, FALLBACK_DEGREES, FALLBACK_JOB_TITLES } from "./constants";
import { useTranslation } from "react-i18next";
import { useProfileOptions } from "../../hooks/useProfileOptions";
import { PersonalInfoStep } from "./components/PersonalInfoStep";
import { WorkInfoStep } from "./components/WorkInfoStep";
import { ConfirmationDialog } from "./components/ConfirmationDialog";

const steps = ["Thông tin cá nhân", "Thông tin công tác"];

export default function ProfileSetup() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Logout / switch account: clear session, redirect to login, and delete this account's draft
  const handleSwitchAccount = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const draftKey = `profile_setup_draft_${user.email}`;
        localStorage.removeItem(draftKey);
      } catch (e) {
        console.error("Failed to clear draft on switch account", e);
      }
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    staffCode: "",
    fullName: "",
    dob: "",
    email: "",
    joinDate: "",
    departmentId: "",
    academicRank: "",
    degree: "",
    jobTitle: "",
  });

  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // Data & UI state
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");

  // 📌 Single Source of Truth: Fetch enum options from BE
  const { options: profileOptions, loading: loadingOptions } = useProfileOptions();
  const { validateAgeAtJoinDate, validateJoinDateStr } = useProfileValidation();
  const academicRanks = profileOptions.academicRanks.length > 0 ? profileOptions.academicRanks : FALLBACK_ACADEMIC_RANKS;
  const degrees = profileOptions.degrees.length > 0 ? profileOptions.degrees : FALLBACK_DEGREES;
  const jobTitles = profileOptions.jobTitles.length > 0 ? profileOptions.jobTitles : FALLBACK_JOB_TITLES;

  // Fetch departments and set initial user data / load draft on mount
  useEffect(() => {
    // Load initial user data from session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const draftKey = `profile_setup_draft_${user.email}`;
        const savedDraft = localStorage.getItem(draftKey);

        if (savedDraft) {
          const { draftFormData, draftActiveStep } = JSON.parse(savedDraft);
          setFormData(draftFormData);
          if (typeof draftActiveStep === "number") {
            setActiveStep(draftActiveStep);
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            fullName: user.fullName || user.name || prev.fullName,
            email: user.email || prev.email,
          }));
        }
      } catch (e) {
        console.error("Failed to parse user from session or load draft", e);
      }
    }
    setIsDraftLoaded(true);

    (async () => {
      try {
        const res = await api.get("/departments");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setDepartments(data);
      } catch (err) {
        console.error("Failed to load departments:", err);
        setError(t("profileSetup.errors.loadDepts"));
      } finally {
        setLoadingDepts(false);
      }
    })();
  }, []);

  // Automatically save draft form data to localStorage on change
  useEffect(() => {
    if (!isDraftLoaded) return;

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const draftKey = `profile_setup_draft_${user.email}`;
        localStorage.setItem(
          draftKey,
          JSON.stringify({
            draftFormData: formData,
            draftActiveStep: activeStep,
          })
        );
      } catch (e) {
        console.error("Failed to save draft to localStorage", e);
      }
    }
  }, [formData, activeStep, isDraftLoaded]);

  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user changes data
    if (validationError && (field === "dob" || field === "joinDate")) {
      setValidationError("");
    }
  };

  const isStep1Complete =
    formData.staffCode.trim() !== "" &&
    formData.fullName.trim() !== "" &&
    formData.dob !== "" &&
    formData.email.trim() !== "" &&
    formData.joinDate !== "";

  const isStep2Complete =
    formData.departmentId !== "" &&
    formData.academicRank !== "" &&
    formData.degree !== "" &&
    formData.jobTitle !== "";

  const handleNext = () => {
    if (activeStep === 0 && isStep1Complete) {
      // Validate join date and age before moving to step 2
      const joinDateError = validateJoinDateStr(formData.joinDate);
      if (joinDateError) {
        setValidationError(joinDateError);
        return;
      }

      const { joinDateError: ageError, isAgeWarning } = validateAgeAtJoinDate(formData.dob, formData.joinDate);
      if (isAgeWarning) {
        setValidationError(ageError);
        return;
      }

      // Valid — proceed
      setValidationError("");
      setActiveStep((prev) => prev + 1);
    } else if (activeStep === 1 && isStep2Complete) {
      setConfirmOpen(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Labels for display (translated to current language)
  const selectedDeptName =
    departments.find((d) => d.id === formData.departmentId)?.name || "";
  const selectedRankLabel = formData.academicRank
    ? t(`profile.enums.academicRank.${formData.academicRank}`, {
        defaultValue: academicRanks.find((r) => r.value === formData.academicRank)?.label || "",
      })
    : "";
  const selectedDegreeLabel = formData.degree
    ? t(`profile.enums.degree.${formData.degree}`, {
        defaultValue: degrees.find((d) => d.value === formData.degree)?.label || "",
      })
    : "";
  const selectedJobTitleLabel = formData.jobTitle
    ? t(`profile.enums.jobTitle.${formData.jobTitle}`, {
        defaultValue: jobTitles.find((j) => j.value === formData.jobTitle)?.label || formData.jobTitle,
      })
    : "";

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      // PATCH user profile (JWT token identifies user, no userId needed in URL)
      // Send complete formData to API (unsupported fields may be ignored by BE, but send anyway)
      await api.patch("/users/profile", {
        ...formData,
        dateOfBirth: formData.dob,
        profileCompleted: true,
      });

      // Update session user
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.staffCode = formData.staffCode;
        user.jobTitle = formData.jobTitle;
        user.academicRank = formData.academicRank;
        user.degree = formData.degree;
        user.fullName = formData.fullName;
        user.name = formData.fullName; // Update name as it is what the system usually relies on
        user.email = formData.email;
        user.profileCompleted = true;
        user.department = { id: formData.departmentId, name: selectedDeptName };
        localStorage.setItem("user", JSON.stringify(user));

        // Clear draft after successful profile setup
        const draftKey = `profile_setup_draft_${user.email}`;
        localStorage.removeItem(draftKey);
      }

      setConfirmOpen(false);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Profile setup failed:", err);
      setError(
        err?.response?.data?.message ||
          t("profileSetup.errors.submit"),
      );
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #e3f2fd 0%, #e0f2f1 35%, #f3e5f5 70%, #e8eaf6 100%)",
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        boxSizing: "border-box",
        py: 4,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "fixed",
          top: -120,
          right: -120,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(25,118,210,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,137,123,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Fade in timeout={700}>
        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={3} alignItems="center">
            {/* Header */}
            <Fade in timeout={500}>
              <Box sx={{ textAlign: "center", mb: 1 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    p: 2,
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #00897b 100%)",
                    color: "#fff",
                    mb: 2,
                    boxShadow: "0 6px 20px rgba(25, 118, 210, 0.3)",
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 44 }} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#1a237e",
                    mb: 0.5,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t("profileSetup.title")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "#546e7a", maxWidth: 400, mx: "auto" }}
                >
                  {t("profileSetup.subtitle")}
                </Typography>
              </Box>
            </Fade>

            {/* Main Card */}
            <Paper
              elevation={0}
              sx={{
                width: "100%",
                p: { xs: 3, sm: 4 },
                borderRadius: "20px",
                bgcolor: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 8px 40px rgba(0, 0, 0, 0.06)",
                position: "relative",
              }}
            >
              {/* Switch account button inside the card - icon only */}
              <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
                <Tooltip title={t("profileSetup.switchAccountTooltip")} placement="left">
                  <IconButton
                    onClick={handleSwitchAccount}
                    size="small"
                    sx={{
                      color: "#78909c",
                      border: "1px solid rgba(120, 144, 156, 0.2)",
                      borderRadius: "10px",
                      bgcolor: "rgba(255, 255, 255, 0.6)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        color: "#c62828",
                        bgcolor: "rgba(198, 40, 40, 0.05)",
                        borderColor: "rgba(198, 40, 40, 0.2)",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              {/* Stepper */}
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label, idx) => (
                  <Step key={label}>
                    <StepLabel>
                      {idx === 0
                        ? t("profileSetup.steps.personalInfo")
                        : t("profileSetup.steps.workInfo")}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3, borderRadius: "10px" }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              {activeStep === 0 && (
                <PersonalInfoStep
                  formData={formData}
                  onChange={handleFieldChange}
                  validationError={validationError}
                />
              )}
              {activeStep === 1 && (
                <WorkInfoStep
                  formData={formData}
                  onChange={handleFieldChange}
                  departments={departments}
                  loadingDepts={loadingDepts || loadingOptions}
                  academicRanks={academicRanks}
                  degrees={degrees}
                  jobTitles={jobTitles}
                />
              )}

              {/* Navigation Buttons */}
              <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                      py: 1.6,
                      borderRadius: "14px",
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      flex: 1,
                      borderColor: "rgba(25, 118, 210, 0.5)",
                      color: "#1976d2",
                      "&:hover": {
                        borderColor: "#1976d2",
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                  >
                    {t("profileSetup.buttons.back")}
                  </Button>
                )}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNext}
                  disabled={
                    activeStep === 0 ? !isStep1Complete : !isStep2Complete
                  }
                  endIcon={
                    activeStep === 1 ? (
                      <CheckCircleIcon />
                    ) : (
                      <NavigateNextIcon />
                    )
                  }
                  sx={{
                    py: 1.6,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    flex: activeStep === 0 ? "1 1 auto" : 2,
                    background:
                      "linear-gradient(135deg, #1976d2 0%, #00897b 100%)",
                    boxShadow: "0 4px 15px rgba(25, 118, 210, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(25, 118, 210, 0.4)",
                      background:
                        "linear-gradient(135deg, #1565c0 0%, #00796b 100%)",
                    },
                  }}
                >
                  {activeStep === 1
                    ? t("profileSetup.buttons.complete")
                    : t("profileSetup.buttons.continue")}
                </Button>
              </Box>
            </Paper>

            {/* Footer */}
            <Typography
              variant="caption"
              sx={{ color: "#78909c", fontSize: "0.8rem" }}
            >
              © {new Date().getFullYear()} University of Science — VNUHCM • OKR
              & KPI Management
            </Typography>
          </Stack>
        </Container>
      </Fade>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => !submitting && setConfirmOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        formData={formData}
        selectedDeptName={selectedDeptName}
        selectedRankLabel={selectedRankLabel}
        selectedDegreeLabel={selectedDegreeLabel}
        jobTitle={selectedJobTitleLabel}
      />
    </Box>
  );
}
