import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableRow,
  LinearProgress,
  Chip,
  Avatar,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Business,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';

export default function ObjectiveRow({ row }: { row: any }) {
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
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: row.type === 'DEPARTMENT' ? '#e0f2fe' : '#f3e8ff',
                color: row.type === 'DEPARTMENT' ? '#0284c7' : '#9333ea',
              }}
              variant="rounded"
            >
              {row.type === 'DEPARTMENT' ? (
                <Business />
              ) : (
                row.owner?.name?.charAt(0)
              )}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
                {row.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.type === 'DEPARTMENT'
                  ? 'Mục tiêu Bộ môn'
                  : `Chủ sở hữu: ${row.owner?.name}`}
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
                value={row.progress || 0}
                color={getStatusColor(row.status)}
                sx={{ height: 8, borderRadius: 5 }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >{`${Math.round(row.progress || 0)}%`}</Typography>
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
                  {row.keyResults?.map((kr: any) => {
                    const percent = Math.min(
                      100,
                      Math.round((kr.current / kr.target) * 100) || 0,
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
