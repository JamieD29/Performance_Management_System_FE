import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { performanceService } from "../../../services/performanceService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { Add, Delete, Flag } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface CreateOkrDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function CreateOkrDialog({
  open,
  onClose,
  onSave,
}: CreateOkrDialogProps) {
  const { t, i18n } = useTranslation();

  // 1. Form data state
  const [title, setTitle] = useState("");
  const [cycleId, setCycleId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [keyResults, setKeyResults] = useState([
    { id: Date.now().toString(), title: "", target: 0, unit: "" },
  ]);

  // 2. Dynamic data state from Backend (real data)
  const [departments, setDepartments] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);

  // 3. Load data each time the form is opened
  useEffect(() => {
    if (open) {
      loadRealData();
    }
  }, [open]);

  const loadRealData = async () => {
    try {
      // Fetch cycles from API
      const cycleData = await performanceService.getCycles();
      setCycles(cycleData);
      if (cycleData.length > 0) {
        setCycleId(cycleData[0].id); // Auto-select the first cycle
      }

      // Fetch department list from API
      const deptRes = await api.get("/departments");
      // Handle depending on API response format (usually .data or .data.data)
      const deptList = deptRes.data?.data || deptRes.data || [];
      setDepartments(deptList);
      if (deptList.length > 0) {
        setDepartmentId(deptList[0].id); // Auto-select the first department
      }
    } catch (error) {
      console.error(t("departmentOkr.createDialog.errorLoad"), error);
    }
  };

  // UI handler functions
  const handleAddKR = () =>
    setKeyResults([
      ...keyResults,
      { id: Date.now().toString(), title: "", target: 0, unit: "" },
    ]);
  const handleRemoveKR = (id: string) =>
    setKeyResults(keyResults.filter((kr) => kr.id !== id));
  const handleKRChange = (id: string, field: string, value: any) => {
    setKeyResults(
      keyResults.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr)),
    );
  };

  // Submit button handler
  const handleSubmit = () => {
    const payload = {
      title,
      cycleId,
      departmentId,
      type: "DEPARTMENT",

      // 👇 Filter out empty rows, then strip the temporary ID — only send the content fields
      keyResults: keyResults
        .filter((kr) => kr.title.trim() !== "")
        .map((kr) => ({
          title: kr.title,
          target: kr.target,
          unit: kr.unit,
          // Must NOT include the "id" field here!
        })),
    };

    onSave(payload);

    // Reset form after submission
    setTitle("");
    setKeyResults([
      { id: Date.now().toString(), title: "", target: 0, unit: "" },
    ]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#1e3a8a",
          fontWeight: "bold",
        }}
      >
        <Flag /> {t("departmentOkr.createDialog.title")}
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        {/* --- SECTION 1: OBJECTIVE INFO (placed outside the KR loop) --- */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              fullWidth
              label={t("departmentOkr.createDialog.objectiveLabel")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t("departmentOkr.createDialog.assignDeptLabel")}</InputLabel>
              <Select
                value={departmentId}
                label={t("departmentOkr.createDialog.assignDeptLabel")}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                {/* 🔄 Loop real department data from DB */}
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t("departmentOkr.createDialog.semesterLabel")}</InputLabel>
              <Select
                value={cycleId}
                label={t("departmentOkr.createDialog.semesterLabel")}
                onChange={(e) => setCycleId(e.target.value)}
              >
                {/* 🔄 Loop real cycle data from DB */}
                {cycles.map((cycle) => {
                  const start = cycle.startDate
                    ? new Date(cycle.startDate).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")
                    : "N/A";
                  const end = cycle.endDate
                    ? new Date(cycle.endDate).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")
                    : "N/A";
                  return (
                    <MenuItem key={cycle.id} value={cycle.id}>
                      {cycle.name} ({start} → {end})
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* --- SECTION 2: KEY RESULTS LIST --- */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.secondary"
          >
            {t("departmentOkr.createDialog.krListTitle")}
          </Typography>
          <Button
            startIcon={<Add />}
            size="small"
            variant="outlined"
            onClick={handleAddKR}
          >
            {t("departmentOkr.createDialog.addKrBtn")}
          </Button>
        </Box>

        <Box
          sx={{
            bgcolor: "#f8fafc",
            p: 2,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
          }}
        >
          {keyResults.map((kr, index) => (
            <Grid
              container
              spacing={2}
              sx={{ mb: 2, alignItems: "center" }}
              key={kr.id}
            >
              <Grid size={{ xs: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.secondary"
                  align="center"
                >
                  KR {index + 1}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography component="div" sx={{ display: "none" }} />
                <TextField
                  fullWidth
                  size="small"
                  label={t("departmentOkr.createDialog.krContentLabel")}
                  value={kr.title}
                  onChange={(e) =>
                    handleKRChange(kr.id, "title", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={t("departmentOkr.createDialog.krTargetLabel")}
                  value={kr.target}
                  onChange={(e) =>
                    handleKRChange(kr.id, "target", Number(e.target.value))
                  }
                />
              </Grid>
              <Grid size={{ xs: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={t("departmentOkr.createDialog.krUnitLabel")}
                  value={kr.unit}
                  onChange={(e) =>
                    handleKRChange(kr.id, "unit", e.target.value)
                  }
                />
              </Grid>
              <Grid size={{ xs: 1 }}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveKR(kr.id)}
                  disabled={keyResults.length === 1}
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} color="inherit">
          {t("departmentOkr.createDialog.cancelBtn")}
        </Button>
        {/* Save button is disabled if department, cycle, or title is not selected */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title || !departmentId || !cycleId}
        >
          {t("departmentOkr.createDialog.saveBtn")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
