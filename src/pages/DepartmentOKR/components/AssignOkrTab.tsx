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

export default function AssignOkrTab() {
  const navigate = useNavigate();
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
          Chọn Template để gán cho nhân sự
        </Typography>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: { xs: "30%", md: "40%" } }}>Tên Template</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%", whiteSpace: "nowrap" }}>Chức vụ / Chức danh</TableCell>
              {isAdmin && <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>Tác giả</TableCell>}
              <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "10%", whiteSpace: "nowrap" }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  Chưa có template nào.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ maxWidth: { xs: 150, sm: 200, md: 300 } }}>
                    <Tooltip title={t.title}>
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
                        {t.title}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {t.positionName && (
                      <Chip label={t.positionName} size="small" color="secondary" sx={{ mr: 0.5 }} />
                    )}
                    {t.jobTitle ? (
                      <Chip label={t.jobTitle} size="small" color="primary" variant="outlined" />
                    ) : (
                      !t.positionName && (
                        <Chip label="Tất cả" size="small" color="default" variant="outlined" />
                      )
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {t.createdByUserId ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover .author-name": { textDecoration: "underline" } }}
                          onClick={() => navigate(`/departments/users/${t.createdByUserId}`, { state: { parentName: "OKR Bộ Môn", parentUrl: "/departments/okr" } })}
                        >
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: "#dbeafe", color: "#1e40af", fontWeight: "bold" }}>
                            {t.createdByName ? t.createdByName.charAt(0).toUpperCase() : "U"}
                          </Avatar>
                          <Typography
                            variant="body2"
                            className="author-name"
                            sx={{ color: "primary.main" }}
                          >
                            {t.createdByName || "—"}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2">—</Typography>
                      )}
                    </TableCell>
                  )}
                  <TableCell>{new Date(t.createdAt).toLocaleDateString("vi-VN")}</TableCell>
                  <TableCell align="right">
                    <Button size="small" color="success" variant="contained" startIcon={<Send />} onClick={() => handleAssign(t)}>
                      Gán OKR
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
