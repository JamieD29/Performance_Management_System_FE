import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Button,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { api } from "../../../services/api";
import { showSuccess, showError } from "../../../utils/swal";
import type { User } from "../../../types";

export default function UserRoleManager() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then((res) =>
        setUsers(Array.isArray(res.data) ? res.data : res.data.data || []),
      )
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/users/${selectedUser.id}/roles`, { roles: [newRole] });
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, roles: [newRole] as any } : u,
        ),
      );
      setRoleDialogOpen(false);
      showSuccess(t("userRoleManager.alerts.successTitle"), t("userRoleManager.alerts.successUpdate"));
    } catch (err: any) {
      showError(t("userRoleManager.alerts.errorTitle"), err.response?.data?.message || t("userRoleManager.alerts.errorUpdate"));
    }
  };

  const getRoleColor = (role: string) => {
    if (role === "ADMIN") return "error";
    return "default";
  };

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 2, py: 0.5 }}>
        {t("userRoleManager.adminWarning")}
      </Alert>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell>{t("userRoleManager.table.headers.employee")}</TableCell>
              <TableCell>{t("userRoleManager.table.headers.jobTitle")}</TableCell>
              <TableCell>{t("userRoleManager.table.headers.position")}</TableCell>
              <TableCell>{t("userRoleManager.table.headers.systemRole")}</TableCell>
              <TableCell align="right">{t("userRoleManager.table.headers.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell sx={{ py: 1 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        src={user.avatarUrl}
                        sx={{ width: 32, height: 32, fontSize: "0.9rem" }}
                      >
                        {user.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          {user.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: "0.85rem" }}>
                    <Chip label={user.jobTitle || "N/A"} size="small" />
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: "0.85rem" }}>
                    {(user as any).managementPosition ? (
                      <Chip
                        label={(user as any).managementPosition.name}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    {user.roles.map((r: any) => {
                      const roleSlug =
                        typeof r === "string" ? r : r.slug || r.name;
                      return (
                        <Chip
                          key={roleSlug}
                          label={roleSlug}
                          size="small"
                          color={getRoleColor(roleSlug) as any}
                          sx={{ mr: 0.5 }}
                        />
                      );
                    })}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>
                    <Tooltip title={t("userRoleManager.table.tooltips.editRole")}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          const firstRole = user.roles[0] as any;
                          setNewRole(
                            (typeof firstRole === "string"
                              ? firstRole
                              : firstRole?.slug) || "USER",
                          );
                          setRoleDialogOpen(true);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>{t("userRoleManager.dialog.title", { name: selectedUser?.name })}</DialogTitle>
        <DialogContent sx={{ minWidth: 300, pt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("userRoleManager.dialog.roleLabel")}</InputLabel>
            <Select
              value={newRole}
              label={t("userRoleManager.dialog.roleLabel")}
              onChange={(e: SelectChangeEvent) => setNewRole(e.target.value)}
            >
              <MenuItem value="USER">{t("userRoleManager.dialog.options.user")}</MenuItem>
              <MenuItem value="ADMIN" sx={{ color: "red" }}>
                {t("userRoleManager.dialog.options.admin")}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>{t("userRoleManager.dialog.cancelBtn")}</Button>
          <Button variant="contained" onClick={handleUpdateRole}>
            {t("userRoleManager.dialog.saveBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
