import React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface AddCriteriaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  parentType: 'KR' | 'SUBKR' | null;
  title: string;
  setTitle: (val: string) => void;
  unitScore: string;
  setUnitScore: (val: string) => void;
  unit: string;
  setUnit: (val: string) => void;
}

const AddCriteriaDialog: React.FC<AddCriteriaDialogProps> = ({
  open,
  onClose,
  onSave,
  parentType,
  title,
  setTitle,
  unitScore,
  setUnitScore,
  unit,
  setUnit,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {parentType === 'KR'
          ? t("departmentOkr.managerTree.addCriteriaDialog.titleCriteria")
          : t("departmentOkr.managerTree.addCriteriaDialog.titleSubCriteria")}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField 
            label={t("departmentOkr.managerTree.addCriteriaDialog.contentLabel")} 
            fullWidth 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label={t("departmentOkr.managerTree.addCriteriaDialog.unitScoreLabel")} 
              type="number" 
              fullWidth 
              value={unitScore} 
              onChange={(e) => setUnitScore(e.target.value)} 
              onKeyDown={(e) => {
                if (["-", ".", "e", "E", "+", ","].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            <TextField 
              label={t("departmentOkr.managerTree.addCriteriaDialog.unitLabel")} 
              fullWidth 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              placeholder={t("departmentOkr.managerTree.addCriteriaDialog.unitPlaceholder")}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("departmentOkr.managerTree.addCriteriaDialog.cancelBtn")}</Button>
        <Button variant="contained" onClick={onSave}>{t("departmentOkr.managerTree.addCriteriaDialog.saveBtn")}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCriteriaDialog;
