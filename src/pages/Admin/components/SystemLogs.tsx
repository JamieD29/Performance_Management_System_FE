import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { Search, Refresh, DeleteForever } from "@mui/icons-material";
import { api } from "../../../services/api";
import { useTranslation } from "react-i18next";

// --- INTERFACE ---
interface SystemLog {
  id: string;
  action: string;
  resource: string;
  message: string;
  status: "SUCCESS" | "FAILED";
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function SystemLogs() {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Hàm gọi API lấy log từ Backend
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/system-logs");
      const logData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLogs(logData);
    } catch (error) {
      console.error(t("systemLogs.errors.fetch"), error);
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ logs
  const handleClearAll = async () => {
    setDeleting(true);
    try {
      await api.delete("/system-logs");
      setLogs([]);
      setPage(0);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(t("systemLogs.errors.clear"), error);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Format màu sắc
  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
      case "LOGIN":
        return "success";
      case "UPDATE":
        return "info";
      case "DELETE":
      case "LOGOUT":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) =>
    status === "SUCCESS" ? "success" : "error";

  // Logic lọc dữ liệu
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = filterAction === "ALL" || log.action === filterAction;
    return matchSearch && matchAction;
  });

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterAction]);

  // Pagination: cắt dữ liệu cho trang hiện tại
  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      {/* HEADER TÌM KIẾM & LỌC */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          border: "1px solid #cbd5e1",
          borderRadius: 3,
          bgcolor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("systemLogs.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("systemLogs.actionLabel")}</InputLabel>
              <Select
                value={filterAction}
                label={t("systemLogs.actionLabel")}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <MenuItem value="ALL">{t("systemLogs.actions.all")}</MenuItem>
                <MenuItem value="CREATE">{t("systemLogs.actions.create")}</MenuItem>
                <MenuItem value="UPDATE">{t("systemLogs.actions.update")}</MenuItem>
                <MenuItem value="DELETE">{t("systemLogs.actions.delete")}</MenuItem>
                <MenuItem value="LOGIN">{t("systemLogs.actions.login")}</MenuItem>
                <MenuItem value="LOGOUT">{t("systemLogs.actions.logout")}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            size={{ xs: 6, md: 2 }}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLogs}
              fullWidth
              sx={{
                whiteSpace: "nowrap",
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.8rem",
                border: "1.5px solid #94a3b8",
                color: "#475569",
                transition: "all 0.2s ease",
                "&:hover": {
                  border: "1.5px solid #3b82f6",
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.2)",
                },
              }}
            >
              {t("systemLogs.refreshBtn")}
            </Button>
          </Grid>
          <Grid
            size={{ xs: 6, md: 2 }}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteForever />}
              onClick={() => setDeleteDialogOpen(true)}
              fullWidth
              disabled={logs.length === 0}
              sx={{
                whiteSpace: "nowrap",
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.8rem",
                border: "1.5px solid #fca5a5",
                transition: "all 0.2s ease",
                "&:hover": {
                  border: "1.5px solid #ef4444",
                  bgcolor: "#fef2f2",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(239,68,68,0.2)",
                },
              }}
            >
              {t("systemLogs.clearAllBtn")}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* BẢNG DỮ LIỆU */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          maxHeight: "calc(100vh - 340px)",
          overflow: "auto",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  bgcolor: "#1e293b",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "3px solid #3b82f6",
                },
              }}
            >
              <TableCell width="15%">{t("systemLogs.table.time")}</TableCell>
              <TableCell width="20%">{t("systemLogs.table.user")}</TableCell>
              <TableCell width="15%">{t("systemLogs.table.action")}</TableCell>
              <TableCell width="35%">{t("systemLogs.table.details")}</TableCell>
              <TableCell width="10%" align="center">
                {t("systemLogs.table.status")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 5, color: "text.secondary" }}
                >
                  {t("systemLogs.table.empty")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => (
                <TableRow key={log.id} hover sx={{ "& td": { py: 1.5 } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(log.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.createdAt).toLocaleTimeString(i18n.language === "vi" ? "vi-VN" : "en-US")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {log.user?.name || t("systemLogs.table.systemUser")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.user?.email || t("systemLogs.table.systemEmail")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.action}
                      size="small"
                      color={getActionColor(log.action) as any}
                      sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.message}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={log.status}
                      size="small"
                      variant="outlined"
                      color={getStatusColor(log.status) as any}
                      sx={{ fontSize: "0.7rem", fontWeight: "bold" }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <TablePagination
        component="div"
        count={filteredLogs.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage={t("systemLogs.pagination.rowsPerPage")}
        labelDisplayedRows={({ from, to, count }) =>
          t("systemLogs.pagination.displayedRows", { from, to, count })
        }
        sx={{
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
          borderRadius: "0 0 8px 8px",
        }}
      />

      {/* DIALOG XÁC NHẬN XÓA */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#dc2626" }}>
          {t("systemLogs.dialog.title")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("systemLogs.dialog.content", { count: logs.length })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            {t("systemLogs.dialog.cancel")}
          </Button>
          <Button
            onClick={handleClearAll}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteForever />
              )
            }
          >
            {deleting ? t("systemLogs.dialog.deleting") : t("systemLogs.dialog.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
