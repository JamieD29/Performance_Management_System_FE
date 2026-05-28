import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Save,
  Add,
  UploadFile,
  CheckCircle,
  HelpOutline,
} from "@mui/icons-material";
import { api } from "../../../services/api";
import { performanceService } from "../../../services/performanceService";
import { showSuccess, showError } from "../../../utils/swal";
import { useTemplateStructure } from "../hooks/useTemplateStructure";
import { ObjectiveRow, KeyResultRow, SubKRRow, SubSubKRRow } from "./RowComponents";
import { parseExcelToStructure } from "../../../utils/excelParser";

interface TemplateEditorDialogProps {
  open: boolean;
  onClose: () => void;
  template?: any;
  onRefresh: () => void;
}

export default function TemplateEditorDialog({
  open,
  onClose,
  template,
  onRefresh,
}: TemplateEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [positionId, setPositionId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [positions, setPositions] = useState<any[]>([]);
  const [jobTitles, setJobTitles] = useState<any[]>([]);

  const {
    structure,
    setStructure,
    updateItem,
    handleAddObjective,
    handleDeleteObjective,
    handleAddKR,
    handleDeleteKR,
    handleAddSubKR,
    handleDeleteSubKR,
    handleAddSubSubKR,
    handleDeleteSubSubKR,
    setNonNeg,
  } = useTemplateStructure();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadMetadata();
    if (template) {
      setTitle(template.title || "");
      setPositionId(template.positionId || "");
      setJobTitle(template.jobTitle || "");
      setStructure(Array.isArray(template.structure) ? template.structure : []);
    } else {
      setTitle("");
      setPositionId("");
      setJobTitle("");
      setStructure([]);
    }
  }, [open, template, setStructure]);

  const loadMetadata = async () => {
    try {
      const [posRes, jtRes] = await Promise.all([
        api.get("/management-positions"),
        api.get("/okr-templates/job-titles"),
      ]);
      setPositions(posRes.data || []);
      setJobTitles(jtRes.data || []);
    } catch (error) {
      console.error("Error loading metadata", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedStructure = await parseExcelToStructure(file);
      setStructure(importedStructure);
      setSnackbar({
        open: true,
        message: "Import dữ liệu từ Excel thành công!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Excel parse error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Lỗi định dạng file Excel. Vui lòng kiểm tra lại template.",
        severity: "error",
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title,
        positionId: positionId || null,
        jobTitle: jobTitle || null,
        structure: structure,
      };

      if (template?.id) {
        const res = await api.put(`/okr-templates/${template.id}`, payload);
        showSuccess("Thành công", res.data?.message || "Đã cập nhật OKR Template.");
      } else {
        const res = await api.post("/okr-templates", payload);
        showSuccess("Thành công", res.data?.message || "Đã tạo OKR Template mới.");
      }
      onRefresh();
      onClose();
    } catch (error: any) {
      console.error(error);
      showError("Lỗi", error.response?.data?.message || "Có lỗi xảy ra khi lưu template.");
    }
  };

  const isFormValid = useMemo(() => {
    return title.trim() !== "" && structure.length > 0;
  }, [title, structure]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight="bold" color="#1e3a8a">
            {template ? "Chỉnh sửa OKR Template" : "Tạo OKR Template mới"}
          </Typography>
          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFile />}
              sx={{ mr: 1 }}
            >
              Import Excel
              <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileUpload} />
            </Button>
            <Tooltip title="Tải file mẫu Excel">
              <IconButton size="small" color="primary">
                <HelpOutline />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", gap: 3, mb: 4, mt: 1 }}>
          <TextField
            fullWidth
            label="Tên Template OKR (VD: OKR Giảng viên 2024)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            variant="outlined"
          />
          {/* <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Chức vụ áp dụng</InputLabel>
            <Select
              value={positionId}
              label="Chức vụ áp dụng"
              onChange={(e) => setPositionId(e.target.value)}
            >
              <MenuItem value="">-- Tất cả --</MenuItem>
              {positions.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl> */}
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Chức danh áp dụng</InputLabel>
            <Select
              value={jobTitle}
              label="Chức danh áp dụng"
              onChange={(e) => setJobTitle(e.target.value)}
            >
              <MenuItem value="Tất cả">-- Tất cả --</MenuItem>
              {jobTitles.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Cấu trúc OKR</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddObjective}>
            Thêm Mục tiêu lớn (A, B, C...)
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell width="60">Mã</TableCell>
                <TableCell>Nội dung (Mục tiêu / Tiêu chí)</TableCell>
                <TableCell width="120">Điểm tối đa</TableCell>
                <TableCell width="120">Điểm/Đơn vị</TableCell>
                <TableCell width="120">
                  Đơn vị
                  <Tooltip title="Đơn vị tính (VD: bài báo, hoạt động, chương trình, môn học,... )">
                    <HelpOutline sx={{ fontSize: 16, ml: 0.5, color: "text.secondary", cursor: "pointer", verticalAlign: "middle" }} />
                  </Tooltip>
                </TableCell>
                <TableCell width="150">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structure.map((obj, oIndex) => (
                <React.Fragment key={obj.id || oIndex}>
                  <ObjectiveRow
                    obj={obj}
                    idx={oIndex}
                    updateItem={updateItem}
                    handleAddKR={handleAddKR}
                    handleDeleteObjective={handleDeleteObjective}
                    setNonNeg={setNonNeg}
                  />
                  {obj.items?.map((kr: any, kIndex: number) => (
                    <React.Fragment key={kr.id || kIndex}>
                      <KeyResultRow
                        kr={kr}
                        oIdx={oIndex}
                        kIdx={kIndex}
                        updateItem={updateItem}
                        handleAddSubKR={handleAddSubKR}
                        handleDeleteKR={handleDeleteKR}
                        setNonNeg={setNonNeg}
                      />
                      {kr.items?.map((sub: any, sIndex: number) => (
                        <React.Fragment key={sub.id || sIndex}>
                          <SubKRRow
                            sub={sub}
                            oIdx={oIndex}
                            kIdx={kIndex}
                            sIdx={sIndex}
                            updateItem={updateItem}
                            handleAddSubSubKR={handleAddSubSubKR}
                            handleDeleteSubKR={handleDeleteSubKR}
                            setNonNeg={setNonNeg}
                          />
                          {sub.items?.map((item: any, ssIndex: number) => (
                            <SubSubKRRow
                              key={item.id || ssIndex}
                              item={item}
                              oIdx={oIndex}
                              kIdx={kIndex}
                              sIdx={sIndex}
                              ssIdx={ssIndex}
                              updateItem={updateItem}
                              handleDeleteSubSubKR={handleDeleteSubSubKR}
                              setNonNeg={setNonNeg}
                            />
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
              {structure.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    Chưa có dữ liệu. Hãy thêm Mục tiêu lớn hoặc Import từ Excel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} disabled={!isFormValid}>
          Lưu Template
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          icon={snackbar.severity === "success" ? <CheckCircle /> : undefined}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
