'use client';

import { useCallback } from 'react';
import { useLanguage } from './LanguageContext';
import en from './translations/en.json';
import es from './translations/es.json';

const translations = { en, es };

export function useTranslation() {
  const { language } = useLanguage();
  const strings = translations[language] || translations.en;

  const t = useCallback(
    (key, params) => {
      let value = strings[key];
      if (value === undefined) {
        value = translations.en[key] ?? key;
      }
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(
            new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'),
            String(paramValue),
          );
        });
      }
      return value;
    },
    [language, strings],
  );

  return { t, language };
}
