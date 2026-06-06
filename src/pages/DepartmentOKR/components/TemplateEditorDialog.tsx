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
import { showSuccess, showError } from "../../../utils/swal";
import { useTemplateStructure } from "../hooks/useTemplateStructure";
import { ObjectiveRow, KeyResultRow, SubKRRow, SubSubKRRow } from "./RowComponents";
import { parseExcelToStructure } from "../../../utils/excelParser";
import { useTranslation } from "react-i18next";

export const validateStructureScores = (items: any[], t?: (key: string, opts?: any) => string): string | null => {
  if (!items || items.length === 0) {
    return t ? t("departmentOkr.templateEditor.validation.emptyStructure") : "Cấu trúc OKR phải có ít nhất 1 Mục tiêu (Objective).";
  }

  let totalMaxScore = 0;

  for (const obj of items) {
    const objMaxScore = Number(obj.maxScore) || 0;
    if (objMaxScore < 0) {
      return t
        ? t("departmentOkr.templateEditor.validation.negativeMaxScore", { title: obj.title || obj.id })
        : `Điểm số tối đa của Mục tiêu "${obj.title || obj.id}" không được là số âm.`;
    }
    totalMaxScore += objMaxScore;

    if (!obj.items || obj.items.length === 0) {
      return t
        ? t("departmentOkr.templateEditor.validation.emptyKR", { title: obj.title || obj.id })
        : `Mục tiêu lớn "${obj.title || obj.id}" phải có ít nhất 1 Kết quả then chốt (KR).`;
    }

    // Traverse and check children recursively
    const checkDescendants = (parent: any): string | null => {
      if (!parent.items || parent.items.length === 0) return null;

      let childrenTotal = 0;
      for (const child of parent.items) {
        const childMaxScore = Number(child.maxScore) || 0;
        const childUnitScore = Number(child.unitScore) || 0;

        if (childMaxScore < 0) {
          return t
            ? t("departmentOkr.templateEditor.validation.negativeChildMax", { title: child.title || child.id })
            : `Điểm tối đa của "${child.title || child.id}" không được là số âm.`;
        }
        if (childUnitScore < 0) {
          return t
            ? t("departmentOkr.templateEditor.validation.negativeChildUnit", { title: child.title || child.id })
            : `Điểm/Đơn vị của "${child.title || child.id}" không được là số âm.`;
        }

        if (childUnitScore > objMaxScore) {
          return t
            ? t("departmentOkr.templateEditor.validation.unitExceedsObjMax", { childTitle: child.title || child.id, childScore: childUnitScore, objTitle: obj.title || obj.id, objScore: objMaxScore })
            : `Điểm/Đơn vị của Tiêu chí "${child.title || child.id}" (${childUnitScore}) không được vượt quá Điểm tối đa của Mục tiêu lớn "${obj.title || obj.id}" (${objMaxScore}).`;
        }

        childrenTotal += childMaxScore;

        const err = checkDescendants(child);
        if (err) return err;
      }

      const parentMaxScore = Number(parent.maxScore) || 0;
      if (childrenTotal > 0 && childrenTotal !== parentMaxScore) {
        if (childrenTotal > parentMaxScore) {
          return t
            ? t("departmentOkr.templateEditor.validation.childrenExceedParent", { title: parent.title || parent.id, childTotal: childrenTotal, parentMax: parentMaxScore })
            : `Tổng điểm tối đa của các mục con thuộc "${parent.title || parent.id}" (${childrenTotal}) không được vượt quá điểm tối đa của mục "${parent.title || parent.id}" (${parentMaxScore}).`;
        } else {
          return t
            ? t("departmentOkr.templateEditor.validation.childrenBelowParent", { title: parent.title || parent.id, childTotal: childrenTotal, parentMax: parentMaxScore })
            : `Tổng điểm tối đa của các mục con thuộc "${parent.title || parent.id}" (${childrenTotal}) không được nhỏ hơn điểm tối đa của mục "${parent.title || parent.id}" (${parentMaxScore}) (phải bằng chính xác ${parentMaxScore}).`;
        }
      }
      return null;
    };

    const err = checkDescendants(obj);
    if (err) return err;
  }

  if (totalMaxScore !== 100) {
    return t
      ? t("departmentOkr.templateEditor.validation.totalNot100", { total: totalMaxScore })
      : `Tổng điểm tối đa (maxScore) của tất cả các Mục tiêu lớn phải chính xác bằng 100. Hiện tại đang là ${totalMaxScore}.`;
  }

  return null;
};

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
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [positionId, setPositionId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
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
      const jtRes = await api.get("/okr-templates/job-titles");
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
        message: t("departmentOkr.templateEditor.importSuccess"),
        severity: "success",
      });
    } catch (error: any) {
      console.error("Excel parse error:", error);
      setSnackbar({
        open: true,
        message: error.message || t("departmentOkr.templateEditor.importError"),
        severity: "error",
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    const validationError = validateStructureScores(structure, t);
    if (validationError) {
      showError(t("departmentOkr.templateEditor.swal.validationErrorTitle"), validationError);
      return;
    }

    try {
      const payload = {
        title,
        positionId: positionId || null,
        jobTitle: jobTitle || null,
        structure: structure,
      };

      if (template?.id) {
        const res = await api.put(`/okr-templates/${template.id}`, payload);
        showSuccess(t("departmentOkr.templateEditor.swal.successTitle"), res.data?.message || t("departmentOkr.templateEditor.swal.successUpdate"));
      } else {
        const res = await api.post("/okr-templates", payload);
        showSuccess(t("departmentOkr.templateEditor.swal.successTitle"), res.data?.message || t("departmentOkr.templateEditor.swal.successCreate"));
      }
      onRefresh();
      onClose();
    } catch (error: any) {
      console.error(error);
      showError(t("departmentOkr.templateEditor.swal.errorTitle"), error.response?.data?.message || t("departmentOkr.templateEditor.swal.errorSave"));
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
            {template ? t("departmentOkr.templateEditor.titleEdit") : t("departmentOkr.templateEditor.titleCreate")}
          </Typography>
          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFile />}
              sx={{ mr: 1 }}
            >
              {t("departmentOkr.templateEditor.importExcel")}
              <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileUpload} />
            </Button>
            <Tooltip title={t("departmentOkr.templateEditor.downloadSampleTooltip")}>
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
            label={t("departmentOkr.templateEditor.templateNameLabel")}
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
            <InputLabel>{t("departmentOkr.templateEditor.jobTitleLabel")}</InputLabel>
            <Select
              value={jobTitle}
              label={t("departmentOkr.templateEditor.jobTitleLabel")}
              onChange={(e) => setJobTitle(e.target.value)}
            >
              <MenuItem value="Tất cả">{t("departmentOkr.templateEditor.jobTitleAll")}</MenuItem>
              {jobTitles.map((jt) => (
                <MenuItem key={jt.value} value={jt.value}>{jt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">{t("departmentOkr.templateEditor.structureTitle")}</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddObjective}>
            {t("departmentOkr.templateEditor.addObjectiveBtn")}
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell width="60">{t("departmentOkr.templateEditor.tableCode")}</TableCell>
                <TableCell>{t("departmentOkr.templateEditor.tableContent")}</TableCell>
                <TableCell width="120">{t("departmentOkr.templateEditor.tableMaxScore")}</TableCell>
                <TableCell width="120">{t("departmentOkr.templateEditor.tableUnitScore")}</TableCell>
                <TableCell width="120">
                  {t("departmentOkr.templateEditor.tableUnit")}
                  <Tooltip title={t("departmentOkr.templateEditor.tableUnitTooltip")}>
                    <HelpOutline sx={{ fontSize: 16, ml: 0.5, color: "text.secondary", cursor: "pointer", verticalAlign: "middle" }} />
                  </Tooltip>
                </TableCell>
                <TableCell width="150">{t("departmentOkr.templateEditor.tableActions")}</TableCell>
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
                    {t("departmentOkr.templateEditor.emptyState")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">{t("departmentOkr.templateEditor.cancelBtn")}</Button>
        <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} disabled={!isFormValid}>
          {t("departmentOkr.templateEditor.saveBtn")}
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
