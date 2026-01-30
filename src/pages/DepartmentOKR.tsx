import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  LinearProgress,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  InputAdornment,
  TextField,
  Tabs,
  Tab,
} from '@mui/material';
import {
  NavigateNext,
  Add,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  Person,
  MoreVert,
  Search,
  CheckCircle,
  RadioButtonUnchecked,
  Groups,
  AssignmentInd,
} from '@mui/icons-material';

// --- INTERFACES ---
interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

interface Objective {
  id: string;
  title: string;
  type: 'DEPARTMENT' | 'PERSONAL';
  progress: number;
  owner: {
    name: string;
    avatarUrl?: string;
  };
  keyResults: KeyResult[];
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND';
}

// --- MOCK DATA ---
// Data Bộ môn
const DEPT_OKRS: Objective[] = [
  {
    id: '1',
    title: 'Nâng cao chất lượng đào tạo 2026',
    type: 'DEPARTMENT',
    progress: 75,
    owner: { name: 'Bộ môn CNPM' },
    status: 'ON_TRACK',
    keyResults: [
      {
        id: 'kr1',
        title: 'Cập nhật đề cương 10 môn',
        target: 10,
        current: 8,
        unit: 'môn',
      },
    ],
  },
];

// Data Cá nhân (Thường sẽ load theo User, nhưng ở đây demo list phẳng trước)
const PERSONAL_OKRS: Objective[] = [
  {
    id: '3',
    title: 'Đạt chứng chỉ Teaching Excellence',
    type: 'PERSONAL',
    progress: 90,
    owner: { name: 'Nguyễn Văn A', avatarUrl: '' },
    status: 'ON_TRACK',
    keyResults: [
      {
        id: 'kr4',
        title: 'Hoàn thành khóa học online',
        target: 100,
        current: 90,
        unit: '%',
      },
    ],
  },
  {
    id: '4',
    title: 'Công bố bài báo quốc tế',
    type: 'PERSONAL',
    progress: 20,
    owner: { name: 'Trần Thị B', avatarUrl: '' },
    status: 'AT_RISK',
    keyResults: [
      { id: 'kr5', title: 'Viết nháp', target: 1, current: 0.2, unit: 'bài' },
    ],
  },
];

// --- COMPONENT ROW (Dùng chung cho cả 2 tab) ---
function ObjectiveRow({ row }: { row: Objective }) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'success';
      case 'AT_RISK':
        return 'warning';
      case 'BEHIND':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <React.Fragment>
      <TableRow
        sx={{
          '& > *': { borderBottom: 'unset' },
          bgcolor: open ? '#f8fafc' : 'white',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell width="50">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {row.type === 'DEPARTMENT' ? (
              <Avatar
                sx={{ bgcolor: '#e0f2fe', color: '#0284c7' }}
                variant="rounded"
              >
                <Business />
              </Avatar>
            ) : (
              <Avatar
                sx={{ bgcolor: '#f3e8ff', color: '#9333ea' }}
                src={row.owner.avatarUrl}
              >
                {row.owner.name.charAt(0)}
              </Avatar>
            )}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
                {row.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.type === 'DEPARTMENT'
                  ? 'Mục tiêu Bộ môn'
                  : `Chủ sở hữu: ${row.owner.name}`}
              </Typography>
            </Box>
          </Box>
        </TableCell>

        <TableCell align="center" width="25%">
          <Box
            sx={{ display: 'flex', alignItems: 'center', width: '100%', mr: 1 }}
          >
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={row.progress}
                color={getStatusColor(row.status)}
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >{`${Math.round(row.progress)}%`}</Typography>
          </Box>
        </TableCell>

        <TableCell align="center" width="120">
          <Chip
            label={
              row.status === 'ON_TRACK'
                ? 'Đúng hạn'
                : row.status === 'AT_RISK'
                  ? 'Rủi ro'
                  : 'Trễ'
            }
            color={getStatusColor(row.status) as any}
            size="small"
            variant="outlined"
          />
        </TableCell>

        <TableCell align="right" width="50">
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                ml: 8,
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                p: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ mb: 1, fontWeight: 'bold', color: '#64748b' }}
              >
                KẾT QUẢ THEN CHỐT (KRs)
              </Typography>
              <Table size="small">
                <TableBody>
                  {row.keyResults.map((kr) => {
                    const percent = Math.min(
                      100,
                      Math.round((kr.current / kr.target) * 100),
                    );
                    return (
                      <TableRow key={kr.id}>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {percent >= 100 ? (
                              <CheckCircle fontSize="small" color="success" />
                            ) : (
                              <RadioButtonUnchecked
                                fontSize="small"
                                color="disabled"
                              />
                            )}
                            {kr.title}
                          </Box>
                        </TableCell>
                        <TableCell align="right" width="150">
                          {kr.current} / {kr.target} {kr.unit}
                        </TableCell>
                        <TableCell width="20%">
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{ height: 6, borderRadius: 4 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// --- MAIN PAGE ---
export default function DepartmentOKR() {
  const [tabValue, setTabValue] = useState(0); // 0: Bộ môn, 1: Cá nhân
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCreateClick = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/departments/overview">
          Bộ môn
        </Link>
        <Typography color="text.primary">OKR Bộ môn</Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
            Quản lý OKR
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Theo dõi mục tiêu chiến lược và kết quả thực thi
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: 'white' }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateClick}
            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
          >
            Tạo OKR mới
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <Business fontSize="small" />
              </ListItemIcon>
              Cho Bộ môn
            </MenuItem>
            <MenuItem onClick={handleCloseMenu}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Cho Thành viên
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* TABS NAVIGATION */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab
            icon={<Business />}
            iconPosition="start"
            label="Mục tiêu Bộ môn"
          />
          <Tab
            icon={<Groups />}
            iconPosition="start"
            label="Mục tiêu Nhân sự"
          />
        </Tabs>
      </Box>

      {/* TAB 1: BỘ MÔN */}
      {tabValue === 0 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}
        >
          <Table>
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell width="50" />
                <TableCell sx={{ fontWeight: 'bold' }}>
                  MỤC TIÊU BỘ MÔN
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  TIẾN ĐỘ
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  TRẠNG THÁI
                </TableCell>
                <TableCell width="50" />
              </TableRow>
            </TableHead>
            <TableBody>
              {DEPT_OKRS.map((okr) => (
                <ObjectiveRow key={okr.id} row={okr} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TAB 2: CÁ NHÂN */}
      {tabValue === 1 && (
        <Box>
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: '#eeffff',
              borderRadius: 2,
              border: '1px dashed #06b6d4',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AssignmentInd color="primary" />
            <Typography variant="body2" color="text.secondary">
              Đây là danh sách OKR của các giảng viên thuộc bộ môn. Trưởng bộ
              môn có thể xem và hỗ trợ đánh giá.
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid #e2e8f0', borderRadius: 4 }}
          >
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell width="50" />
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    MỤC TIÊU CÁ NHÂN
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    TIẾN ĐỘ
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    TRẠNG THÁI
                  </TableCell>
                  <TableCell width="50" />
                </TableRow>
              </TableHead>
              <TableBody>
                {PERSONAL_OKRS.map((okr) => (
                  <ObjectiveRow key={okr.id} row={okr} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}
