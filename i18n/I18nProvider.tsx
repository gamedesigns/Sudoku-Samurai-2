import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';
import { Language } from '../types';

type Translations = Record<Language, Record<string, string>>;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [en, cs, de] = await Promise.all([
          fetch('./i18n/locales/en.json').then(res => res.json()),
          fetch('./i18n/locales/cs.json').then(res => res.json()),
          fetch('./i18n/locales/de.json').then(res => res.json())
        ]);
        setTranslations({ en, cs, de });
      } catch (error) {
        console.error("Could not load translation files:", error);
      }
    };
    loadTranslations();
  }, []);

  const t = useCallback((key: string, params: Record<string, string | number> = {}) => {
    if (!translations) {
      return key;
    }
    const currentLangTranslations = translations[lang] || {};
    const fallbackTranslations = translations['en'] || {};
    
    let translation = currentLangTranslations[key] || fallbackTranslations[key] || key;

    Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, String(params[paramKey]));
    });
    return translation;
  }, [lang, translations]);
  
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  
  if (!translations) {
    return null; // Don't render app until translations are loaded
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};