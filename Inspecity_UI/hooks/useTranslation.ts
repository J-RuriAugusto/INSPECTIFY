import { useSettings } from '../app/(tabs)/Dashboard/settingsContext'
import en from '../locales/en'
import tgl from '../locales/tl';
import ceb from '../locales/ceb';

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

    const translateEarthquakeQuestions = (): string[] => {
      const language = settings.language || 'English';
      return translations[language]?.EARTHQUAKE_QUESTIONS || 
             translations['English'].EARTHQUAKE_QUESTIONS;
    };

    const translateFloodQuestions = (): string[] => {
      const language = settings.language || 'English';
      return translations[language]?.FLOOD_QUESTIONS || 
             translations['English'].FLOOD_QUESTIONS;
    };

    const translateFireQuestions = (): string[] => {
      const language = settings.language || 'English';
      return translations[language]?.FIRE_QUESTIONS || 
             translations['English'].FIRE_QUESTIONS;
    };

    const translateGeneralQuestions = (): string[] => {
      const language = settings.language || 'English';
      return translations[language]?.GENERAL_QUESTIONS || 
             translations['English'].GENERAL_QUESTIONS;
    };
  
    return { t, translateMessages, translateEarthquakeQuestions, translateFloodQuestions, translateFireQuestions, translateGeneralQuestions };
  };