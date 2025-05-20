import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Admin Dashboard</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Welcome to the admin dashboard. Please restore or implement admin modules as needed.
      </Typography>
    </Box>
  );
};

export default AdminDashboard; 