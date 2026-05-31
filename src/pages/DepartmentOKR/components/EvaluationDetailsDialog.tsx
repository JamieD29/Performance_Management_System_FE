import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { CheckCircle, Close, Save } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface EvaluationDetailsDialogProps {
  open: boolean;
  reportData: any; // UserOkr record
  onClose: () => void;
  onSave: (updatedReport: any) => void;
}

export default function EvaluationDetailsDialog({ open, reportData, onClose, onSave }: EvaluationDetailsDialogProps) {
  const { t } = useTranslation();
  const [managerData, setManagerData] = useState<Record<string, { quantity: number; evidence?: string; score?: number }>>({});

  const structure = reportData?.keyResults || [];
  const selfReportData = reportData?.selfReportData || {};
  const isCompleted = reportData?.status === "COMPLETED";
  const isEditable = reportData?.status === "SUBMITTED";

  useEffect(() => {
    if (reportData) {
      if (reportData.managerReportData) {
        setManagerData(reportData.managerReportData);
      } else {
        // Init with self-report data quantities
        const initData: Record<string, any> = {};
        Object.keys(selfReportData).forEach((key) => {
          initData[key] = {
            quantity: selfReportData[key].quantity || 0,
            evidence: selfReportData[key].evidence || "",
            score: selfReportData[key].score || 0
          };
        });
        setManagerData(initData);
      }
    }
  }, [reportData]);

  const updateManagerQuantity = (key: string, value: string) => {
    setManagerData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        quantity: Math.max(0, Number(value) || 0)
      }
    }));
  };

  const handleTickAll = () => {
    // Fill quantity sao cho đạt max điểm.
    const newData = { ...managerData };
    structure.forEach((obj: any) => {
      obj.items?.forEach((kr: any) => {
        const krKey = `${obj.id}-${kr.id}`;
        // Tính quantity để đạt max score
        const unitScore = Number(kr.unitScore) || 1;
        const maxScore = Number(kr.maxScore) || 0;
        const targetQty = maxScore > 0 ? Math.ceil(maxScore / unitScore) : (newData[krKey]?.quantity || 1);
        newData[krKey] = { ...newData[krKey], quantity: targetQty };

        kr.items?.forEach((sub: any) => {
          const subKey = `${obj.id}-${kr.id}-${sub.id}`;
          const subUnitScore = Number(sub.unitScore) || 1;
          const subMaxScore = Number(sub.maxScore) || 0;
          const subTargetQty = subMaxScore > 0 ? Math.ceil(subMaxScore / subUnitScore) : (newData[subKey]?.quantity || 1);
          newData[subKey] = { ...newData[subKey], quantity: subTargetQty };

          sub.items?.forEach((subsub: any) => {
            const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
            const subsubUnitScore = Number(subsub.unitScore) || 1;
            const subsubMaxScore = Number(subsub.maxScore) || 0;
            const subsubTargetQty = subsubMaxScore > 0 ? Math.ceil(subsubMaxScore / subsubUnitScore) : (newData[subsubKey]?.quantity || 1);
            newData[subsubKey] = { ...newData[subsubKey], quantity: subsubTargetQty };
          });
        });
      });
    });
    setManagerData(newData);
  };

  const handleCopySelfScore = () => {
    const newData: Record<string, any> = {};
    Object.keys(selfReportData).forEach((key) => {
      newData[key] = {
        quantity: selfReportData[key].quantity || 0,
        evidence: selfReportData[key].evidence || "",
      };
    });
    setManagerData(newData);
  };

  // Tính điểm hiện tại của Manager ở FE để preview
  const calcObjectiveScore = (obj: any, dataSrc: Record<string, any>) => {
    let total = 0;
    obj.items?.forEach((kr: any) => {
      const krKey = `${obj.id}-${kr.id}`;
      const qty = Number(dataSrc[krKey]?.quantity) || 0;
      const unitScore = Number(kr.unitScore) || 0;
      const score = Math.min(unitScore > 0 ? qty * unitScore : qty, Number(kr.maxScore) || Infinity);
      total += score;

      kr.items?.forEach((sub: any) => {
        const subKey = `${obj.id}-${kr.id}-${sub.id}`;
        const sQty = Number(dataSrc[subKey]?.quantity) || 0;
        const sUnitScore = Number(sub.unitScore) || 0;
        const sScore = Math.min(sUnitScore > 0 ? sQty * sUnitScore : sQty, Number(sub.maxScore) || Infinity);
        total += sScore;

        sub.items?.forEach((subsub: any) => {
          const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
          const ssQty = Number(dataSrc[subsubKey]?.quantity) || 0;
          const ssUnitScore = Number(subsub.unitScore) || 0;
          const ssScore = Math.min(ssUnitScore > 0 ? ssQty * ssUnitScore : ssQty, Number(subsub.maxScore) || Infinity);
          total += ssScore;
        });
      });
    });
    const max = Number(obj.maxScore) || 0;
    return max > 0 ? Math.min(total, max) : total;
  };

  const calculateTotalManagerScore = () => {
    let grandTotal = 0;
    structure.forEach((obj: any) => {
      grandTotal += calcObjectiveScore(obj, managerData);
    });
    return grandTotal;
  };

  const handleSave = () => {
    const updatedReport = {
      ...reportData,
      managerReportData: managerData
    };
    onSave(updatedReport);
  };

  if (!reportData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color="#1e293b">
            {t("evaluationDetailsDialog.dialogTitle")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t("evaluationDetailsDialog.objectiveLabel")}: {reportData.objective}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><Close /></IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ bgcolor: "#f8fafc", p: 3 }}>
        {/* User Info Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: "#1C4D8D" }}>
            {reportData.user?.name?.[0] || "?"}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} color="#0f172a">
              {reportData.user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("evaluationDetailsDialog.departmentLabel")}: {reportData.user?.department?.name || "N/A"} • Email: {reportData.user?.email}
            </Typography>
          </Box>

          {isEditable && (
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Tooltip title={t("evaluationDetailsDialog.approveAllTooltip")}>
                <Button variant="outlined" size="small" onClick={handleCopySelfScore}>
                  {t("evaluationDetailsDialog.approveAllSelf")}
                </Button>
              </Tooltip>
              <Tooltip title={t("evaluationDetailsDialog.tickAllTooltip")}>
                <Button variant="contained" color="success" size="small" startIcon={<CheckCircle />} onClick={handleTickAll}>
                  {t("evaluationDetailsDialog.tickAll")}
                </Button>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Evaluation Table */}
        <Typography variant="subtitle1" fontWeight={600} color="#1e293b" sx={{ mb: 1.5 }}>
          {t("evaluationDetailsDialog.sectionTitle")}
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "5%" }}>{t("evaluationDetailsDialog.headers.no")}</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "25%" }}>{t("evaluationDetailsDialog.headers.criteria")}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "8%" }}>{t("evaluationDetailsDialog.headers.maxScore")}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "8%" }}>{t("evaluationDetailsDialog.headers.scorePerUnit")}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "8%", color: "#64748b" }}>{t("evaluationDetailsDialog.headers.selfReportQty")}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "8%", color: "#64748b" }}>{t("evaluationDetailsDialog.headers.selfReportScore")}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "12%" }}>{t("evaluationDetailsDialog.headers.evidence")}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "10%", color: "#1C4D8D" }}>{t("evaluationDetailsDialog.headers.managerQty")}</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", width: "8%", color: "#1C4D8D" }}>{t("evaluationDetailsDialog.headers.managerScore")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {structure.map((obj: any, oIndex: number) => {
                const selfObjScore = calcObjectiveScore(obj, selfReportData);
                const mgrObjScore = calcObjectiveScore(obj, managerData);

                return (
                  <React.Fragment key={obj.id || oIndex}>
                    {/* Mục Tiêu Chính (Objective) */}
                    <TableRow sx={{ bgcolor: "#dbeafe" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>{obj.id}</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{obj.title}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>{obj.maxScore}</TableCell>
                      <TableCell align="center">—</TableCell>
                      <TableCell align="center">—</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold", color: "#64748b" }}>
                        {selfObjScore.toFixed(1)} / {obj.maxScore || 0}
                      </TableCell>
                      <TableCell align="center">—</TableCell>
                      <TableCell align="center">—</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold", color: "#1C4D8D" }}>
                        {reportData.status === "ACCEPTED" ? "—" : `${mgrObjScore.toFixed(1)} / ${obj.maxScore || 0}`}
                      </TableCell>
                    </TableRow>

                    {/* KRs */}
                    {obj.items?.map((kr: any, kIndex: number) => {
                      const krKey = `${obj.id}-${kr.id}`;
                      const selfKrObj = selfReportData[krKey] || {};

                      const mgrQty = managerData[krKey]?.quantity || 0;
                      const mgrCalcScore = Math.min(
                        (Number(kr.unitScore) > 0 ? mgrQty * Number(kr.unitScore) : mgrQty),
                        Number(kr.maxScore) || Infinity
                      );

                      return (
                        <React.Fragment key={`${oIndex}-${kIndex}`}>
                          <TableRow sx={{ bgcolor: "#f8fafc" }}>
                            <TableCell sx={{ pl: 3 }}>{kr.id}</TableCell>
                            <TableCell>{kr.title}</TableCell>
                            <TableCell align="center">{kr.maxScore}</TableCell>
                            <TableCell align="center">
                              {kr.unitScore ? <Chip label={`+${kr.unitScore}/${kr.unit || t("evaluationDetailsDialog.unitFallback")}`} size="small" color="primary" variant="outlined" /> : "—"}
                            </TableCell>
                            <TableCell align="center" sx={{ color: "#64748b" }}>{selfKrObj.quantity || 0}</TableCell>
                            <TableCell align="center" sx={{ color: "#64748b", fontWeight: 500 }}>{selfKrObj.score?.toFixed(1) || 0}</TableCell>
                            <TableCell align="center">
                              {selfKrObj.evidence ? (
                                <Tooltip title={selfKrObj.evidence}>
                                  <Button size="small" variant="text" href={selfKrObj.evidence} target="_blank" sx={{ minWidth: 0, textTransform: 'none' }}>
                                    {t("evaluationDetailsDialog.evidenceLink")}
                                  </Button>
                                </Tooltip>
                              ) : "—"}
                            </TableCell>

                            <TableCell align="center">
                              {!isEditable ? (
                                <Typography fontWeight="bold" color="#1C4D8D">
                                  {reportData.status === "ACCEPTED" ? "—" : mgrQty}
                                </Typography>
                              ) : (
                                <TextField
                                  size="small"
                                  type="number"
                                  variant="outlined"
                                  value={mgrQty}
                                  onChange={(e) => updateManagerQuantity(krKey, e.target.value)}
                                  inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 'bold', color: '#1C4D8D', padding: '4px' } }}
                                  sx={{ width: "60px", bgcolor: "#fff" }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#1C4D8D" }}>
                              {reportData.status === "ACCEPTED" ? "—" : mgrCalcScore.toFixed(1)}
                            </TableCell>
                          </TableRow>

                          {/* Sub-KRs */}
                          {kr.items?.map((sub: any, sIndex: number) => {
                            const subKey = `${obj.id}-${kr.id}-${sub.id}`;
                            const selfSubObj = selfReportData[subKey] || {};

                            const mgrSubQty = managerData[subKey]?.quantity || 0;
                            const mgrSubCalcScore = Math.min(
                              (Number(sub.unitScore) > 0 ? mgrSubQty * Number(sub.unitScore) : mgrSubQty),
                              Number(sub.maxScore) || Infinity
                            );

                            return (
                              <React.Fragment key={`${oIndex}-${kIndex}-${sIndex}`}>
                                <TableRow>
                                  <TableCell sx={{ pl: 6, fontSize: "0.85rem" }}>{sub.id}</TableCell>
                                  <TableCell sx={{ fontSize: "0.9rem" }}>{sub.title}</TableCell>
                                  <TableCell align="center">{sub.maxScore}</TableCell>
                                  <TableCell align="center">
                                    {sub.unitScore ? <Chip label={`+${sub.unitScore}/${sub.unit || t("evaluationDetailsDialog.unitFallback")}`} size="small" variant="outlined" /> : "—"}
                                  </TableCell>
                                  <TableCell align="center" sx={{ color: "#64748b" }}>{selfSubObj.quantity || 0}</TableCell>
                                  <TableCell align="center" sx={{ color: "#64748b" }}>{selfSubObj.score?.toFixed(1) || 0}</TableCell>
                                  <TableCell align="center">
                                    {selfSubObj.evidence ? (
                                      <Tooltip title={selfSubObj.evidence}>
                                        <Button size="small" variant="text" href={selfSubObj.evidence} target="_blank" sx={{ minWidth: 0, textTransform: 'none' }}>
                                          {t("evaluationDetailsDialog.evidenceLink")}
                                        </Button>
                                      </Tooltip>
                                    ) : "—"}
                                  </TableCell>

                                  <TableCell align="center">
                                    {!isEditable ? (
                                      <Typography fontWeight="bold" color="#1C4D8D">
                                        {reportData.status === "ACCEPTED" ? "—" : mgrSubQty}
                                      </Typography>
                                    ) : (
                                      <TextField
                                        size="small"
                                        type="number"
                                        variant="outlined"
                                        value={mgrSubQty}
                                        onChange={(e) => updateManagerQuantity(subKey, e.target.value)}
                                        inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 'bold', color: '#1C4D8D', padding: '4px' } }}
                                        sx={{ width: "60px", bgcolor: "#fff" }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell align="center" sx={{ fontWeight: "bold", color: "#1C4D8D" }}>
                                    {reportData.status === "ACCEPTED" ? "—" : mgrSubCalcScore.toFixed(1)}
                                  </TableCell>
                                </TableRow>

                                {/* Sub-Sub-KRs */}
                                {sub.items?.map((subsub: any, ssIndex: number) => {
                                  const subsubKey = `${obj.id}-${kr.id}-${sub.id}-${subsub.id}`;
                                  const selfSubSubObj = selfReportData[subsubKey] || {};

                                  const mgrSubSubQty = managerData[subsubKey]?.quantity || 0;
                                  const mgrSubSubCalcScore = Math.min(
                                    (Number(subsub.unitScore) > 0 ? mgrSubSubQty * Number(subsub.unitScore) : mgrSubSubQty),
                                    Number(subsub.maxScore) || Infinity
                                  );

                                  return (
                                    <TableRow key={`${oIndex}-${kIndex}-${sIndex}-${ssIndex}`} sx={{ bgcolor: "#fffbeb" }}>
                                      <TableCell sx={{ pl: 9, fontSize: "0.8rem" }}>{subsub.id}</TableCell>
                                      <TableCell sx={{ fontSize: "0.85rem" }}>{subsub.title}</TableCell>
                                      <TableCell align="center">—</TableCell>
                                      <TableCell align="center">
                                        {subsub.unitScore ? <Chip label={`+${subsub.unitScore}/${subsub.unit || t("evaluationDetailsDialog.unitFallback")}`} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} /> : "—"}
                                      </TableCell>
                                      <TableCell align="center" sx={{ color: "#64748b" }}>{selfSubSubObj.quantity || 0}</TableCell>
                                      <TableCell align="center" sx={{ color: "#64748b" }}>{selfSubSubObj.score?.toFixed(1) || 0}</TableCell>
                                      <TableCell align="center">
                                        {selfSubSubObj.evidence ? (
                                          <Tooltip title={selfSubSubObj.evidence}>
                                            <Button size="small" variant="text" href={selfSubSubObj.evidence} target="_blank" sx={{ minWidth: 0, textTransform: 'none' }}>
                                              {t("evaluationDetailsDialog.evidenceLink")}
                                            </Button>
                                          </Tooltip>
                                        ) : "—"}
                                      </TableCell>

                                      <TableCell align="center">
                                        {!isEditable ? (
                                          <Typography fontWeight="bold" color="#1C4D8D">
                                            {reportData.status === "ACCEPTED" ? "—" : mgrSubSubQty}
                                          </Typography>
                                        ) : (
                                          <TextField
                                            size="small"
                                            type="number"
                                            variant="outlined"
                                            value={mgrSubSubQty}
                                            onChange={(e) => updateManagerQuantity(subsubKey, e.target.value)}
                                            inputProps={{ min: 0, style: { textAlign: 'center', fontWeight: 'bold', color: '#1C4D8D', padding: '4px' } }}
                                            sx={{ width: "60px", bgcolor: "#fff" }}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell align="center" sx={{ fontWeight: "bold", color: "#1C4D8D" }}>
                                        {reportData.status === "ACCEPTED" ? "—" : mgrSubSubCalcScore.toFixed(1)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Row Tổng Điểm */}
              <TableRow sx={{ bgcolor: "#fffbeb" }}>
                <TableCell colSpan={5} align="center" sx={{ fontWeight: "bold", color: "#b45309", fontSize: "1.05rem" }}>
                  {t("evaluationDetailsDialog.totalScoreLabel")}
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" color="#b45309" fontSize="1.1rem">
                    {reportData.totalScore?.toFixed(1) || 0}
                  </Typography>
                </TableCell>
                <TableCell align="center" colSpan={2} sx={{ fontWeight: "bold", color: "#1C4D8D", fontSize: "1.05rem", textAlign: "right" }}>
                  {t("evaluationDetailsDialog.managerScoreLabel")}
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold" color="#1C4D8D" fontSize="1.2rem">
                    {reportData.status === "ACCEPTED" ? "—" : (isCompleted ? (reportData.managerScore?.toFixed(1) || 0) : calculateTotalManagerScore().toFixed(1))}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fff", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* Employee total score */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1.5, 
            px: 2, 
            py: 1, 
            bgcolor: "#fff7ed", 
            border: "1px solid #ffedd5", 
            borderRadius: "8px" 
          }}>
            <Typography variant="body2" fontWeight={600} color="#b45309">
              {t("evaluationDetailsDialog.selfScoreLabel")}
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="#c2410c">
              {reportData.totalScore?.toFixed(1) || 0}
            </Typography>
          </Box>

          {/* Manager final score */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1.5, 
            px: 2, 
            py: 1, 
            bgcolor: "#f0fdf4", 
            border: "1px solid #dcfce7", 
            borderRadius: "8px" 
          }}>
            <Typography variant="body2" fontWeight={600} color="#15803d">
              {t("evaluationDetailsDialog.managerScoreLabel")}
            </Typography>
            <Typography variant="h6" fontWeight={800} color="#166534">
              {reportData.status === "ACCEPTED" ? "—" : (isCompleted ? (reportData.managerScore?.toFixed(1) || 0) : calculateTotalManagerScore().toFixed(1))}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            {t("evaluationDetailsDialog.cancelBtn")}
          </Button>
          {isEditable && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSave}
              sx={{ px: 3, fontWeight: "bold" }}
            >
              {t("evaluationDetailsDialog.saveBtn")}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
