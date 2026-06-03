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
  Avatar,
  Tooltip,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { api } from "../../../services/api";
import AssignTemplateDialog from "./AssignTemplateDialog";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AssignOkrTab() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [templates, setTemplates] = useState<any[]>([]);
  const [openAssign, setOpenAssign] = useState(false);
  const [assignTemplate, setAssignTemplate] = useState<any>(null);

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
      const res = await api.get("/okr-templates");
      setTemplates(res.data);
    } catch (error) {
      console.error("Error fetching templates", error);
    }
  };

  const handleAssign = (tmpl: any) => {
    setAssignTemplate(tmpl);
    setOpenAssign(true);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {t("departmentOkr.assignTab.title")}
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: { xs: "30%", md: "40%" } }}>{t("departmentOkr.assignTab.table.templateName")}</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%", whiteSpace: "nowrap" }}>{t("departmentOkr.assignTab.table.positionJobTitle")}</TableCell>
              {isAdmin && <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>{t("departmentOkr.assignTab.table.author")}</TableCell>}
              <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>{t("departmentOkr.assignTab.table.createdAt")}</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "10%", whiteSpace: "nowrap" }}>{t("departmentOkr.assignTab.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  {t("departmentOkr.assignTab.noTemplates")}
                </TableCell>
              </TableRow>
            ) : (
              templates.map((tmpl) => (
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
                      <Chip label={tmpl.positionName} size="small" color="secondary" sx={{ mr: 0.5 }} />
                    )}
                    {tmpl.jobTitle ? (
                      <Chip label={t("profile.enums.jobTitle." + tmpl.jobTitle, { defaultValue: tmpl.jobTitle })} size="small" color="primary" variant="outlined" />
                    ) : (
                      !tmpl.positionName && (
                        <Chip label={t("departmentOkr.assignTab.all")} size="small" color="default" variant="outlined" />
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
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{new Date(tmpl.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <Button size="small" color="success" variant="contained" startIcon={<Send />} onClick={() => handleAssign(tmpl)}>
                      {t("departmentOkr.assignTab.assignBtn")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {openAssign && assignTemplate && (
        <AssignTemplateDialog
          open={openAssign}
          onClose={() => {
            setOpenAssign(false);
            setAssignTemplate(null);
          }}
          template={assignTemplate}
        />
      )}
    </Box>
  );
}
