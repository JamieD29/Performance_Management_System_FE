import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Send } from "@mui/icons-material";
import { api } from "../../../services/api";
import AssignTemplateDialog from "./AssignTemplateDialog";

export default function AssignOkrTab() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [openAssign, setOpenAssign] = useState(false);
  const [assignTemplate, setAssignTemplate] = useState<any>(null);

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
              <TableCell sx={{ fontWeight: "bold" }}>Tên Template</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Chức vụ / Chức danh</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Tác giả</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  Chưa có template nào.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{t.title}</TableCell>
                  <TableCell>
                    {t.positionName && (
                      <Chip label={t.positionName} size="small" color="secondary" sx={{ mr: 0.5 }} />
                    )}
                    {t.jobTitle && (
                      <Chip label={t.jobTitle} size="small" color="primary" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{t.createdByName || "—"}</Typography>
                  </TableCell>
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
