import { useSettings } from '../app/(tabs)/Dashboard/settingsContext'
import en from '../app/locales/en'
import tgl from '../app/locales/tl';
import ceb from '../app/locales/ceb';

const translations: Record<string, any> = {
  English: en,
  Tagalog: tgl,
  Cebuano: ceb,
};

export const useTranslation = () => {
    const { settings } = useSettings();
    
    const t = (key: string): string => {
      const language = settings.language || 'English';
      return translations[language]?.[key] || translations['English'][key] || key;
    };
  
    const translateMessages = (): string[] => {
      const language = settings.language || 'English';
      return translations[language]?.HOME_TIPS || 
             translations['English'].HOME_TIPS;
    };
  
    return { t, translateMessages };
  };