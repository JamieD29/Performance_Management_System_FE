import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import {
  ArrowLeft,
  Users,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Home,
  Target,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { api } from "../../services/api";
import { useTranslation } from "react-i18next";
import { useDepartmentOverviewData } from "./useDepartmentOverviewData";

// Interface khớp với DB
interface Department {
  id: string;
  name: string;
  code: string;
  memberCount?: number;
  headOfDeptName?: string;
}

// --- STATUS HELPERS ---
const OKR_STATUS_CONFIG: Record<string, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"; icon?: string }> = {
  PENDING: { label: "Chờ phản hồi", color: "warning", icon: "⏳" },
  NEGOTIATING: { label: "Đang đàm phán", color: "info", icon: "💬" },
  ACCEPTED: { label: "Đã chốt", color: "primary", icon: "📋" },
  SUBMITTED: { label: "Đã nộp tự khai", color: "secondary", icon: "📤" },
  COMPLETED: { label: "Đã chấm điểm", color: "success", icon: "✅" },
  AT_RISK: { label: "Rủi ro", color: "error", icon: "⚠️" },
  OFF_TRACK: { label: "Chậm tiến độ", color: "error", icon: "🔴" },
};

const EVAL_STATUS_CONFIG: Record<string, { label: string; color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" }> = {
  PENDING_EVALUATION: { label: "Chờ đánh giá", color: "warning" },
  SUBMITTED: { label: "Đã nộp", color: "info" },
  EVALUATED: { label: "Đã đánh giá", color: "success" },
};

const RATING_LABELS: Record<string, string> = {
  EXCELLENT: "Xuất sắc",
  GOOD: "Tốt",
  FAIR: "Khá",
  AVERAGE: "Trung bình",
  POOR: "Yếu",
};

function getOkrStatusChip(status: string) {
  const config = OKR_STATUS_CONFIG[status] || { label: status, color: "default" as const };
  return (
    <Chip
      label={`${config.icon || ""} ${config.label}`}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600, fontSize: "0.78rem" }}
    />
  );
}

function getEvalStatusChip(status: string | null) {
  if (!status) return <Chip label="Chưa có" color="default" size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.78rem" }} />;
  const config = EVAL_STATUS_CONFIG[status] || { label: status, color: "default" as const };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 600, fontSize: "0.78rem" }}
    />
  );
}

export default function DepartmentOverview() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const deptId = searchParams.get("deptId");

  const selectedDept = departments.find((d) => d.id === deptId) || null;

  // --- Cycles state ---
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>("");

  const { data: overviewData, loading: overviewLoading, error: overviewError } = useDepartmentOverviewData(deptId, selectedCycle || undefined);

  // --- OKR Pagination & Sort State ---
  const [okrPage, setOkrPage] = useState(0);
  const [okrRowsPerPage, setOkrRowsPerPage] = useState(5);
  const [okrOrderBy, setOkrOrderBy] = useState<string>("totalScore");
  const [okrOrder, setOkrOrder] = useState<"asc" | "desc">("desc");

  // --- Eval Pagination & Sort State ---
  const [evalPage, setEvalPage] = useState(0);
  const [evalRowsPerPage, setEvalRowsPerPage] = useState(5);
  const [evalOrderBy, setEvalOrderBy] = useState<string>("principalScoreTotal");
  const [evalOrder, setEvalOrder] = useState<"asc" | "desc">("desc");

  const handleSelectDept = (dept: Department | null) => {
    setSearchParams(prev => {
      if (dept) {
        prev.set("deptId", dept.id);
      } else {
        prev.delete("deptId");
      }
      return prev;
    });
  };

  useEffect(() => {
    fetchDepartments();
    fetchCycles();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      const data = Array.isArray(res.data) ? res.data : [];
      setDepartments(data);

      if (data.length === 1 && !deptId) {
        setSearchParams({ deptId: data[0].id });
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bộ môn:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    try {
      const res = await api.get("/performance/cycles");
      const data = Array.isArray(res.data) ? res.data : [];
      setCycles(data);
      if (data.length > 0) {
        const openCycle = data.find((c: any) => c.status === "OPEN");
        setSelectedCycle(openCycle ? openCycle.id : data[0].id);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách kỳ đánh giá:", error);
    }
  };

  // --- SORTING LOGIC ---
  const handleOkrSortRequest = (property: string) => {
    const isAsc = okrOrderBy === property && okrOrder === "asc";
    setOkrOrder(isAsc ? "desc" : "asc");
    setOkrOrderBy(property);
  };

  const handleEvalSortRequest = (property: string) => {
    const isAsc = evalOrderBy === property && evalOrder === "asc";
    setEvalOrder(isAsc ? "desc" : "asc");
    setEvalOrderBy(property);
  };

  const sortedOkrData = useMemo(() => {
    if (!overviewData?.staffOkrStatus) return [];
    const data = [...overviewData.staffOkrStatus];
    data.sort((a, b) => {
      let aVal: any = 0;
      let bVal: any = 0;

      if (okrOrderBy === "name") {
        aVal = a.name;
        bVal = b.name;
      } else {
        // Lấy điểm lớn nhất trong các OKR của user để sort
        aVal = a.okrs.length > 0 ? Math.max(...a.okrs.map(o => Number(o[okrOrderBy as keyof typeof o]) || 0)) : 0;
        bVal = b.okrs.length > 0 ? Math.max(...b.okrs.map(o => Number(o[okrOrderBy as keyof typeof o]) || 0)) : 0;
      }

      if (aVal < bVal) return okrOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return okrOrder === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [overviewData?.staffOkrStatus, okrOrder, okrOrderBy]);

  const sortedEvalData = useMemo(() => {
    if (!overviewData?.staffEvaluationStatus) return [];
    const data = [...overviewData.staffEvaluationStatus];
    data.sort((a, b) => {
      let aVal: any = a[evalOrderBy as keyof typeof a] || 0;
      let bVal: any = b[evalOrderBy as keyof typeof b] || 0;

      if (evalOrderBy === "name") {
        aVal = a.name;
        bVal = b.name;
      }

      if (aVal < bVal) return evalOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return evalOrder === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [overviewData?.staffEvaluationStatus, evalOrder, evalOrderBy]);

  const paginatedOkrData = sortedOkrData.slice(okrPage * okrRowsPerPage, okrPage * okrRowsPerPage + okrRowsPerPage);
  const paginatedEvalData = sortedEvalData.slice(evalPage * evalRowsPerPage, evalPage * evalRowsPerPage + evalRowsPerPage);

  // --- COMPONENT: BREADCRUMBS ---
  const renderBreadcrumbs = () => (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      <Link
        underline="hover"
        color="inherit"
        href="/"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Home size={16} style={{ marginRight: 4 }} />
        {t("departmentOverview.home")}
      </Link>
      {departments.length > 1 && (
        <Link
          underline="hover"
          color={!selectedDept ? "text.primary" : "inherit"}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleSelectDept(null);
          }}
          aria-current={!selectedDept ? "page" : undefined}
        >
          {t("departmentOverview.departments")}
        </Link>
      )}
      {selectedDept && (
        <Typography color="text.primary">{selectedDept.name}</Typography>
      )}
    </Breadcrumbs>
  );

  // --- VIEW 1: DANH SÁCH BỘ MÔN ---
  if (!selectedDept) {
    return (
      <Box sx={{ p: 3 }}>
        {renderBreadcrumbs()}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b" }}>
            {t("departmentOverview.title")}
          </Typography>
          <Typography color="text.secondary">
            {t("departmentOverview.listDescription", { count: departments.length })}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {departments.length > 0 ? (
              departments.map((dept) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
                  <Card
                    elevation={0}
                    sx={{
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      height: "100%",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        borderColor: "#3b82f6",
                      },
                    }}
                    onClick={() => handleSelectDept(dept)}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "#eff6ff",
                            color: "#3b82f6",
                            fontWeight: "bold",
                          }}
                          variant="rounded"
                        >
                          {dept.code}
                        </Avatar>
                        <ChevronRight size={20} className="text-gray-400" />
                      </Box>

                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ minHeight: 50 }}
                      >
                        {dept.name}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            color: "#64748b",
                            fontSize: 14,
                          }}
                        >
                          <Users size={16} />
                          <span>{t("departmentOverview.members", { count: dept.memberCount || 0 })}</span>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            color: "#64748b",
                            fontSize: 14,
                          }}
                        >
                          <Briefcase size={16} />
                          <span className="truncate">
                            {t("departmentOverview.headOfDept")}: {dept.headOfDeptName || t("departmentOverview.notUpdated")}
                          </span>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography align="center" color="text.secondary">
                  {t("departmentOverview.noData")}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    );
  }

  // --- VIEW 2: DASHBOARD CHI TIẾT ---
  return (
    <Box sx={{ p: 3 }}>
      {renderBreadcrumbs()}

      {departments.length > 1 && (
        <Button
          variant="text"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => handleSelectDept(null)}
          sx={{ mb: 2, color: "#64748b", display: { xs: "flex", md: "none" } }}
        >
          {t("departmentOverview.back")}
        </Button>
      )}

      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#1e293b" }}>
            {selectedDept.name}
          </Typography>
          <Typography color="text.secondary">
            {t("departmentOverview.reportsAndStats")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {cycles.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 220, bgcolor: "white" }}>
              <InputLabel>Kỳ/Quý đánh giá</InputLabel>
              <Select
                label="Kỳ/Quý đánh giá"
                value={selectedCycle}
                onChange={(e) => setSelectedCycle(e.target.value)}
              >
                {cycles.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} {c.status === "OPEN" ? "(Đang mở)" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Avatar
            sx={{ width: 56, height: 56, bgcolor: "#1e3a8a", fontSize: 20 }}
          >
            {selectedDept.code}
          </Avatar>
        </Box>
      </Box>

      {/* 4 Widgets Thống kê */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: Nhân sự */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "#eff6ff",
              borderRadius: 3,
              border: "1px solid #dbeafe",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "white", borderRadius: 2 }}>
                <Users size={24} color="#3b82f6" />
              </Box>
              <Typography fontWeight="bold" color="#1e3a8a">
                Nhân sự
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#1e40af" }}
            >
              {overviewData ? overviewData.department.memberCount : (selectedDept.memberCount || 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Giảng viên & Nhân viên
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Tổng OKR đã giao */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "#f5f3ff",
              borderRadius: 3,
              border: "1px solid #ede9fe",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "white", borderRadius: 2 }}>
                <ClipboardList size={24} color="#7c3aed" />
              </Box>
              <Typography fontWeight="bold" color="#4c1d95">
                Tổng OKR đã giao
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#6d28d9" }}
            >
              {overviewData ? overviewData.metrics.totalOkrs : "--"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bản OKR cho nhân viên
            </Typography>
          </Paper>
        </Grid>

        {/* Card 3: Tỉ lệ hoàn thành */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "#f0fdf4",
              borderRadius: 3,
              border: "1px solid #dcfce7",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "white", borderRadius: 2 }}>
                <TrendingUp size={24} color="#16a34a" />
              </Box>
              <Typography fontWeight="bold" color="#14532d">
                Tỉ lệ hoàn thành
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#15803d" }}
            >
              {overviewData ? `${overviewData.metrics.completionRate}%` : "--"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              OKR đã nộp / đã chấm
            </Typography>
          </Paper>
        </Grid>

        {/* Card 4: Cần chú ý */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: "#fff7ed",
              borderRadius: 3,
              border: "1px solid #ffedd5",
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "white", borderRadius: 2 }}>
                <AlertCircle size={24} color="#ea580c" />
              </Box>
              <Typography fontWeight="bold" color="#7c2d12">
                Cần chú ý
              </Typography>
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "#c2410c" }}
            >
              {overviewData ? overviewData.metrics.actionRequired : "0"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              OKR đang đàm phán / chờ phản hồi
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {overviewLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : overviewError ? (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #fecaca", bgcolor: "#fef2f2" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AlertCircle size={20} color="#ef4444" />
            <Typography color="error">{overviewError}</Typography>
          </Box>
        </Paper>
      ) : overviewData ? (
        <Grid container spacing={3}>
          {/* Trạng thái OKR theo Nhân sự */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <Target size={20} color="#64748b" />
                <Typography variant="h6" fontWeight="bold">
                  Trạng thái OKR theo nhân sự
                </Typography>
                <Chip
                  label={`${overviewData.staffOkrStatus.length} nhân sự`}
                  size="small"
                  sx={{ ml: 1, bgcolor: "#f1f5f9", fontWeight: 600 }}
                />
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>
                        <TableSortLabel
                          active={okrOrderBy === "name"}
                          direction={okrOrderBy === "name" ? okrOrder : "asc"}
                          onClick={() => handleOkrSortRequest("name")}
                        >
                          Nhân sự
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tên OKR</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        <TableSortLabel
                          active={okrOrderBy === "totalScore"}
                          direction={okrOrderBy === "totalScore" ? okrOrder : "asc"}
                          onClick={() => handleOkrSortRequest("totalScore")}
                        >
                          Điểm tự khai
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        <TableSortLabel
                          active={okrOrderBy === "managerScore"}
                          direction={okrOrderBy === "managerScore" ? okrOrder : "asc"}
                          onClick={() => handleOkrSortRequest("managerScore")}
                        >
                          Điểm quản lý
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOkrData.length > 0 ? (
                      paginatedOkrData.map((staff) =>
                        staff.okrs.length > 0 ? (
                          staff.okrs.map((okr, idx) => (
                            <TableRow key={`${staff.userId}-${okr.id}`} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                              {idx === 0 && (
                                <TableCell rowSpan={staff.okrs.length} sx={{ verticalAlign: 'top', borderRight: '1px solid #f1f5f9' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar src={staff.avatar || undefined} sx={{ width: 36, height: 36, bgcolor: '#3b82f6' }}>
                                      {staff.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography fontWeight={600} fontSize="0.9rem">{staff.name}</Typography>
                                      <Typography variant="caption" color="text.secondary">{staff.email}</Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                              )}
                              <TableCell>
                                <Typography fontSize="0.88rem">{okr.objective}</Typography>
                              </TableCell>
                              <TableCell>{getOkrStatusChip(okr.status)}</TableCell>
                              <TableCell align="center">
                                <Typography
                                  fontWeight="bold"
                                  fontSize="0.9rem"
                                  color={okr.totalScore > 0 ? (okr.totalScore >= 80 ? "#16a34a" : okr.totalScore >= 50 ? "#ea580c" : "#dc2626") : "text.secondary"}
                                >
                                  {okr.totalScore > 0 ? okr.totalScore : "--"}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  fontWeight="bold"
                                  fontSize="0.9rem"
                                  color={okr.managerScore ? (okr.managerScore >= 80 ? "#16a34a" : okr.managerScore >= 50 ? "#ea580c" : "#dc2626") : "text.secondary"}
                                >
                                  {okr.managerScore ?? "--"}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow key={staff.userId} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar src={staff.avatar || undefined} sx={{ width: 36, height: 36, bgcolor: '#94a3b8' }}>
                                  {staff.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight={600} fontSize="0.9rem">{staff.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{staff.email}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell colSpan={4}>
                              <Typography color="text.secondary" fontStyle="italic" fontSize="0.88rem">
                                Chưa được giao OKR
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">Không có dữ liệu OKR nhân sự</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortedOkrData.length}
                rowsPerPage={okrRowsPerPage}
                page={okrPage}
                onPageChange={(_, newPage) => setOkrPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setOkrRowsPerPage(parseInt(e.target.value, 10));
                  setOkrPage(0);
                }}
                labelRowsPerPage="Số dòng mỗi trang:"
              />
            </Paper>
          </Grid>

          {/* Phiếu Đánh Giá theo nhân sự */}
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <CheckCircle2 size={20} color="#64748b" />
                <Typography variant="h6" fontWeight="bold">
                  Phiếu Đánh Giá theo nhân sự
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>
                        <TableSortLabel
                          active={evalOrderBy === "name"}
                          direction={evalOrderBy === "name" ? evalOrder : "asc"}
                          onClick={() => handleEvalSortRequest("name")}
                        >
                          Nhân sự
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Trạng thái</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tự đánh giá</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Xếp loại (Quản lý)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        <TableSortLabel
                          active={evalOrderBy === "selfScoreTotal"}
                          direction={evalOrderBy === "selfScoreTotal" ? evalOrder : "asc"}
                          onClick={() => handleEvalSortRequest("selfScoreTotal")}
                        >
                          Điểm tự khai
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        <TableSortLabel
                          active={evalOrderBy === "principalScoreTotal"}
                          direction={evalOrderBy === "principalScoreTotal" ? evalOrder : "asc"}
                          onClick={() => handleEvalSortRequest("principalScoreTotal")}
                        >
                          Điểm Hiệu trưởng
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedEvalData.length > 0 ? (
                      paginatedEvalData.map((staff) => (
                        <TableRow key={staff.userId} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={staff.avatar || undefined} sx={{ width: 36, height: 36, bgcolor: '#3b82f6' }}>
                                {staff.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600} fontSize="0.9rem">{staff.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{staff.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{getEvalStatusChip(staff.status)}</TableCell>
                          <TableCell>
                            <Typography fontSize="0.88rem">
                              {staff.selfRating ? (RATING_LABELS[staff.selfRating] || staff.selfRating) : "--"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontSize="0.88rem" fontWeight={staff.managerRating ? 600 : 400}>
                              {staff.managerRating ? (RATING_LABELS[staff.managerRating] || staff.managerRating) : "--"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              fontWeight="bold"
                              fontSize="0.9rem"
                              color={staff.selfScoreTotal > 0 ? "#1e40af" : "text.secondary"}
                            >
                              {staff.selfScoreTotal > 0 ? staff.selfScoreTotal : "--"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              fontWeight="bold"
                              fontSize="0.9rem"
                              color={staff.principalScoreTotal > 0 ? "#15803d" : "text.secondary"}
                            >
                              {staff.principalScoreTotal > 0 ? staff.principalScoreTotal : "--"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary">Không có dữ liệu phiếu đánh giá</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortedEvalData.length}
                rowsPerPage={evalRowsPerPage}
                page={evalPage}
                onPageChange={(_, newPage) => setEvalPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setEvalRowsPerPage(parseInt(e.target.value, 10));
                  setEvalPage(0);
                }}
                labelRowsPerPage="Số dòng mỗi trang:"
              />
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
}
