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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {parentType === 'KR' ? 'Thêm Tiêu chí mới' : 'Thêm Tiêu chí con mới'}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField 
            label="Nội dung tiêu chí" 
            fullWidth 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Điểm / Đơn vị" 
              type="number" 
              fullWidth 
              value={unitScore} 
              onChange={(e) => setUnitScore(e.target.value)} 
            />
            <TextField 
              label="Đơn vị tính" 
              fullWidth 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              placeholder="VD: bài, đv, giờ..."
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={onSave}>Lưu tạm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCriteriaDialog;
