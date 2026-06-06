import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Breadcrumbs,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Fade,
} from "@mui/material";
import {
  NavigateNext,
  Search,
  School,
  PersonRemove,
  Groups,
  BadgeOutlined,
  ArrowBack,
  FilterList,
} from "@mui/icons-material";
import { Users, Building2 } from "lucide-react";
import { api } from "../../../services/api";
import AssignPositionModal from "./AssignPositionModal";
import type { User, Department } from "../department.types";
import { confirmAction, showSuccess, showError } from "../../../utils/swal";
import { useTranslation } from "react-i18next";

interface DepartmentDetailViewProps {
  department: Department;
  isAdmin: boolean;
  isDonVi: boolean;
  onBack: () => void;
}

export default function DepartmentDetailView({
  department,
  isAdmin,
  isDonVi,
  onBack,
}: DepartmentDetailViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchField, setSearchField] = useState<
    "all" | "name" | "email" | "staffCode" | "jobTitle"
  >("all");

  const [assignModalUser, setAssignModalUser] = useState<User | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/users", {
        params: { departmentId: department.id },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(data);
    } catch (error) {
      console.error("Error loading users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department.id]);

  const reloadUsers = async () => {
    fetchUsers();
  };

  const handleRemoveFromDepartment = async (user: User) => {
    const ok = await confirmAction({
      title: t("departmentDetail.swal.removeConfirmTitle"),
      text: t("departmentDetail.swal.removeConfirmText", { name: user.name }),
      icon: "warning",
      confirmText: t("departmentDetail.swal.removeConfirmBtn"),
      confirmColor: "#d97706",
    });
    if (!ok) return;

    try {
      await api.put(`/users/${user.id}/department`, {
        departmentId: null,
      });
      showSuccess(t("departmentDetail.swal.successTitle"), t("departmentDetail.swal.successText", { name: user.name }));
      reloadUsers();
    } catch (error: any) {
      console.error(error);
      showError(t("departmentDetail.swal.errorTitle"), error?.response?.data?.message || t("departmentDetail.swal.errorDefaultText"));
    }
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter((u) => {
      switch (searchField) {
        case "name":
          return u.name.toLowerCase().includes(q);
        case "email":
          return u.email.toLowerCase().includes(q);
        case "staffCode":
          return u.staffCode?.toLowerCase().includes(q);
        case "jobTitle":
          return u.jobTitle?.toLowerCase().includes(q);
        default:
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.staffCode && u.staffCode.toLowerCase().includes(q)) ||
            (u.jobTitle && u.jobTitle.toLowerCase().includes(q))
          );
      }
    });
  }, [users, userSearch, searchField]);

  const searchFieldLabels: Record<string, string> = {
    all: t("departmentDetail.search.all"),
    name: t("departmentDetail.search.name"),
    email: t("departmentDetail.search.email"),
    staffCode: t("departmentDetail.search.staffCode"),
    jobTitle: t("departmentDetail.search.jobTitle"),
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* BREADCRUMBS */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Typography
          color="inherit"
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: isDonVi ? "default" : "pointer",
            "&:hover": isDonVi ? {} : { color: "#1e293b", textDecoration: "underline" },
            transition: "color 0.2s",
          }}
          onClick={() => !isDonVi && onBack()}
        >
          <School sx={{ mr: 0.5 }} fontSize="inherit" />
          {t("departmentDetail.staff")}
        </Typography>
        <Typography color="text.primary" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Building2 size={16} />
          {department.name}
        </Typography>
      </Breadcrumbs>

      {/* HEADER */}
      <Fade in timeout={400}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {!isDonVi && (
              <IconButton onClick={onBack} sx={{ bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0", transform: "translateX(-2px)" }, transition: "all 0.2s" }}>
                <ArrowBack />
              </IconButton>
            )}
            <Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b" }}>
                {department.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {department.code} • {department.description || t("departmentDetail.header.noDescription")} • <span dangerouslySetInnerHTML={{ __html: t("departmentDetail.header.staffCount", { count: users.length }) }} />
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<Groups style={{ fontSize: 16 }} />}
              label={t("departmentDetail.header.membersCount", { count: users.length })}
              sx={{ bgcolor: "#eff6ff", color: "#1e40af", fontWeight: 600, border: "1px solid #dbeafe" }}
            />
            {users.filter((u) => u.managementPosition).length > 0 && (
              <Chip
                icon={<BadgeOutlined style={{ fontSize: 16 }} />}
                label={t("departmentDetail.header.managersCount", { count: users.filter((u) => u.managementPosition).length })}
                sx={{ bgcolor: "#f0fdf4", color: "#166534", fontWeight: 600, border: "1px solid #dcfce7" }}
              />
            )}
          </Box>
        </Box>
      </Fade>

      {/* SEARCH & FILTER BAR */}
      <Fade in timeout={500}>
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#fafbfc", display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder={t("departmentDetail.search.placeholder", { field: searchFieldLabels[searchField] })}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="action" /></InputAdornment>) }}
            sx={{ flex: 1, minWidth: 250, bgcolor: "white", "& .MuiOutlinedInput-root": { borderRadius: 2, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#93c5fd" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#3b82f6" } } }}
          />
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <FilterList sx={{ color: "#94a3b8", fontSize: 20, mr: 0.5 }} />
            {(Object.keys(searchFieldLabels) as Array<keyof typeof searchFieldLabels>).map((key) => (
              <Chip
                key={key}
                label={searchFieldLabels[key]}
                size="small"
                variant={searchField === key ? "filled" : "outlined"}
                color={searchField === key ? "primary" : "default"}
                onClick={() => setSearchField(key as typeof searchField)}
                sx={{ cursor: "pointer", fontWeight: searchField === key ? 600 : 400, transition: "all 0.2s", "&:hover": { transform: "translateY(-1px)", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" } }}
              />
            ))}
          </Box>
        </Paper>
      </Fade>

      {/* MEMBER TABLE */}
      <Fade in timeout={600}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "#475569", width: 50 }}>{t("departmentDetail.table.id")}</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>{t("departmentDetail.table.staff")}</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>{t("departmentDetail.table.email")}</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>{t("departmentDetail.table.jobTitle")}</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>{t("departmentDetail.table.managementPosition")}</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", color: "#475569" }}>{t("departmentDetail.table.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingUsers ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>{t("departmentDetail.table.loading")}</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <TableRow
                    key={user.id}
                    hover
                    onClick={() => navigate(`/departments/users/${user.id}`, { state: { parentName: department.name, parentUrl: window.location.pathname + window.location.search } })}
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": { bgcolor: "#f0f7ff" }
                    }}
                  >
                    <TableCell><Typography variant="body2" color="text.secondary" fontWeight={500}>{idx + 1}</Typography></TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar src={user.avatarUrl} sx={{ width: 36, height: 36, fontSize: 14, bgcolor: "#dbeafe", color: "#1e40af", fontWeight: 600 }}>{user.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.staffCode || "—"}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{user.email}</Typography></TableCell>
                    <TableCell>
                      <Chip label={user.jobTitle || "N/A"} size="small" sx={{ height: 26, fontSize: 12, fontWeight: 500, bgcolor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }} />
                    </TableCell>
                    <TableCell>
                      {user.managementPosition ? (
                        <Chip icon={<BadgeOutlined style={{ fontSize: 14 }} />} label={user.managementPosition.name} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, fontSize: 12 }} />
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {isAdmin && (
                        <>
                          <Tooltip title={t("departmentDetail.tooltip.assignPosition")}>
                            <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); setAssignModalUser(user); setAssignModalOpen(true); }} sx={{ "&:hover": { bgcolor: "#dbeafe" }, ml: 1 }}><BadgeOutlined fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title={t("departmentDetail.tooltip.removeFromDept")}>
                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleRemoveFromDepartment(user); }} sx={{ "&:hover": { bgcolor: "#fee2e2" }, ml: 1 }}><PersonRemove fontSize="small" /></IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8, color: "text.secondary" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                      <Users size={40} style={{ color: "#cbd5e1", marginBottom: 8 }} />
                      <Typography variant="body1" fontWeight={500}>
                        {userSearch
                          ? t("departmentDetail.table.noStaffFound")
                          : t("departmentDetail.table.noStaffInDept")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userSearch
                          ? t("departmentDetail.table.noStaffFoundDesc", { field: searchFieldLabels[searchField] })
                          : t("departmentDetail.table.noStaffInDeptDesc")}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {!loadingUsers && filteredUsers.length > 0 && (
            <Box sx={{ px: 2, py: 1.5, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {t("departmentDetail.table.displayCount", { filtered: filteredUsers.length, total: users.length })}
              </Typography>
              {userSearch && (
                <Chip
                  label={t("departmentDetail.search.clearFilter")}
                  size="small"
                  variant="outlined"
                  onDelete={() => {
                    setUserSearch("");
                    setSearchField("all");
                  }}
                  sx={{ fontSize: 11 }}
                />
              )}
            </Box>
          )}
        </TableContainer>
      </Fade>

      <AssignPositionModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        user={assignModalUser}
        onSuccess={reloadUsers}
      />
    </Container>
  );
}
