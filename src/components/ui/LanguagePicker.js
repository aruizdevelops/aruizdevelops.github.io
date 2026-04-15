'use client';

import { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';

import { useLanguage } from '../../i18n/LanguageContext';
import { useTranslation } from '../../i18n/useTranslation';

const LANGUAGE_LABEL_KEYS = {
  en: 'languagePicker.english',
  es: 'languagePicker.spanish',
};

export default function LanguagePicker({ sx }) {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (code) => {
    setLanguage(code);
    handleClose();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 12, md: 16 },
        right: { xs: 60, md: 24 },
        zIndex: (theme) => theme.zIndex.appBar + 1,
        ...sx,
      }}
    >
      <IconButton
        onClick={handleOpen}
        aria-label={t('languagePicker.label')}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        size="small"
        sx={{
          color: 'text.primary',
          backgroundColor: 'rgba(11, 11, 18, 0.55)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(245, 245, 247, 0.08)',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          fontWeight: 600,
          gap: 0.5,
          px: 1.25,
          borderRadius: 2,
          '&:hover': {
            backgroundColor: 'rgba(11, 11, 18, 0.8)',
          },
        }}
      >
        <LanguageIcon fontSize="small" />
        <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
          {language.toUpperCase()}
        </Box>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 160,
              backgroundColor: 'background.paper',
              backgroundImage: 'none',
              border: '1px solid rgba(245, 245, 247, 0.08)',
            },
          },
        }}
      >
        {supportedLanguages.map((code) => {
          const isActive = code === language;
          return (
            <MenuItem
              key={code}
              selected={isActive}
              onClick={() => handleSelect(code)}
            >
              <ListItemIcon sx={{ minWidth: 28, color: 'primary.main' }}>
                {isActive ? <CheckIcon fontSize="small" /> : null}
              </ListItemIcon>
              <ListItemText
                primary={t(LANGUAGE_LABEL_KEYS[code] || code)}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
