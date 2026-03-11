import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { AdminPanelSettings, BadgeOutlined } from '@mui/icons-material';
import UserRoleManager from './UserRoleManager';
import ManagementPositionManager from './ManagementPositionManager';

export default function RoleManagementTab() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Box>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newIndex) => setTabIndex(newIndex)}
          sx={{
            '& .MuiTabs-indicator': { backgroundColor: '#1e3a8a', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#64748B',
              minHeight: 56,
              py: 1.5,
              mx: 1,
              '&.Mui-selected': { color: '#1e3a8a' },
            },
          }}
        >
          <Tab icon={<AdminPanelSettings fontSize="small" />} iconPosition="start" label="Roles Hệ thống" />
          <Tab icon={<BadgeOutlined fontSize="small" />} iconPosition="start" label="Chức vụ quản lý" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box>
        {tabIndex === 0 && <UserRoleManager />}
        {tabIndex === 1 && <ManagementPositionManager />}
      </Box>
    </Box>
  );
}
