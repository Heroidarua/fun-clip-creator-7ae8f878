import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ru', 'tr', 'hi'],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    detection: {
      order: ['path', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
      lookupFromPathIndex: 0,
    },
  });

export default i18n;
