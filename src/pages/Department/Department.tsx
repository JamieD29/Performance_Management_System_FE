import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Breadcrumbs,
  Link,
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
  Collapse,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
} from "@mui/material";

import {
  Add,
  Delete,
  Edit,
  NavigateNext,
  Search,
  School,
  KeyboardArrowDown,
  KeyboardArrowUp,
  PersonRemove,
  Groups,
} from "@mui/icons-material";
import { api } from "../../services/api";
import AddDepartmentModal from "./components/AddDepartmentModal";

// --- INTERFACES ---
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  staffCode?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  memberCount?: number;
}

// --- COMPONENT CON: TỪNG DÒNG BỘ MÔN (ROW) ---
function DepartmentRow({
  row,
  onDelete,
}: {
  row: Department;
  onDelete: (id: string, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Hàm load user khi mở row
  const handleExpandClick = async () => {
    const newOpenState = !open;
    setOpen(newOpenState);

    // Nếu mở ra và chưa có data thì gọi API
    if (newOpenState && users.length === 0) {
      setLoadingUsers(true);
      try {
        // Gọi API lấy user theo departmentId
        const res = await api.get("/users", {
          params: { departmentId: row.id },
        });
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setUsers(data);
      } catch (error) {
        console.error("Lỗi tải user", error);
      } finally {
        setLoadingUsers(false);
      }
    }
  };

  // Filter user search bên trong row
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.staffCode &&
        u.staffCode.toLowerCase().includes(userSearch.toLowerCase())),
  );

  return (
    <React.Fragment>
      {/* 1. HÀNG MASTER (BỘ MÔN) */}
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          bgcolor: open ? "#f8fafc" : "white",
          cursor: "pointer",
          transition: "all 0.2s",
          "&:hover": { bgcolor: "#f1f5f9" },
        }}
        onClick={handleExpandClick} // Bấm vào hàng là mở luôn
      >
        <TableCell width="50">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleExpandClick();
            }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Tên bộ môn BỰ như yêu cầu */}
            <Typography variant="h6" fontWeight="bold" color="#1e3a8a">
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.code} • {row.description || "Chưa có mô tả"}
            </Typography>
          </Box>
        </TableCell>

        <TableCell align="right">
          <Chip
            icon={<Groups style={{ fontSize: 16 }} />}
            label={`${row.memberCount || 0} nhân sự`}
            size="small"
            variant={open ? "filled" : "outlined"}
            color={open ? "primary" : "default"}
          />
        </TableCell>

        <TableCell align="right" width="120">
          <Tooltip title="Chỉnh sửa (Sắp có)">
            <IconButton size="small" onClick={(e) => e.stopPropagation()}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.id, row.name);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* 2. HÀNG DETAIL (DANH SÁCH NHÂN VIÊN) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                p: 2,
                bgcolor: "#fff",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                boxShadow: "inset 0 2px 4px 0 rgba(0,0,0, 0.05)",
              }}
            >
              {/* Header của phần Detail */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  DANH SÁCH THÀNH VIÊN ({users.length})
                </Typography>

                {/* Search User Inside */}
                <TextField
                  size="small"
                  placeholder="Tìm nhân viên trong danh sách..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Chống click lan ra row
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                    style: { fontSize: 14, backgroundColor: "white" },
                  }}
                  sx={{ width: 300 }}
                />
              </Box>

              {/* Bảng Nhân viên con */}
              {loadingUsers ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "#64748b", fontWeight: 600 }}>
                        Nhân viên
                      </TableCell>
                      <TableCell sx={{ color: "#64748b", fontWeight: 600 }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ color: "#64748b", fontWeight: 600 }}>
                        Chức danh
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell component="th" scope="row">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                src={user.avatarUrl}
                                sx={{ width: 28, height: 28, fontSize: 12 }}
                              >
                                {user.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {user.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {user.staffCode}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.jobTitle || "N/A"}
                              size="small"
                              style={{ height: 24, fontSize: 11 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Gỡ khỏi bộ môn">
                              <IconButton size="small" color="warning">
                                <PersonRemove fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          align="center"
                          sx={{
                            py: 3,
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          {userSearch
                            ? "Không tìm thấy nhân viên nào."
                            : "Chưa có nhân sự trong bộ môn này."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// --- COMPONENT CHÍNH: TRANG QUẢN LÝ ---
export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      setDepartments(res.data);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa bộ môn "${name}"?`)) {
      try {
        await api.delete(`/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        alert("Xóa thất bại");
      }
    }
  };

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(deptSearch.toLowerCase()),
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* BREADCRUMBS */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          sx={{ display: "flex", alignItems: "center" }}
        >
          Dashboard
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <School sx={{ mr: 0.5 }} fontSize="inherit" />
          Quản lý Bộ môn
        </Typography>
      </Breadcrumbs>

      {/* HEADER & SEARCH */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 4,
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
            Danh sách Bộ môn
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Xem và quản lý cấu trúc nhân sự theo dạng danh sách
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm bộ môn..."
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "white", minWidth: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAddModal(true)}
            sx={{ borderRadius: 2, textTransform: "none", px: 3 }}
          >
            Thêm bộ môn
          </Button>
        </Box>
      </Box>

      {/* MASTER LIST (TABLE) */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          overflow: "hidden", // Để border radius bo tròn đẹp
        }}
      >
        <Table aria-label="collapsible table">
          <TableHead sx={{ bgcolor: "#f8fafc" }}>
            <TableRow>
              <TableCell width="50" />
              <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
                TÊN BỘ MÔN
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", color: "#475569" }}
              >
                QUY MÔ
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", color: "#475569" }}
              >
                THAO TÁC
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                <DepartmentRow
                  key={dept.id}
                  row={dept}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 5, color: "text.secondary" }}
                >
                  Không tìm thấy bộ môn nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL ADD */}
      <AddDepartmentModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={fetchDepartments}
      />
    </Container>
  );
}
