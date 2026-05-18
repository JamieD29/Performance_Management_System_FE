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
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { api } from "../../../services/api";
import { showError, showSuccess, confirmDelete } from "../../../utils/swal";
import TemplateEditorDialog from "./TemplateEditorDialog";

export default function TemplateListTab() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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
              <TableCell sx={{ fontWeight: "bold" }}>Tên Template</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Chức vụ / Chức danh
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Tác giả</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 3, color: "text.secondary" }}
                >
                  Không tìm thấy template nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{t.title}</TableCell>
                  <TableCell>
                    {t.positionName && (
                      <Chip
                        label={t.positionName}
                        size="small"
                        color="secondary"
                        sx={{ mr: 0.5 }}
                      />
                    )}
                    {t.jobTitle && (
                      <Chip
                        label={t.jobTitle}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {t.createdByName || "—"}
                    </Typography>
                  </TableCell>
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
