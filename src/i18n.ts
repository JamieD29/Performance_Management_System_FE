import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';

const resources = {
  en: { translation: enTranslation },
  vi: { translation: viTranslation }
};

const savedLanguage = localStorage.getItem('i18nextLng') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // Load from localStorage or default to 'vi'
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
