// src/components/StatCard.tsx
import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';

// Định nghĩa Props để truyền dữ liệu vào
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bg: string;
}

export default function StatCard({ title, value, icon, bg }: StatCardProps) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid #e2e8f0',
          height: '100%',
        }}
      >
        {/* ... (Copy đoạn JSX bên trong cũ sang) ... */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: bg, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Paper>
    </Grid>
  );
}
