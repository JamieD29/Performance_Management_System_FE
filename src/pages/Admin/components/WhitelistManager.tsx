import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Add, Delete, Info } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { api } from "../../../services/api";
import type { Domain } from "../../../types";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { Tooltip } from "@mui/material";

export default function WhitelistManager() {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });
  const [domains, setDomains] = useState<(Domain & { userCount?: number })[]>([]);
  const [domainInput, setDomainInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await api.get("/admin/domains");
      const data = response.data?.domains || response.data || [];
      setDomains(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddDomain = async () => {
    const rawDomain = domainInput.trim().toLowerCase();
    if (!rawDomain) return showMessage("error", t("whitelistManager.alerts.enterDomain"));

    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(rawDomain))
      return showMessage("error", t("whitelistManager.alerts.invalidDomain"));

    if (domains.some((d) => d.domain.toLowerCase() === rawDomain)) {
      return showMessage("error", t("whitelistManager.alerts.domainExists"));
    }

    setIsSaving(true);
    try {
      const response = await api.post("/admin/domains", { domain: rawDomain });
      const newDomain = response.data?.domain || response.data;
      setDomains([...domains, newDomain]);
      setDomainInput("");
      showMessage("success", t("whitelistManager.alerts.addSuccess", { domain: rawDomain }));
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || t("whitelistManager.alerts.addError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    setConfirmDelete({ open: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = confirmDelete.id;
    if (!id) return;

    setIsSaving(true);
    try {
      await api.delete(`/admin/domains/${id}`);
      setDomains(domains.filter((d) => d.id !== id));
      showMessage("success", t("whitelistManager.alerts.deleteSuccess"));
      setConfirmDelete({ open: false, id: null });
    } catch (err: any) {
      showMessage("error", err.response?.data?.message || t("whitelistManager.alerts.deleteError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      {message && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Card sx={{ mb: 3, boxShadow: "none", border: "1px solid #e2e8f0" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {t("whitelistManager.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t("whitelistManager.description")}
          </Typography>

          <Box
            sx={{ mb: 3, display: "flex", gap: 2, alignItems: "flex-start" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder={t("whitelistManager.placeholder")}
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
              helperText={t("whitelistManager.helperText")}
              disabled={isSaving}
              sx={{
                "& .MuiFormHelperText-root": { marginLeft: 0, marginTop: 1 },
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddDomain}
              disabled={isSaving || !domainInput.trim()}
              size="small"
              startIcon={!isSaving && <Add />}
              sx={{
                minWidth: 100,
                height: 40,
                whiteSpace: "nowrap",
                mt: "1px",
              }}
            >
              {isSaving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                t("whitelistManager.addBtn")
              )}
            </Button>
          </Box>

          <List
            sx={{
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px solid #f1f5f9",
            }}
          >
            {domains.map((d) => (
              <ListItem key={d.id}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`@${d.domain}`} color="primary" size="small" />
                      {typeof d.userCount === 'number' && (
                        <Typography variant="caption" color={d.userCount > 0 ? "error.main" : "text.secondary"} sx={{ fontWeight: 500 }}>
                          {t("whitelistManager.userCount", { count: d.userCount })}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={t("whitelistManager.addedAt", { date: new Date(d.addedAt).toLocaleDateString() })}
                />
                <ListItemSecondaryAction>
                  {d.userCount && d.userCount > 0 ? (
                    <Tooltip title={t("whitelistManager.tooltips.cannotDeleteActive", { count: d.userCount })}>
                      <span>
                        <IconButton disabled color="error">
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : domains.length <= 1 ? (
                    <Tooltip title={t("whitelistManager.tooltips.atLeastOne")}>
                      <span>
                        <IconButton disabled color="error">
                          <Delete />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t("whitelistManager.tooltips.delete")}>
                      <IconButton onClick={() => handleOpenDelete(d.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {domains.length === 0 && (
              <Typography
                sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
              >
                {t("whitelistManager.empty")}
              </Typography>
            )}
          </List>

          <Alert severity="info" icon={<Info />} sx={{ mt: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {t("whitelistManager.policy.title")}
            </Typography>
            <Typography variant="body2">
              {t("whitelistManager.policy.rule1")}
              <br />
              {t("whitelistManager.policy.rule2")}
              <br />
              {t("whitelistManager.policy.rule3")}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ ...confirmDelete, open: false })}
        onConfirm={handleConfirmDelete}
        title={t("whitelistManager.dialog.title")}
        content={t("whitelistManager.dialog.content")}
        variant="danger"
        confirmText={t("whitelistManager.dialog.confirmBtn")}
        isLoading={isSaving}
      />
    </Box>
  );
}
