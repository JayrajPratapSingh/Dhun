// App-wide UI language. Persists the choice and exposes a t(key) translator.
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {translations} from './translations';

const KEY = '@hrm_app_lang';
const LanguageContext = createContext(null);

export function LanguageProvider({children}) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(KEY);
      if (saved && translations[saved]) setLangState(saved);
    })();
  }, []);

  function setLang(l) {
    setLangState(l);
    AsyncStorage.setItem(KEY, l).catch(() => {});
  }

  const t = useMemo(() => {
    const dict = translations[lang] || translations.en;
    return key => dict[key] ?? translations.en[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({lang, setLang, t}), [lang, t]);
  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}
