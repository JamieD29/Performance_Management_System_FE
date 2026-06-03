import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import { showError, showSuccess, confirmDelete } from "../../../utils/swal";
import TemplateEditorDialog from "./TemplateEditorDialog";
import { useTranslation } from "react-i18next";

export default function TemplateListTab() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Kiểm tra vai trò Admin từ localStorage
  const isAdmin = useMemo(() => {
    const userString = localStorage.getItem("user");
    if (!userString) return false;
    try {
      const u = JSON.parse(userString);
      const rawRoles = u.roles || [];
      const userRoles = rawRoles.map((r: any) => (typeof r === "string" ? r : r.slug));
      return userRoles.includes("ADMIN");
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/okr-templates");
      setTemplates(res.data);
    } catch (error) {
      console.error("Error fetching templates", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setOpenEditor(true);
  };

  const handleEdit = (tmpl: any) => {
    setSelectedTemplate(tmpl);
    setOpenEditor(true);
  };

  const handleDelete = async (tmpl: any) => {
    const isConfirmed = await confirmDelete(tmpl.title);
    if (!isConfirmed) return;

    try {
      await api.delete(`/okr-templates/${tmpl.id}`);
      showSuccess(t("okrTemplates.list.deleteSuccess"));
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      showError(t("okrTemplates.list.errorTitle"), t("okrTemplates.list.deleteError"));
    }
  };

  console.log(templates);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      const term = searchTerm.toLowerCase();
      const matchTitle = tmpl.title?.toLowerCase().includes(term);
      const matchPosition = tmpl.positionName?.toLowerCase().includes(term);
      const matchJob = tmpl.jobTitle?.toLowerCase().includes(term);
      const matchAuthor = tmpl.createdByName?.toLowerCase().includes(term);
      return matchTitle || matchPosition || matchJob || matchAuthor;
    });
  }, [templates, searchTerm]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {t("okrTemplates.list.title")}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder={t("okrTemplates.list.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, bgcolor: "white" }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateNew}
          >
            {t("okrTemplates.list.createBtn")}
          </Button>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #e2e8f0" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: { xs: "30%", md: "40%" } }}>{t("okrTemplates.list.table.title")}</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%", whiteSpace: "nowrap" }}>{t("okrTemplates.list.table.positionJob")}</TableCell>
              {isAdmin && <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>{t("okrTemplates.list.table.author")}</TableCell>}
              <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>{t("okrTemplates.list.table.createdAt")}</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "10%", whiteSpace: "nowrap" }}>{t("okrTemplates.list.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 5 : 4}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  {t("okrTemplates.list.noTemplates")}
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((tmpl) => (
                <TableRow key={tmpl.id} hover>
                  <TableCell sx={{ maxWidth: { xs: 150, sm: 200, md: 300 } }}>
                    <Tooltip title={tmpl.title}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          wordBreak: "break-word",
                        }}
                      >
                        {tmpl.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {tmpl.positionName && (
                      <Chip
                        label={tmpl.positionName}
                        size="small"
                        color="secondary"
                        sx={{ mr: 0.5 }}
                      />
                    )}
                    {tmpl.jobTitle ? (
                      <Chip
                        label={tmpl.jobTitle}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      !tmpl.positionName && (
                        <Chip
                          label={t("okrTemplates.list.all")}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {tmpl.createdByUserId ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover .author-name": { textDecoration: "underline" } }}
                          onClick={() => navigate(`/departments/users/${tmpl.createdByUserId}`, { state: { parentName: "OKR Bộ Môn", parentUrl: "/departments/okr" } })}
                        >
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: "#dbeafe", color: "#1e40af", fontWeight: "bold" }}>
                            {tmpl.createdByName ? tmpl.createdByName.charAt(0).toUpperCase() : "U"}
                          </Avatar>
                          <Typography
                            variant="body2"
                            className="author-name"
                            sx={{ color: "primary.main" }}
                          >
                            {tmpl.createdByName || "—"}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2">—</Typography>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {new Date(tmpl.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("okrTemplates.list.tooltip.edit")}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(tmpl)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("okrTemplates.list.tooltip.delete")}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(tmpl)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {openEditor && (
        <TemplateEditorDialog
          open={openEditor}
          onClose={() => setOpenEditor(false)}
          onRefresh={fetchTemplates}
          template={selectedTemplate}
        />
      )}

    </Box>
  );
}
