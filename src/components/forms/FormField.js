'use client';

import { TextField } from '@mui/material';

export function FormField({
  name,
  label,
  error,
  touched,
  helperText,
  ...props
}) {
  const showError = touched && Boolean(error);

  return (
    <TextField
      name={name}
      label={label}
      error={showError}
      helperText={showError ? error : helperText}
      fullWidth
      {...props}
    />
  );
}

export default FormField;
