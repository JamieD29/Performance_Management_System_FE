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
} from "@mui/material";
import { Save, Add } from "@mui/icons-material";
import { useTemplateStructure } from "../hooks/useTemplateStructure";
import { ObjectiveRow, KeyResultRow, SubKRRow, SubSubKRRow } from "./RowComponents";
import { motion, AnimatePresence } from "framer-motion";

interface VariantEditorDialogProps {
  open: boolean;
  onClose: () => void;
  baseTemplate: any;
  onSaveVariant: (variant: any) => void;
}

export default function VariantEditorDialog({
  open,
  onClose,
  baseTemplate,
  onSaveVariant,
}: VariantEditorDialogProps) {
  const [title, setTitle] = useState("");

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

  useEffect(() => {
    if (open && baseTemplate) {
      setTitle(`${baseTemplate.title} (Tùy biến)`);
      // Deep copy structure
      setStructure(JSON.parse(JSON.stringify(baseTemplate.structure || [])));
    }
  }, [open, baseTemplate]);

  const handleSubmit = () => {
    onSaveVariant({
      id: "v_" + Date.now(),
      title,
      structure,
      isNew: true,
    });
    onClose();
  };

  const isFormValid = useMemo(() => {
    return title.trim() !== "" && structure.length > 0;
  }, [title, structure]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <DialogTitle sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
          Tạo Phiên bản Tùy biến OKR
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ mb: 4, mt: 1 }}>
          <TextField
            fullWidth
            label="Tên Phiên bản (VD: OKR dành cho Phó Bộ môn)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            variant="outlined"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Tùy chỉnh Cấu trúc OKR</Typography>
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
                <TableCell width="120">Đơn vị</TableCell>
                <TableCell width="150">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence>
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
              </AnimatePresence>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} startIcon={<Save />} disabled={!isFormValid}>
          Lưu Phiên bản
        </Button>
      </DialogActions>
      </motion.div>
    </Dialog>
  );
}
