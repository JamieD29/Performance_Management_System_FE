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

export default function TemplateListTab() {
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
      showSuccess("Đã xóa template thành công!");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      showError("Lỗi", "Không thể xóa template. Vui lòng thử lại sau.");
    }
  };

  console.log(templates);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const term = searchTerm.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(term);
      const matchPosition = t.positionName?.toLowerCase().includes(term);
      const matchJob = t.jobTitle?.toLowerCase().includes(term);
      const matchAuthor = t.createdByName?.toLowerCase().includes(term);
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
          Danh sách OKR Templates (Mẫu)
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm template..."
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
            Tạo Template mới
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
              <TableCell sx={{ fontWeight: "bold", width: { xs: "30%", md: "40%" } }}>Tên Template</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%", whiteSpace: "nowrap" }}>Chức vụ / Chức danh</TableCell>
              {isAdmin && <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>Tác giả</TableCell>}
              <TableCell sx={{ fontWeight: "bold", width: "15%", whiteSpace: "nowrap" }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "10%", whiteSpace: "nowrap" }}>Thao tác</TableCell>
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
                  Không tìm thấy template nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((t) => (
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
                      <Chip
                        label={t.positionName}
                        size="small"
                        color="secondary"
                        sx={{ mr: 0.5 }}
                      />
                    )}
                    {t.jobTitle ? (
                      <Chip
                        label={t.jobTitle}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : (
                      !t.positionName && (
                        <Chip
                          label="Tất cả"
                          size="small"
                          color="default"
                          variant="outlined"
                        />
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
                  <TableCell>
                    {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(t)}
                        sx={{ mr: 1 }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(t)}
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
