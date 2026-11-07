import React, { createContext, useContext, useState, useEffect } from 'react';
import { INDIAN_LANGUAGES, IndianLanguage, TranslationKey, getTranslation } from '../utils/i18n';

interface LanguageContextType {
  language: string;
  languageObj: IndianLanguage;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  isLanguageModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'motionease_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const setLanguage = (code: string) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, code);
    } catch {}
  };

  const languageObj =
    INDIAN_LANGUAGES.find(l => l.code === language) || INDIAN_LANGUAGES[0];

  const t = (key: TranslationKey, fallback?: string): string => {
    const val = getTranslation(language, key);
    if (val) return val;
    return fallback || key;
  };

  const openLanguageModal = () => setIsLanguageModalOpen(true);
  const closeLanguageModal = () => setIsLanguageModalOpen(false);

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageObj,
        setLanguage,
        t,
        isLanguageModalOpen,
        openLanguageModal,
        closeLanguageModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
