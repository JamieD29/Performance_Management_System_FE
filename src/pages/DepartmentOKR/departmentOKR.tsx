import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Tabs,
  Tab,
} from '@mui/material';
import { NavigateNext, Business, Flag, Gavel } from '@mui/icons-material';

import TemplateListTab from './components/TemplateListTab';
import DeanApprovalTab from './components/DeanApprovalTab';

export default function DepartmentOKR() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
        <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <Business sx={{ mr: 0.5 }} fontSize="inherit" />
          Bộ môn
        </Typography>
        <Typography color="text.primary">Quản lý OKR</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e3a8a">
          Quản lý OKR
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab icon={<Flag />} iconPosition="start" label="Templates OKR" />
          <Tab icon={<Gavel />} iconPosition="start" label="Duyệt đề xuất" />
        </Tabs>
      </Box>

      {tabValue === 0 && <TemplateListTab />}
      {tabValue === 1 && <DeanApprovalTab />}
    </Container>
  );
}
