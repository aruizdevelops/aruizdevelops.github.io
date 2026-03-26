'use client';

import { createContext, useState, useCallback, useContext, useEffect } from 'react';

const STORAGE_KEY = 'app-language';
const DEFAULT_LANG = 'en';
const SUPPORTED_LANGS = ['en', 'es'];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.includes(stored)) {
        setLanguageState(stored);
        document.documentElement.lang = stored;
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const setLanguage = useCallback((lang) => {
    if (SUPPORTED_LANGS.includes(lang)) {
      setLanguageState(lang);
      document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // localStorage unavailable
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, supportedLanguages: SUPPORTED_LANGS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

export default LanguageContext;
