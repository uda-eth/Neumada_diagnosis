import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface TranslationContextType {
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType>({ t: (key) => key });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred-language');
    return (saved === 'en' || saved === 'es') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('preferred-language', language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <TranslationProvider>
        {children}
      </TranslationProvider>
    </LanguageContext.Provider>
  );
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    const mockTranslations = {
      en: {
        create: 'Create',
        event: 'Event',
        login: 'Login',
        register: 'Register'
      },
      es: {
        create: 'Crear',
        event: 'Evento',
        login: 'Iniciar sesión',
        register: 'Registrarse'
      }
    };
    setTranslations(mockTranslations[language]);
  }, [language]);

  const t = (key: string) => translations[key] || key;

  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}