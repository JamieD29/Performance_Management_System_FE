// src/components/common/ConfirmDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import {
  WarningAmberRounded,
  DeleteOutline,
  InfoOutlined,
  Close,
} from "@mui/icons-material";

// Định nghĩa các loại Modal (màu sắc & icon)
const VARIANTS = {
  danger: {
    color: "error" as const,
    icon: <DeleteOutline sx={{ fontSize: 40, color: "error.main" }} />,
    titleColor: "error.main",
  },
  warning: {
    color: "warning" as const,
    icon: <WarningAmberRounded sx={{ fontSize: 40, color: "warning.main" }} />,
    titleColor: "warning.main",
  },
  info: {
    color: "primary" as const,
    icon: <InfoOutlined sx={{ fontSize: 40, color: "primary.main" }} />,
    titleColor: "primary.main",
  },
};

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  variant?: "danger" | "warning" | "info";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  variant = "danger",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  isLoading = false,
}) => {
  const config = VARIANTS[variant];

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, padding: 1 }, // Bo tròn và padding cho đẹp
      }}
    >
      {/* Nút tắt nhanh góc phải */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        disabled={isLoading}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>

      {/* Phần Icon & Title */}
      <DialogTitle sx={{ textAlign: "center", pb: 0, pt: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Box
            sx={{
              bgcolor: `${config.color}.light`,
              p: 2,
              borderRadius: "50%",
              background: (theme) => theme.palette[config.color].light + "20", // Màu nền nhạt (opacity 20%)
            }}
          >
            {config.icon}
          </Box>
          <Typography variant="h6" component="span" fontWeight="bold">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      {/* Nội dung thông báo */}
      <DialogContent sx={{ textAlign: "center", py: 2 }}>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>

      {/* Nút hành động */}
      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={isLoading}
          fullWidth
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {cancelText}
        </Button>

        <Button
          variant="contained"
          color={config.color}
          onClick={onConfirm}
          disabled={isLoading}
          fullWidth
          disableElevation
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isLoading ? "Đang xử lý..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
