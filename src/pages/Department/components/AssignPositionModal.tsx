import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/material";
import { Badge } from "@mui/icons-material";
import { api } from "../../../services/api";
import { confirmAction } from "../../../utils/swal";
import { useTranslation } from "react-i18next";

interface ManagementPosition {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  managementPosition?: ManagementPosition | null;
}

interface AssignPositionModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export default function AssignPositionModal({
  open,
  onClose,
  user,
  onSuccess,
}: AssignPositionModalProps) {
  const { t } = useTranslation();
  const [positions, setPositions] = useState<ManagementPosition[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<any[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load danh sách chức vụ và phân công
  useEffect(() => {
    if (open) {
      setError("");
      setLoading(true);
      Promise.all([
        api.get("/management-positions"),
        api.get("/users"),
      ])
        .then(([posRes, usersRes]) => {
          const posData = Array.isArray(posRes.data) ? posRes.data : [];
          setPositions(posData);

          const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
          setAssignedUsers(usersData);

          // Set giá trị hiện tại
          setSelectedPositionId(user?.managementPosition?.id || "");
        })
        .catch(() => setError(t("departmentDetail.assignPositionModal.errorLoad")))
        .finally(() => setLoading(false));
    }
  }, [open, user, t]);

  const handleSave = async () => {
    if (!user) return;
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/users/${user.id}/management-position`, {
        positionId: selectedPositionId || null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t("departmentDetail.assignPositionModal.errorSave"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePosition = async () => {
    if (!user) return;
    const ok = await confirmAction({
      title: t("departmentDetail.assignPositionModal.removeConfirmTitle"),
      text: t("departmentDetail.assignPositionModal.removeConfirmText", { name: user.name }),
      icon: "warning",
      confirmText: t("departmentDetail.assignPositionModal.removeBtn"),
      confirmColor: "#dc2626",
    });
    if (!ok) return;
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/users/${user.id}/management-position`, {
        positionId: null,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t("departmentDetail.assignPositionModal.errorSave"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: "bold",
          color: "#1e3a8a",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Badge />
        {t("departmentDetail.assignPositionModal.title")}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            dangerouslySetInnerHTML={{
              __html: t("departmentDetail.assignPositionModal.subtitle", {
                name: user.name,
                email: user.email,
              }),
            }}
          />
          {user.managementPosition && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t("departmentDetail.assignPositionModal.currentPosition")}
              </Typography>
              <Chip
                label={user.managementPosition.name}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : positions.length === 0 ? (
          <Alert severity="warning">
            {t("departmentDetail.assignPositionModal.noPositionsAlert")}
          </Alert>
        ) : (
          <FormControl fullWidth>
            <InputLabel>{t("departmentDetail.assignPositionModal.selectLabel")}</InputLabel>
            <Select
              value={selectedPositionId}
              onChange={(e) => setSelectedPositionId(e.target.value)}
              label={t("departmentDetail.assignPositionModal.selectLabel")}
            >
              <MenuItem value="">
                <em>{t("departmentDetail.assignPositionModal.noPositionItem")}</em>
              </MenuItem>
              {positions.map((pos) => {
                let isTaken = false;
                let takenBy = "";

                if (pos.slug === "TRUONG_KHOA") {
                  const existingDean = assignedUsers.find(
                    (u) => u.managementPosition?.slug === "TRUONG_KHOA" && u.id !== user.id
                  );
                  if (existingDean) {
                    isTaken = true;
                    takenBy = existingDean.name || existingDean.email;
                  }
                } else if (pos.slug === "TRUONG_BO_MON") {
                  const currentUserInDb = assignedUsers.find((u) => u.id === user.id);
                  const userDeptId = currentUserInDb?.department?.id;

                  if (userDeptId) {
                    const existingHead = assignedUsers.find(
                      (u) =>
                        u.managementPosition?.slug === "TRUONG_BO_MON" &&
                        u.department?.id === userDeptId &&
                        u.id !== user.id
                    );
                    if (existingHead) {
                      isTaken = true;
                      takenBy = existingHead.name || existingHead.email;
                    }
                  }
                }

                return (
                  <MenuItem key={pos.id} value={pos.id} disabled={isTaken}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color={isTaken ? "text.disabled" : "text.primary"}
                        >
                          {pos.name}
                        </Typography>
                        {pos.description && (
                          <Typography variant="caption" color="text.secondary">
                            {pos.description}
                          </Typography>
                        )}
                      </Box>
                      {isTaken && (
                        <Chip
                          label={t("departmentDetail.assignPositionModal.assignedChip", { name: takenBy })}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ fontSize: 11, fontWeight: 600, ml: 2 }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
        <Box>
          {user.managementPosition && (
            <Button
              color="error"
              onClick={handleRemovePosition}
              disabled={submitting}
              sx={{ textTransform: "none" }}
            >
              {t("departmentDetail.assignPositionModal.removeBtn")}
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            {t("departmentDetail.assignPositionModal.cancelBtn")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting || positions.length === 0}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#1e3a8a",
              "&:hover": { bgcolor: "#1e40af" },
            }}
          >
            {submitting ? <CircularProgress size={20} /> : t("departmentDetail.assignPositionModal.saveBtn")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
