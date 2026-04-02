'use client';

import { Chip } from '@mui/material';

const statusColors = {
  active: 'success',
  completed: 'info',
  inactive: 'default',
  pending: 'warning',
  error: 'error',
};

export function StatusChip({ status, label, ...props }) {
  return (
    <Chip
      label={label || status}
      color={statusColors[status] || 'default'}
      size="small"
      {...props}
    />
  );
}

export default StatusChip;
