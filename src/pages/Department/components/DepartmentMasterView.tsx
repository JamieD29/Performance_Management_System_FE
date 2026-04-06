import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Breadcrumbs,
  TextField,
  InputAdornment,
  CircularProgress,
  Fade,
  Card,
  CardContent,
  Paper,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Add, Delete, Edit, NavigateNext, Search, School, MoreVert } from "@mui/icons-material";
import { Users, ChevronRight, Building2 } from "lucide-react";
import Grid from "@mui/material/Grid";
import AddDepartmentModal from "./AddDepartmentModal";
import type { Department } from "../department.types";

interface DepartmentMasterViewProps {
  departments: Department[];
  loading: boolean;
  isAdmin: boolean;
  isKhoa: boolean;
  isDonVi: boolean;
  hasManagementPosition: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loggedInUser: any;
  onSelectDept: (dept: Department) => void;
  onDeleteDept: (id: string, name: string) => void;
  onRefresh: () => void;
}


const getEnglishName = (code: string) => {
  const map: Record<string, string> = {
    SE: "Software Engineering",
    KT: "Knowledge Technology",
    IS: "Information Systems",
    CS: "Computer Science",
    CE: "Computer Engineering",
    DS: "Data Science",
    AI: "Artificial Intelligence",
    IA: "Information Assurance",
    NT: "Network Technology",
    MMT: "Computer Networks",
    KHMT: "Computer Science",
    CNPM: "Software Engineering",
    HTTT: "Information Systems",
    KTTT: "Knowledge Technology",
    KTMT: "Computer Engineering",
    ATTT: "Information Security",
  };
  return map[code.toUpperCase()] || "Information Technology";
};

export default function DepartmentMasterView({
  departments,
  loading,
  isAdmin,
  isKhoa,
  isDonVi,
  hasManagementPosition,
  loggedInUser,
  onSelectDept,
  onDeleteDept,
  onRefresh,
}: DepartmentMasterViewProps) {
  const [deptSearch, setDeptSearch] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editDeptData, setEditDeptData] = useState<Department | null>(null);

  const handleOpenAddModal = () => {
    setEditDeptData(null);
    setOpenAddModal(true);
  };

  const handleEdit = (dept: Department) => {
    setEditDeptData(dept);
    setOpenAddModal(true);
  };

  const handleCloseModal = () => {
    setOpenAddModal(false);
    setEditDeptData(null);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDept, setMenuDept] = useState<Department | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, dept: Department) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuDept(dept);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDept(null);
  };

  const filteredDepartments = departments.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(deptSearch.toLowerCase());
    if (!matchSearch) return false;
    if (isAdmin) return true;
    if (isKhoa) return true;
    if (isDonVi || hasManagementPosition) {
      return d.id === loggedInUser?.department?.id;
    }
    return false;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* BREADCRUMBS */}
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Typography color="inherit" sx={{ display: "flex", alignItems: "center" }}>
          <School sx={{ mr: 0.5 }} fontSize="inherit" />
          Bộ môn
        </Typography>
        <Typography color="text.primary">Nhân sự</Typography>
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
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b" }}>
            Danh sách đơn vị / Bộ môn
          </Typography>
          <Typography color="text.secondary">
            Chọn đơn vị để xem và quản lý nhân sự ({departments.length} đơn vị)
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
            sx={{
              bgcolor: "white",
              minWidth: 250,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#93c5fd",
                },
              },
            }}
          />
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddModal}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
                bgcolor: "#1e293b",
                "&:hover": { bgcolor: "#0f172a" },
                boxShadow: "0 2px 8px rgba(30, 41, 59, 0.3)",
              }}
            >
              Thêm bộ môn
            </Button>
          )}
        </Box>
      </Box>

      {/* DEPARTMENT CARD GRID */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : filteredDepartments.length > 0 ? (
        <Grid container spacing={3}>
          {filteredDepartments.map((dept, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  elevation={0}
                  onClick={() => onSelectDept(dept)}
                  sx={{
                    borderRadius: 4,
                    border: "2px solid transparent",
                    cursor: "pointer",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    background:
                      "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)) padding-box, linear-gradient(to right, #f1f5f9, #f1f5f9) border-box",
                    backdropFilter: "blur(12px)",
                    transition: "all 0.4s ease-out",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                    "&:hover": {
                      transform: "scale(1.03)",
                      background:
                        "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)) padding-box, linear-gradient(45deg, #2563eb, #3b82f6, #60a5fa) border-box",
                      boxShadow: "0 25px 30px -12px rgba(30, 58, 138, 0.25), 0 0 15px rgba(59, 130, 246, 0.3)",
                      "& .dept-arrow": {
                        transform: "translateX(8px)",
                        color: "#3b82f6",
                      },
                      "& .dept-avatar": {
                        bgcolor: "#3b82f6",
                        color: "white",
                        transform: "scale(1.15) rotate(5deg)",
                        boxShadow: "0 8px 16px -4px rgba(59, 130, 246, 0.4)",
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.2, position: "relative", zIndex: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                      <Avatar
                        className="dept-avatar"
                        variant="rounded"
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: "#eff6ff",
                          color: "#3b82f6",
                          fontWeight: "bold",
                          fontSize: 16,
                          borderRadius: 2,
                          transition: "all 0.3s ease",
                          flexShrink: 0,
                        }}
                      >
                        {dept.code}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            color: "#1e293b",
                            lineHeight: 1.2,
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 28,
                          }}
                        >
                          {dept.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "#3b82f6",
                            fontWeight: 600,
                            mt: 0.2,
                            mb: 0.5
                          }}
                        >
                          {getEnglishName(dept.code)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {dept.description || "Chưa có mô tả đơn vị"}
                        </Typography>
                      </Box>
                      <ChevronRight
                        size={20}
                        className="dept-arrow"
                        style={{
                          color: "#94a3b8",
                          transition: "all 0.3s ease",
                          flexShrink: 0,
                        }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: "auto" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
                        <Users size={14} />
                        <Typography variant="caption" fontWeight={600}>
                          {dept.memberCount || 0} nhân sự
                        </Typography>
                      </Box>

                      {isAdmin && (
                        <Box sx={{ display: "flex", gap: 0, mr: -1 }}>
                          <Tooltip title="Tùy chọn">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, dept)}
                              sx={{
                                padding: "4px",
                                "&:hover": { bgcolor: "rgba(59, 130, 246, 0.1)" },
                                color: "#64748b",
                              }}
                            >
                              <MoreVert sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            py: 10,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <Building2 size={48} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
          <Typography variant="h6" color="text.secondary" fontWeight={500}>
            Không tìm thấy bộ môn nào
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {deptSearch ? "Thử tìm kiếm với từ khóa khác" : "Chưa có dữ liệu bộ môn trong hệ thống"}
          </Typography>
        </Paper>
      )}

      {/* 3-DOTS MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2, minWidth: 160 },
        }}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            if (menuDept) {
              handleEdit(menuDept);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" sx={{ color: "#64748b" }} />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            if (menuDept) {
              onDeleteDept(menuDept.id, menuDept.name);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Xóa</ListItemText>
        </MenuItem>
      </Menu>

      {/* MODAL ADD */}
      <AddDepartmentModal
        open={openAddModal}
        onClose={handleCloseModal}
        onSuccess={onRefresh}
        initialData={editDeptData}
      />
    </Container>
  );
}
