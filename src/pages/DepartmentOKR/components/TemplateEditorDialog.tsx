import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add,
  Delete,
  Flag,
  Save,
  UploadFile,
  CheckCircle,
} from "@mui/icons-material";
import { api } from "../../../services/api";
import { parseExcelToStructure } from "../../../utils/excelParser";

interface TemplateEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function TemplateEditorDialog({
  open,
  onClose,
  onSave,
  initialData,
}: TemplateEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [positionName, setPositionName] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [structure, setStructure] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  // Snackbar state for import feedback
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadData();
      if (initialData) {
        setTitle(initialData.title);
        setDepartmentId(initialData.departmentId || "");
        setPositionId(initialData.positionId || "");
        setPositionName(initialData.positionName || "");
        setJobTitle(initialData.jobTitle || "");
        setStructure(initialData.structure || []);
      } else {
        setTitle("");
        setDepartmentId("");
        setPositionId("");
        setPositionName("");
        setJobTitle("");
        setStructure([]);
      }
    }
  }, [open, initialData]);

  const loadData = async () => {
    try {
      const deptRes = await api.get("/departments");
      setDepartments(deptRes.data?.data || deptRes.data || []);

      const posRes = await api.get("/management-positions");
      setPositions(posRes.data?.data || posRes.data || []);
    } catch (error) {
      console.error("Lỗi load data", error);
    }
  };

  const handlePositionChange = (pid: string) => {
    setPositionId(pid);
    const found = positions.find((p: any) => p.id === pid);
    setPositionName(found?.name || "");
  };

  // ============================================================
  // Structure Manipulation
  // ============================================================
  const handleAddObjective = () => {
    const newChar = String.fromCharCode(65 + structure.length);
    setStructure([
      ...structure,
      {
        id: newChar,
        type: "objective",
        title: "",
        maxScore: 0,
        items: [],
      },
    ]);
  };

  const handleAddKR = (objIndex: number) => {
    const newStructure = [...structure];
    const objective = newStructure[objIndex];
    const newId = `${objective.items.length + 1}`;
    objective.items.push({
      id: newId,
      type: "kr",
      title: "",
      maxScore: 0,
      unitScore: 0,
      unit: "",
      target: 0,
      items: [],
    });
    setStructure(newStructure);
  };

  const handleAddSubKR = (objIndex: number, krIndex: number) => {
    const newStructure = [...structure];
    const kr = newStructure[objIndex].items[krIndex];
    const newId = `${kr.id}.${kr.items.length + 1}`;
    kr.items.push({
      id: newId,
      type: "sub_kr",
      title: "",
      maxScore: 0,
      unitScore: 0,
      unit: "",
      target: 0,
      items: [],
    });
    setStructure(newStructure);
  };

  const handleAddSubSubKR = (
    objIndex: number,
    krIndex: number,
    subKrIndex: number,
  ) => {
    const newStructure = [...structure];
    const subKr = newStructure[objIndex].items[krIndex].items[subKrIndex];
    if (!subKr.items) subKr.items = [];
    const newId = String.fromCharCode(97 + subKr.items.length); // a, b, c...
    subKr.items.push({
      id: newId,
      type: "sub_sub_kr",
      title: "",
      maxScore: 0,
      unitScore: 0,
      unit: "",
      target: 0,
      items: [],
    });
    setStructure(newStructure);
  };

  const handleDeleteObj = (objIndex: number) => {
    setStructure(structure.filter((_, i) => i !== objIndex));
  };

  const handleDeleteKR = (objIndex: number, krIndex: number) => {
    const newStructure = [...structure];
    newStructure[objIndex].items.splice(krIndex, 1);
    setStructure(newStructure);
  };

  const handleDeleteSubKR = (
    objIndex: number,
    krIndex: number,
    subIndex: number,
  ) => {
    const newStructure = [...structure];
    newStructure[objIndex].items[krIndex].items.splice(subIndex, 1);
    setStructure(newStructure);
  };

  const handleDeleteSubSubKR = (
    objIndex: number,
    krIndex: number,
    subKrIndex: number,
    subSubIndex: number,
  ) => {
    const newStructure = [...structure];
    newStructure[objIndex].items[krIndex].items[subKrIndex].items.splice(
      subSubIndex,
      1,
    );
    setStructure(newStructure);
  };

  const updateItem = (
    objIndex: number,
    field: string,
    value: any,
    krIndex?: number,
    subKrIndex?: number,
    subSubKrIndex?: number,
  ) => {
    const newStructure = [...structure];
    if (krIndex === undefined) {
      newStructure[objIndex][field] = value;
    } else if (subKrIndex === undefined) {
      newStructure[objIndex].items[krIndex][field] = value;
    } else if (subSubKrIndex === undefined) {
      newStructure[objIndex].items[krIndex].items[subKrIndex][field] = value;
    } else {
      newStructure[objIndex].items[krIndex].items[subKrIndex].items[
        subSubKrIndex
      ][field] = value;
    }
    setStructure(newStructure);
  };

  // Clamp to non-negative
  const setNonNeg = (val: string) => Math.max(0, Number(val) || 0);

  // ============================================================
  // Excel Import
  // ============================================================
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      setSnackbar({
        open: true,
        message: "Chỉ hỗ trợ file Excel (.xlsx, .xls)",
        severity: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar({
        open: true,
        message: "File quá lớn. Giới hạn tối đa 5MB.",
        severity: "error",
      });
      return;
    }

    try {
      const parsed = await parseExcelToStructure(file);

      if (parsed.length === 0) {
        setSnackbar({
          open: true,
          message:
            "Không tìm thấy dữ liệu OKR trong file. Hãy kiểm tra lại cấu trúc file.",
          severity: "error",
        });
        return;
      }

      setStructure(parsed);

      // Count items
      let total = parsed.length;
      parsed.forEach((obj) => {
        total += obj.items?.length || 0;
        obj.items?.forEach((kr: any) => {
          total += kr.items?.length || 0;
          kr.items?.forEach((sub: any) => {
            total += sub.items?.length || 0;
          });
        });
      });

      setSnackbar({
        open: true,
        message: `✅ Import thành công! ${parsed.length} mục tiêu, tổng ${total} mục. Hãy kiểm tra và chỉnh sửa trước khi lưu.`,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err instanceof Error ? err.message : "Lỗi không xác định khi đọc file",
        severity: "error",
      });
    }

    // Reset file input so user can re-import same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // Submit
  // ============================================================
  const handleSubmit = () => {
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};

    onSave({
      title,
      departmentId,
      positionId,
      positionName,
      jobTitle,
      structure,
      createdByUserId: user.id || "",
      createdByName: user.name || user.email || "Unknown",
    });
  };

  const jobTitles = ["Giảng viên", "Chuyên viên", "Nghiên cứu viên", "Khác"];

  // ============================================================
  // Render Helpers
  // ============================================================
  const inputClass = "w-full border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white placeholder-slate-400 transition-colors";
  const objInputClass = "w-full border border-blue-400/50 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-300 bg-white/10 text-white placeholder-white/60 transition-colors";

  // Render sub-sub-KR rows (level 4: a, b, c...)
  const renderSubSubKRRows = (
    subSubItems: any[],
    oIndex: number,
    kIndex: number,
    sIndex: number,
  ) => {
    if (!subSubItems || subSubItems.length === 0) return null;
    return subSubItems.map((ssKr: any, ssIndex: number) => (
      <TableRow
        key={`${oIndex}-${kIndex}-${sIndex}-${ssIndex}`}
        sx={{ bgcolor: "#fff" }}
      >
        <TableCell sx={{ pl: 9, fontSize: "0.8rem", color: "#6b7280" }}>
          {ssKr.id}
        </TableCell>
        <TableCell>
          <input
            className={inputClass}
            placeholder="Mô tả chi tiết..."
            value={ssKr.title}
            onChange={(e) =>
              updateItem(oIndex, "title", e.target.value, kIndex, sIndex, ssIndex)
            }
          />
        </TableCell>
        <TableCell>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={ssKr.maxScore}
            onChange={(e) =>
              updateItem(oIndex, "maxScore", setNonNeg(e.target.value), kIndex, sIndex, ssIndex)
            }
          />
        </TableCell>
        <TableCell>
          <input
            type="number"
            min="0"
            className={inputClass}
            placeholder="+1"
            value={ssKr.unitScore || ""}
            onChange={(e) =>
              updateItem(oIndex, "unitScore", setNonNeg(e.target.value), kIndex, sIndex, ssIndex)
            }
          />
        </TableCell>
        <TableCell>
          <input
            className={inputClass}
            placeholder="đơn vị"
            value={ssKr.unit || ""}
            onChange={(e) =>
              updateItem(oIndex, "unit", e.target.value, kIndex, sIndex, ssIndex)
            }
          />
        </TableCell>
        <TableCell>
          <input
            type="number"
            min="0"
            className={inputClass}
            value={ssKr.target || ""}
            onChange={(e) =>
              updateItem(oIndex, "target", setNonNeg(e.target.value), kIndex, sIndex, ssIndex)
            }
          />
        </TableCell>
        <TableCell>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteSubSubKR(oIndex, kIndex, sIndex, ssIndex)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ color: "#1e3a8a", fontWeight: "bold" }}>
        <Flag sx={{ mr: 1, verticalAlign: "middle" }} />
        {initialData ? "Chỉnh sửa Template OKR" : "Tạo mới Template OKR"}
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ mt: 2, bgcolor: "#f8fafc" }}>
        {/* Header fields */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            sx={{ flex: 2, minWidth: 300 }}
            label="Tên Template (VD: OKR Phó khoa - Giảng viên)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <FormControl sx={{ flex: 1, minWidth: 180 }}>
            <InputLabel>Bộ môn</InputLabel>
            <Select
              value={departmentId}
              label="Bộ môn"
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              {departments.map((d: any) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1, minWidth: 180 }}>
            <InputLabel>Chức vụ</InputLabel>
            <Select
              value={positionId}
              label="Chức vụ"
              onChange={(e) => handlePositionChange(e.target.value)}
            >
              <MenuItem value="">-- Không chọn --</MenuItem>
              {positions.map((p: any) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ flex: 1, minWidth: 180 }}>
            <InputLabel>Chức danh</InputLabel>
            <Select
              value={jobTitle}
              label="Chức danh"
              onChange={(e) => setJobTitle(e.target.value)}
            >
              <MenuItem value="">-- Không chọn --</MenuItem>
              {jobTitles.map((jt) => (
                <MenuItem key={jt} value={jt}>
                  {jt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Structure header + action buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Cấu trúc Điểm chuẩn OKR
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              color="success"
              startIcon={<UploadFile />}
              onClick={handleImportClick}
            >
              Import từ Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddObjective}
            >
              Thêm Mục tiêu lớn (A, B...)
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #e2e8f0" }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: "#1e3a8a" }}>
              <TableRow>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "6%" }}
                >
                  STT
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "34%" }}
                >
                  Nội dung
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                >
                  Điểm tối đa
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                >
                  Điểm/đơn vị
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                >
                  Đơn vị tính
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                >
                  Số liệu (quy đổi)
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold", width: "12%" }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structure.map((obj, oIndex) => (
                <React.Fragment key={obj.id || oIndex}>
                  {/* === OBJECTIVE ROW (Level 1: A, B, C...) === */}
                  <TableRow
                    sx={{
                      bgcolor: "#1e3a8a",
                      "& td": {
                        color: "white",
                        borderBottom: "2px solid #3b82f6",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                      {obj.id}
                    </TableCell>
                    <TableCell>
                      <input
                        className={objInputClass}
                        placeholder="Tên mục tiêu lớn..."
                        value={obj.title}
                        onChange={(e) => updateItem(oIndex, "title", e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min="0"
                        className={objInputClass}
                        value={obj.maxScore}
                        onChange={(e) => updateItem(oIndex, "maxScore", setNonNeg(e.target.value))}
                      />
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ color: "white", borderColor: "white", mr: 0.5 }}
                        onClick={() => handleAddKR(oIndex)}
                      >
                        <Add fontSize="small" /> KR
                      </Button>
                      <IconButton
                        size="small"
                        sx={{ color: "#fca5a5" }}
                        onClick={() => handleDeleteObj(oIndex)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  {/* === KR ROWS (Level 2: 1, 2, 3...) === */}
                  {obj.items.map((kr: any, kIndex: number) => (
                    <React.Fragment key={`${oIndex}-${kIndex}`}>
                      <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                        <TableCell sx={{ pl: 3, fontWeight: "bold" }}>
                          {kr.id}
                        </TableCell>
                        <TableCell>
                          <input
                            className={inputClass}
                            placeholder="Kết quả then chốt..."
                            value={kr.title}
                            onChange={(e) => updateItem(oIndex, "title", e.target.value, kIndex)}
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            className={inputClass}
                            value={kr.maxScore}
                            onChange={(e) => updateItem(oIndex, "maxScore", setNonNeg(e.target.value), kIndex)}
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            className={inputClass}
                            placeholder="+2"
                            value={kr.unitScore || ""}
                            onChange={(e) => updateItem(oIndex, "unitScore", setNonNeg(e.target.value), kIndex)}
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            className={inputClass}
                            placeholder="học phần"
                            value={kr.unit || ""}
                            onChange={(e) => updateItem(oIndex, "unit", e.target.value, kIndex)}
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            className={inputClass}
                            placeholder="Target"
                            value={kr.target || ""}
                            onChange={(e) => updateItem(oIndex, "target", setNonNeg(e.target.value), kIndex)}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleAddSubKR(oIndex, kIndex)}
                          >
                            <Add fontSize="small" />
                            Sub
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteKR(oIndex, kIndex)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* === SUB-KR ROWS (Level 3: 1.1, 1.2...) === */}
                      {kr.items &&
                        kr.items.map((subKr: any, sIndex: number) => (
                          <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                            <TableRow sx={{ bgcolor: "#fafafa" }}>
                              <TableCell
                                sx={{ pl: 6, fontSize: "0.85rem" }}
                              >
                                {subKr.id}
                              </TableCell>
                              <TableCell>
                                <input
                                  className={inputClass}
                                  placeholder="Tiêu chí chi tiết..."
                                  value={subKr.title}
                                  onChange={(e) => updateItem(oIndex, "title", e.target.value, kIndex, sIndex)}
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  min="0"
                                  className={inputClass}
                                  value={subKr.maxScore}
                                  onChange={(e) => updateItem(oIndex, "maxScore", setNonNeg(e.target.value), kIndex, sIndex)}
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  min="0"
                                  className={inputClass}
                                  placeholder="+1"
                                  value={subKr.unitScore || ""}
                                  onChange={(e) => updateItem(oIndex, "unitScore", setNonNeg(e.target.value), kIndex, sIndex)}
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  className={inputClass}
                                  placeholder="đề cương"
                                  value={subKr.unit || ""}
                                  onChange={(e) => updateItem(oIndex, "unit", e.target.value, kIndex, sIndex)}
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="number"
                                  min="0"
                                  className={inputClass}
                                  value={subKr.target || ""}
                                  onChange={(e) => updateItem(oIndex, "target", setNonNeg(e.target.value), kIndex, sIndex)}
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  sx={{ fontSize: "0.7rem" }}
                                  onClick={() =>
                                    handleAddSubSubKR(oIndex, kIndex, sIndex)
                                  }
                                >
                                  <Add fontSize="small" />
                                  a,b,c
                                </Button>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    handleDeleteSubKR(oIndex, kIndex, sIndex)
                                  }
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>

                            {/* === SUB-SUB-KR ROWS (Level 4: a, b, c...) === */}
                            {renderSubSubKRRows(
                              subKr.items,
                              oIndex,
                              kIndex,
                              sIndex,
                            )}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
              {structure.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 3, color: "text.secondary" }}
                  >
                    Chưa có dữ liệu. Hãy thêm Mục tiêu lớn hoặc Import từ
                    Excel.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<Save />}
          disabled={!title}
        >
          Lưu Template
        </Button>
      </DialogActions>

      {/* Snackbar for import feedback */}
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
          icon={
            snackbar.severity === "success" ? <CheckCircle /> : undefined
          }
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
