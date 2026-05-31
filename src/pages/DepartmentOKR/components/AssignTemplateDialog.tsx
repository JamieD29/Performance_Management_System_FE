import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Checkbox,
  Alert,
  TablePagination,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Send, PersonSearch, SelectAll, Deselect, AddCircleOutline, Search, Clear } from "@mui/icons-material";
import { api } from "../../../services/api";
import { showWarning, showSuccess, showError } from "../../../utils/swal";
import { performanceService } from "../../../services/performanceService";
import VariantEditorDialog from "./VariantEditorDialog";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

interface AssignTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: any; // The template being assigned
}

export default function AssignTemplateDialog({
  open,
  onClose,
  template,
}: AssignTemplateDialogProps) {
  const { t } = useTranslation();
  const loggedInUserStr = localStorage.getItem("user");
  const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
  const isDonVi = loggedInUser?.managementPosition?.permissionLevel === "DON_VI";

  const [users, setUsers] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [userAssignments, setUserAssignments] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [openVariantEditor, setOpenVariantEditor] = useState(false);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);

  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterPositionId, setFilterPositionId] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");
  const [searchName, setSearchName] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [filterDepartmentId, filterPositionId, filterJobTitle, searchName]);

  useEffect(() => {
    if (open && template) {
      setFilterPositionId(template?.positionId || "");
      setFilterJobTitle(template?.jobTitle || "");
      setFilterDepartmentId(isDonVi ? loggedInUser?.department?.id || "" : "");

      setSearchName("");
      loadData();
      setVariants([{ id: "base", title: "Phiên bản Gốc (Mặc định)", structure: template.structure }]);
      setUserAssignments({});
    }
  }, [open, template]);

  // Tự động gán và giới hạn hạn chót chốt OKR
  useEffect(() => {
    if (selectedCycleId) {
      const cycle = cycles.find((c: any) => c.id === selectedCycleId);
      if (cycle?.startDate) {
        const maxDate = dayjs(cycle.startDate).subtract(3, "day");
        const today = dayjs().startOf("day");
        if (maxDate.isBefore(today)) {
          setDeadline("");
        } else {
          setDeadline(maxDate.format("YYYY-MM-DD"));
        }
      } else {
        setDeadline("");
      }
    } else {
      setDeadline("");
    }
  }, [selectedCycleId, cycles]);

  // Fetch users already assigned an OKR in the selected cycle
  useEffect(() => {
    const fetchAssignedUsers = async () => {
      if (!selectedCycleId) {
        setAssignedUserIds([]);
        return;
      }
      try {
        const res = await api.get(`/okrs/assigned-users?cycleId=${selectedCycleId}`);
        const list = res.data || [];
        setAssignedUserIds(list);
        
        // Clear these users from userAssignments if they were selected
        setUserAssignments((prev) => {
          const next = { ...prev };
          let changed = false;
          list.forEach((uid: string) => {
            if (next[uid]) {
              delete next[uid];
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      } catch (error) {
        console.error("Error fetching assigned users:", error);
      }
    };
    fetchAssignedUsers();
  }, [selectedCycleId]);

  const loadData = async () => {
    try {
      setLoadingUsers(true);

      // Fetch all users to support client-side filtering
      const usersRes = await api.get("/users/filter-by-role");
      setUsers(usersRes.data || []);

      // Fetch evaluation cycles
      const cyclesData = await performanceService.getCycles();
      setCycles(cyclesData || []);
    } catch (error) {
      console.error("Error loading data for assignment", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssignVariant = (userId: string, variantId: string) => {
    setUserAssignments((prev) => {
      const next = { ...prev };
      if (!variantId) delete next[userId];
      else next[userId] = variantId;
      return next;
    });
  };

  const handleSelectAll = () => {
    const selectableUsers = filteredUsers.filter((u) => !assignedUserIds.includes(u.id));
    const assignedSelectableCount = selectableUsers.filter((u) => !!userAssignments[u.id]).length;
    
    if (assignedSelectableCount === selectableUsers.length && selectableUsers.length > 0) {
      // Bỏ chọn tất cả các user khả dụng
      setUserAssignments((prev) => {
        const next = { ...prev };
        selectableUsers.forEach((u) => delete next[u.id]);
        return next;
      });
    } else {
      // Chọn tất cả các user khả dụng
      setUserAssignments((prev) => {
        const next = { ...prev };
        selectableUsers.forEach((u) => {
          next[u.id] = "base";
        });
        return next;
      });
    }
  };

  const handleAssign = async () => {
    const isEn = localStorage.getItem("i18nextLng") === "en";
    const assignedCount = Object.keys(userAssignments).length;
    if (assignedCount === 0 || !selectedCycleId) {
      showWarning(
        isEn ? "Missing Information" : "Thiếu thông tin",
        isEn ? "Please select at least 1 User and an Evaluation Cycle!" : "Vui lòng chọn ít nhất 1 User và Kỳ đánh giá!"
      );
      return;
    }

    if (!deadline) {
      showWarning(
        isEn ? "Missing Information" : "Thiếu thông tin",
        isEn ? "Please select the Negotiation & OKR Finalization Deadline!" : "Vui lòng chọn Hạn chót thương lượng & chốt OKR!"
      );
      return;
    }

    const today = dayjs().startOf("day");
    const dlDate = dayjs(deadline).startOf("day");
    const cycle = cycles.find((c: any) => c.id === selectedCycleId);

    if (dlDate.isBefore(today)) {
      showWarning(
        isEn ? "Invalid Deadline" : "Hạn chót không hợp lệ",
        isEn ? "The OKR finalization deadline cannot be in the past!" : "Hạn chót chốt OKR không thể nằm trong quá khứ!"
      );
      return;
    }

    if (cycle?.startDate) {
      const maxDate = dayjs(cycle.startDate).subtract(3, "day").startOf("day");
      if (dlDate.isAfter(maxDate)) {
        showWarning(
          isEn ? "Invalid Deadline" : "Hạn chót không hợp lệ",
          isEn
            ? `The deadline must be at least 3 days before the OKR cycle start date (maximum is ${maxDate.format("DD/MM/YYYY")})!`
            : `Hạn chót phải diễn ra trước ngày bắt đầu kỳ OKR ít nhất 3 ngày (tối đa là ngày ${maxDate.format("DD/MM/YYYY")})!`
        );
        return;
      }
    }
    setLoading(true);
    try {
      const variantGroups: Record<string, string[]> = {};
      Object.entries(userAssignments).forEach(([userId, varId]) => {
        if (!variantGroups[varId]) variantGroups[varId] = [];
        variantGroups[varId].push(userId);
      });

      for (const [varId, userIds] of Object.entries(variantGroups)) {
        if (varId === "base") {
          await api.post(`/okr-templates/${template.id}/apply`, {
            userIds,
            cycleId: selectedCycleId,
            deadline: deadline || undefined,
          });
        } else {
          const customVar = variants.find((v) => v.id === varId);
          if (customVar) {
            const createRes = await api.post("/okr-templates", {
              title: customVar.title,
              positionId: template.positionId || null,
              jobTitle: template.jobTitle || null,
              structure: customVar.structure,
            });
            const newTemplateId = createRes.data.id;
            await api.post(`/okr-templates/${newTemplateId}/apply`, {
              userIds,
              cycleId: selectedCycleId,
              deadline: deadline || undefined,
            });
          }
        }
      }

      showSuccess(
        isEn ? "Success!" : "Thành công!",
        isEn
          ? `OKR Template assigned to ${assignedCount} personnel.`
          : `Đã giao OKR Template cho ${assignedCount} nhân sự.`
      );
      onClose();
    } catch (error) {
      console.error("Error assigning template", error);
      showError(
        isEn ? "Error" : "Lỗi",
        isEn ? "An error occurred while assigning the template." : "Có lỗi xảy ra khi giao template."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtered users based on selected filters
  const filteredUsers = users.filter((user) => {
    if (filterDepartmentId && user.department?.id !== filterDepartmentId) return false;
    if (filterPositionId && user.managementPosition?.id !== filterPositionId) return false;
    if (filterJobTitle && user.jobTitle !== filterJobTitle) return false;
    if (searchName) {
      const searchLower = searchName.toLowerCase();
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      const emailMatch = user.email?.toLowerCase().includes(searchLower);
      if (!nameMatch && !emailMatch) return false;
    }
    return true;
  });

  const selectableUsers = filteredUsers.filter((u) => !assignedUserIds.includes(u.id));
  const assignedSelectableCount = selectableUsers.filter((u) => !!userAssignments[u.id]).length;

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Unique options for filters
  const departments = Array.from(new Set(users.map((u) => u.department?.id))).filter(Boolean).map((id) => users.find((u) => u.department?.id === id)?.department);
  const positions = Array.from(new Set(users.map((u) => u.managementPosition?.id))).filter(Boolean).map((id) => users.find((u) => u.managementPosition?.id === id)?.managementPosition);
  const jobTitles = Array.from(new Set(users.map((u) => u.jobTitle))).filter(Boolean);

  const minDeadline = dayjs().format("YYYY-MM-DD");
  const maxDeadline = selectedCycleId
    ? cycles.find((c: any) => c.id === selectedCycleId)?.startDate
      ? dayjs(cycles.find((c: any) => c.id === selectedCycleId).startDate).subtract(3, "day").format("YYYY-MM-DD")
      : ""
    : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "#1e3a8a",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Send />
        {t("assignTemplateDialog.dialogTitle")}
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ mt: 0, p: 0 }}>
        {/* Template Info — Sticky khi scroll */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            p: 2,
            bgcolor: "#eff6ff",
            borderBottom: "1px solid #bfdbfe",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {t("assignTemplateDialog.selectedTemplate")}
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
            {template?.title}
          </Typography>
          <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {template?.positionName && (
              <Chip
                label={`${t("assignTemplateDialog.tableHeaders.position")}: ${template.positionName}`}
                size="small"
                color="secondary"
              />
            )}
            {template?.jobTitle && (
              <Chip
                label={`${t("assignTemplateDialog.tableHeaders.jobTitle")}: ${template.jobTitle}`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="outlined" color="secondary" startIcon={<AddCircleOutline />} onClick={() => setOpenVariantEditor(true)}>
              {t("assignTemplateDialog.createCustomVersion")}
            </Button>
          </Box>
          {/* ═══ PHẦN 1: THÔNG TIN BẮT BUỘC ═══ */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mb: 3,
              borderColor: "#3b82f6",
              borderWidth: 2,
              borderRadius: 2,
              bgcolor: "#fafbff",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="#1e3a8a" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              {t("assignTemplateDialog.requiredInfo")}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>{t("assignTemplateDialog.cycleLabel")}</InputLabel>
                <Select
                  value={selectedCycleId}
                  label={t("assignTemplateDialog.cycleLabel")}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                >
                  {cycles.map((c: any) => {
                    const isStarted = c.startDate && new Date(new Date().setHours(0, 0, 0, 0)) >= new Date(new Date(c.startDate).setHours(0, 0, 0, 0));
                    const start = c.startDate
                      ? new Date(c.startDate).toLocaleDateString("vi-VN")
                      : "N/A";
                    const end = c.endDate
                      ? new Date(c.endDate).toLocaleDateString("vi-VN")
                      : "N/A";
                    return (
                      <MenuItem key={c.id} value={c.id} disabled={isStarted}>
                        {c.name} ({start} → {end}) [{c.status === "OPEN" ? t("assignTemplateDialog.cycleStatusOpen") : t("assignTemplateDialog.cycleStatusClosed")}]
                        {isStarted ? t("assignTemplateDialog.cycleInProgress") : ""}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={t("assignTemplateDialog.deadlineLabel")}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={t("assignTemplateDialog.deadlineHelperText", { min: dayjs().format("DD/MM/YYYY"), max: maxDeadline ? dayjs(maxDeadline).format("DD/MM/YYYY") : (localStorage.getItem("i18nextLng") === "en" ? "start date - 3 days" : "ngày bắt đầu - 3 ngày") })}
                inputProps={{
                  min: minDeadline,
                  max: maxDeadline || undefined,
                }}
              />
            </Box>
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {/* ═══ PHẦN 2: BỘ LỌC NHÂN SỰ (Tùy chọn) ═══ */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
              {t("assignTemplateDialog.filterStaff")}
              <Chip label={t("assignTemplateDialog.optionalLabel")} size="small" variant="outlined" color="default" sx={{ fontSize: "0.7rem" }} />
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                size="small"
                label={t("assignTemplateDialog.searchPlaceholder")}
                variant="outlined"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                sx={{ minWidth: 250, flex: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchName && (
                    <IconButton
                      aria-label="clear search"
                      onClick={() => setSearchName("")}
                      edge="end"
                      size="small"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>{t("assignTemplateDialog.departmentLabel")}</InputLabel>
                <Select
                  value={filterDepartmentId}
                  label={t("assignTemplateDialog.departmentLabel")}
                  onChange={(e) => {
                    setFilterDepartmentId(e.target.value);
                    setFilterPositionId("");
                    setFilterJobTitle("");
                  }}
                  disabled={isDonVi}
                >
                  <MenuItem value="">{t("assignTemplateDialog.departmentAll")}</MenuItem>
                  {departments.map((dept: any) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>{t("assignTemplateDialog.jobTitleLabel")}</InputLabel>
                <Select
                  value={filterJobTitle}
                  label={t("assignTemplateDialog.jobTitleLabel")}
                  onChange={(e) => setFilterJobTitle(e.target.value)}
                >
                  <MenuItem value="">{t("assignTemplateDialog.jobTitleAll")}</MenuItem>
                  {jobTitles.map((title: any) => (
                    <MenuItem key={title} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* ═══ PHẦN 3: BẢNG CHỌN NHÂN SỰ ═══ */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <PersonSearch color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {t("assignTemplateDialog.tableSelectStaff")}
            </Typography>
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={
                  assignedSelectableCount === selectableUsers.length && selectableUsers.length > 0 ? (
                    <Deselect />
                  ) : (
                    <SelectAll />
                  )
                }
                onClick={handleSelectAll}
                disabled={selectableUsers.length === 0}
              >
                {assignedSelectableCount === selectableUsers.length && selectableUsers.length > 0
                  ? t("assignTemplateDialog.deselectAll")
                  : t("assignTemplateDialog.selectAll")}
              </Button>
            </Box>
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: "1px solid #e2e8f0", maxHeight: 400 }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow
                  sx={{ "& th": { bgcolor: "#f1f5f9", fontWeight: "bold" } }}
                >
                  <TableCell width={50}>
                    <Checkbox
                      checked={
                        assignedSelectableCount === selectableUsers.length &&
                        selectableUsers.length > 0
                      }
                      indeterminate={
                        assignedSelectableCount > 0 &&
                        assignedSelectableCount < selectableUsers.length
                      }
                      onChange={handleSelectAll}
                      disabled={selectableUsers.length === 0}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{t("assignTemplateDialog.tableHeaders.fullName")}</TableCell>
                  <TableCell>{t("assignTemplateDialog.tableHeaders.email")}</TableCell>
                  <TableCell>{t("assignTemplateDialog.tableHeaders.department")}</TableCell>
                  <TableCell>{t("assignTemplateDialog.tableHeaders.position")}</TableCell>
                  <TableCell>{t("assignTemplateDialog.tableHeaders.jobTitle")}</TableCell>
                  <TableCell>{t("assignTemplateDialog.tableHeaders.version")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingUsers ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      {t("assignTemplateDialog.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      {t("assignTemplateDialog.noStaffFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user: any) => {
                    const isAssigned = assignedUserIds.includes(user.id);
                    return (
                      <TableRow
                        key={user.id}
                        hover={!isAssigned}
                        selected={!isAssigned && !!userAssignments[user.id]}
                        onClick={() => {
                          if (isAssigned) return;
                          if (userAssignments[user.id]) handleAssignVariant(user.id, "");
                          else handleAssignVariant(user.id, "base");
                        }}
                        sx={{
                          cursor: isAssigned ? "not-allowed" : "pointer",
                          opacity: isAssigned ? 0.75 : 1,
                          bgcolor: isAssigned ? "#fef2f2" : "inherit",
                        }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={!isAssigned && !!userAssignments[user.id]}
                            disabled={isAssigned}
                            onChange={(e) => {
                              if (isAssigned) return;
                              if (e.target.checked) handleAssignVariant(user.id, "base");
                              else handleAssignVariant(user.id, "");
                            }}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            <Avatar
                              src={user.avatarUrl}
                              sx={{ width: 28, height: 28 }}
                            >
                              {(user.name || user.email)?.[0]?.toUpperCase()}
                            </Avatar>
                            {user.name || "(Chưa đặt tên)"}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {user.department?.name ? (
                            <Chip
                              label={user.department.name}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.managementPosition?.name ? (
                            <Chip
                              label={user.managementPosition.name}
                              size="small"
                              color="secondary"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.jobTitle ? (
                            <Chip
                              label={user.jobTitle}
                              size="small"
                              color="info"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {isAssigned ? (
                            <Chip
                              label={t("assignTemplateDialog.alreadyAssigned")}
                              size="small"
                              color="error"
                              variant="filled"
                              sx={{ fontWeight: "bold" }}
                            />
                          ) : (
                            <FormControl size="small" fullWidth>
                              <Select
                                displayEmpty
                                value={userAssignments[user.id] || ""}
                                onChange={(e) => handleAssignVariant(user.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MenuItem value="">
                                  <em style={{ color: "gray" }}>-- {localStorage.getItem("i18nextLng") === "en" ? "Do not assign" : "Không giao"} --</em>
                                </MenuItem>
                                {variants.map((v) => (
                                  <MenuItem key={v.id} value={v.id} sx={{ fontWeight: v.id === "base" ? "bold" : "normal" }}>
                                    {v.title}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage={localStorage.getItem("i18nextLng") === "en" ? "Rows per page:" : "Số dòng mỗi trang:"}
            labelDisplayedRows={({ from, to, count }) =>
              localStorage.getItem("i18nextLng") === "en"
                ? `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
                : `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`
            }
          />

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, flexDirection: "column", alignItems: "stretch", gap: 2 }}>
        {/* Selection Summary */}
        {Object.keys(userAssignments).length > 0 && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: "#f0fdf4",
              borderRadius: 1,
              border: "1px solid #bbf7d0",
            }}
          >
            <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
              {localStorage.getItem("i18nextLng") === "en" ? (
                <>Selected <strong>{Object.keys(userAssignments).length}</strong> staff:</>
              ) : (
                <>✅ Đã chọn <strong>{Object.keys(userAssignments).length}</strong> nhân sự:</>
              )}
            </Typography>
            <Box
              sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
            >
              {Object.keys(userAssignments).slice(0, 10).map((id) => {
                const user = users.find((u) => u.id === id);
                const varName = variants.find(v => v.id === userAssignments[id])?.title;
                return (
                  <Chip
                    key={id}
                    label={`${user?.name || user?.email || id} (${varName})`}
                    size="small"
                    color="success"
                    variant="outlined"
                    onDelete={() => handleAssignVariant(id, "")}
                  />
                );
              })}
              {Object.keys(userAssignments).length > 10 && (
                <Chip
                  label={localStorage.getItem("i18nextLng") === "en" ? `+${Object.keys(userAssignments).length - 10} others` : `+${Object.keys(userAssignments).length - 10} người khác`}
                  size="small"
                  color="default"
                />
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={onClose} color="inherit">
            {t("assignTemplateDialog.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={Object.keys(userAssignments).length === 0 || !selectedCycleId || loading}
            startIcon={<Send />}
          >
            {loading
              ? (localStorage.getItem("i18nextLng") === "en" ? "Assigning..." : "Đang giao...")
              : t("assignTemplateDialog.assignButton", { count: Object.keys(userAssignments).length })}
          </Button>
        </Box>
      </DialogActions>

      {openVariantEditor && (
        <VariantEditorDialog
          open={openVariantEditor}
          onClose={() => setOpenVariantEditor(false)}
          baseTemplate={template}
          onSaveVariant={(variant) => {
            setVariants(prev => [...prev, variant]);
          }}
        />
      )}
    </Dialog>
  );
}
