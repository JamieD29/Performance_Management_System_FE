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
} from "@mui/material";
import { Send, PersonSearch, SelectAll, Deselect, AddCircleOutline } from "@mui/icons-material";
import { api } from "../../../services/api";
import { showWarning, showSuccess, showError } from "../../../utils/swal";
import { performanceService } from "../../../services/performanceService";
import VariantEditorDialog from "./VariantEditorDialog";

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
  const [users, setUsers] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [userAssignments, setUserAssignments] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<any[]>([]);
  const [openVariantEditor, setOpenVariantEditor] = useState(false);
  
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterPositionId, setFilterPositionId] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");

  useEffect(() => {
    if (open && template) {
      setFilterPositionId(template?.positionId || "");
      setFilterJobTitle(template?.jobTitle || "");
      setFilterDepartmentId("");
      loadData();
      setVariants([{ id: "base", title: "Phiên bản Gốc (Mặc định)", structure: template.structure }]);
      setUserAssignments({});
    }
  }, [open, template]);

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
    const assignedCount = Object.keys(userAssignments).length;
    if (assignedCount === filteredUsers.length && filteredUsers.length > 0) {
      setUserAssignments({});
    } else {
      const next: Record<string, string> = {};
      filteredUsers.forEach((u) => (next[u.id] = "base"));
      setUserAssignments(next);
    }
  };

  const handleAssign = async () => {
    const assignedCount = Object.keys(userAssignments).length;
    if (assignedCount === 0 || !selectedCycleId) {
      showWarning("Thiếu thông tin", "Vui lòng chọn ít nhất 1 User và Kỳ đánh giá!");
      return;
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
        "Thành công!",
        `Đã giao OKR Template cho ${assignedCount} nhân sự.`,
      );
      onClose();
    } catch (error) {
      console.error("Error assigning template", error);
      showError("Lỗi", "Có lỗi xảy ra khi giao template.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered users based on selected filters
  const filteredUsers = users.filter((user) => {
    if (filterDepartmentId && user.department?.id !== filterDepartmentId) return false;
    if (filterPositionId && user.managementPosition?.id !== filterPositionId) return false;
    if (filterJobTitle && user.jobTitle !== filterJobTitle) return false;
    return true;
  });

  // Unique options for filters
  const departments = Array.from(new Set(users.map((u) => u.department?.id))).filter(Boolean).map((id) => users.find((u) => u.department?.id === id)?.department);
  const positions = Array.from(new Set(users.map((u) => u.managementPosition?.id))).filter(Boolean).map((id) => users.find((u) => u.managementPosition?.id === id)?.managementPosition);
  const jobTitles = Array.from(new Set(users.map((u) => u.jobTitle))).filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
        Giao OKR cho Nhân sự
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
            Template được chọn:
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
            {template?.title}
          </Typography>
          <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {template?.positionName && (
              <Chip
                label={`Chức vụ: ${template.positionName}`}
                size="small"
                color="secondary"
              />
            )}
            {template?.jobTitle && (
              <Chip
                label={`Chức danh: ${template.jobTitle}`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="outlined" color="secondary" startIcon={<AddCircleOutline />} onClick={() => setOpenVariantEditor(true)}>
              Tạo phiên bản tùy biến
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
              📋 Thông tin bắt buộc
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Kỳ đánh giá *</InputLabel>
                <Select
                  value={selectedCycleId}
                  label="Kỳ đánh giá *"
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
                        {c.name} ({start} → {end}) [{c.status === "OPEN" ? "Đang mở" : "Đã đóng"}]
                        {isStarted ? " - Đang diễn ra (Không thể giao mới)" : ""}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Hạn chót thương lượng & chốt OKR"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Thời gian để nhân sự điều chỉnh và chốt OKR trước khi kỳ bắt đầu."
                inputProps={{
                  max: cycles.find(c => c.id === selectedCycleId)?.startDate 
                    ? new Date(cycles.find(c => c.id === selectedCycleId).startDate).toISOString().split('T')[0] 
                    : undefined
                }}
              />
            </Box>
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {/* ═══ PHẦN 2: BỘ LỌC NHÂN SỰ (Tùy chọn) ═══ */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "text.secondary", display: "flex", alignItems: "center", gap: 1 }}>
              🔍 Lọc nhân sự
              <Chip label="Tùy chọn" size="small" variant="outlined" color="default" sx={{ fontSize: "0.7rem" }} />
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Bộ môn</InputLabel>
                <Select
                  value={filterDepartmentId}
                  label="Bộ môn"
                  onChange={(e) => {
                    setFilterDepartmentId(e.target.value);
                    setFilterPositionId("");
                    setFilterJobTitle("");
                  }}
                >
                  <MenuItem value="">-- Tất cả --</MenuItem>
                  {departments.map((dept: any) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Chức vụ quản lý</InputLabel>
                <Select
                  value={filterPositionId}
                  label="Chức vụ quản lý"
                  onChange={(e) => setFilterPositionId(e.target.value)}
                >
                  <MenuItem value="">-- Tất cả --</MenuItem>
                  {positions.map((pos: any) => (
                    <MenuItem key={pos.id} value={pos.id}>
                      {pos.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Chức danh nghề nghiệp</InputLabel>
                <Select
                  value={filterJobTitle}
                  label="Chức danh nghề nghiệp"
                  onChange={(e) => setFilterJobTitle(e.target.value)}
                >
                  <MenuItem value="">-- Tất cả --</MenuItem>
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
              Chọn Nhân sự để giao
            </Typography>
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={
                  Object.keys(userAssignments).length === filteredUsers.length && filteredUsers.length > 0 ? (
                    <Deselect />
                  ) : (
                    <SelectAll />
                  )
                }
                onClick={handleSelectAll}
                disabled={filteredUsers.length === 0}
              >
                {Object.keys(userAssignments).length === filteredUsers.length && filteredUsers.length > 0
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
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
                        Object.keys(userAssignments).length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                      indeterminate={
                        Object.keys(userAssignments).length > 0 &&
                        Object.keys(userAssignments).length < filteredUsers.length
                      }
                      onChange={handleSelectAll}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Bộ môn</TableCell>
                  <TableCell>Chức vụ quản lý</TableCell>
                  <TableCell>Chức danh nghề nghiệp</TableCell>
                  <TableCell>Phiên bản gán</TableCell>
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
                      Đang tải danh sách nhân sự...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      Không tìm thấy nhân sự nào phù hợp với tiêu chí của
                      template.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: any) => (
                    <TableRow
                      key={user.id}
                      hover
                      selected={!!userAssignments[user.id]}
                      onClick={() => {
                         if (userAssignments[user.id]) handleAssignVariant(user.id, "");
                         else handleAssignVariant(user.id, "base");
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        <Checkbox
                          checked={!!userAssignments[user.id]}
                          onChange={(e) => {
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
                        <FormControl size="small" fullWidth>
                          <Select
                            displayEmpty
                            value={userAssignments[user.id] || ""}
                            onChange={(e) => handleAssignVariant(user.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MenuItem value="">
                              <em style={{ color: "gray" }}>-- Không giao --</em>
                            </MenuItem>
                            {variants.map((v) => (
                              <MenuItem key={v.id} value={v.id} sx={{ fontWeight: v.id === "base" ? "bold" : "normal" }}>
                                {v.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Selection Summary */}
          {Object.keys(userAssignments).length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: "#f0fdf4",
                borderRadius: 1,
                border: "1px solid #bbf7d0",
              }}
            >
              <Typography variant="body2" color="success.main">
                ✅ Đã chọn <strong>{Object.keys(userAssignments).length}</strong> nhân sự:
              </Typography>
              <Box
                sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}
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
                    label={`+${Object.keys(userAssignments).length - 10} người khác`}
                    size="small"
                    color="default"
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={Object.keys(userAssignments).length === 0 || !selectedCycleId || loading}
          startIcon={<Send />}
        >
          {loading
            ? "Đang giao..."
            : `Giao OKR cho ${Object.keys(userAssignments).length || ""} Nhân sự`}
        </Button>
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
