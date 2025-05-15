import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the settings type
export type SettingsType = {
  darkMode: boolean;
  language: string;
  reportFormat: string;
  autoSave: boolean;
  backupLocation: string | null;
};

// Corrected - single declaration with export
export const defaultSettings: SettingsType = {
  darkMode: false,
  language: 'English',
  reportFormat: 'PDF',
  autoSave: true,
  backupLocation: null,
};

// Create context
const SettingsContext = createContext<{
  settings: SettingsType;
  updateSettings: (newSettings: Partial<SettingsType>) => void;
  resetSettings: () => void;
}>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
});

// Settings provider component
export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage on initial render
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('@settings');
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('@settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<SettingsType>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = () => {
  return useContext(SettingsContext);
};