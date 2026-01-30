import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Target, TrendingUp, Users, Calendar } from 'lucide-react';
import StatCard from '../components/StatCard';
// Interfaces (Giữ nguyên)
interface OKRData {
  id: string;
  title: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
  dueDate: string;
}
interface KPIData {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
}

export default function Dashboard() {
  const [okrs, setOkrs] = useState<OKRData[]>([]);
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    // Giả lập fetch data
    setOkrs([
      {
        id: '1',
        title: 'Increase Q4 Revenue',
        progress: 75,
        status: 'on-track',
        dueDate: '2025-12-31',
      },
      {
        id: '2',
        title: 'Launch Mobile App',
        progress: 40,
        status: 'at-risk',
        dueDate: '2025-11-20',
      },
    ]);
    setKpis([
      { id: '1', name: 'New Leads', current: 450, target: 500, unit: 'leads' },
      { id: '2', name: 'Customer Churn', current: 2.5, target: 5, unit: '%' },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'success';
      case 'at-risk':
        return 'warning';
      case 'behind':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: '#1e293b' }}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </Typography>
        <Typography color="text.secondary">
          Academic Performance Overview
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <StatCard
          title="Active OKRs"
          value={okrs.length}
          icon={<Target size={24} color="#3b82f6" />}
          bg="#eff6ff"
        />
        <StatCard
          title="On Track"
          value={okrs.filter((o) => o.status === 'on-track').length}
          icon={<TrendingUp size={24} color="#22c55e" />}
          bg="#f0fdf4"
        />
        <StatCard
          title="At Risk"
          value={okrs.filter((o) => o.status === 'at-risk').length}
          icon={<Calendar size={24} color="#f59e0b" />}
          bg="#fef3c7"
        />
        <StatCard
          title="Active KPIs"
          value={kpis.length}
          icon={<Users size={24} color="#0ea5e9" />}
          bg="#f0f9ff"
        />
      </Grid>

      {/* OKR & KPI Content Grid (Code cũ của mày copy vào đây) */}
      {/* ... (Giữ nguyên phần render OKR/KPI List) ... */}
      <Grid container spacing={3}>
        {/* Copy y nguyên phần Grid OKR và KPI từ file cũ bỏ vào đây */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* ... */}
          {/* Ví dụ ngắn gọn để đỡ dài dòng */}
          <Typography variant="h6">
            Your OKRs List (Load from component)
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
