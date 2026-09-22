import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AIProviderType = 'mock' | 'openai' | 'gemini';

interface SettingsState {
  aiProvider: AIProviderType;
  openaiKey: string;
  geminiKey: string;
  openaiModel: string;
  geminiModel: string;
  notifications: boolean;
  theme: 'light' | 'dark';
}

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (partial: Partial<SettingsState>) => void;
  resetSettings: () => void;
  getActiveAIProvider: () => AIProviderType;
  hasValidOpenAIKey: () => boolean;
  hasValidGeminiKey: () => boolean;
}

const SETTINGS_STORAGE_KEY = 'rateshift-settings';

const defaultSettings: SettingsState = {
  aiProvider: 'mock',
  openaiKey: '',
  geminiKey: '',
  openaiModel: 'gpt-4o-mini',
  geminiModel: 'gemini-3.8-flash',
  notifications: true,
  theme: 'light',
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (partial: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  };

  const getActiveAIProvider = (): AIProviderType => {
    if (settings.aiProvider === 'openai' && settings.openaiKey) return 'openai';
    if (settings.aiProvider === 'gemini' && settings.geminiKey) return 'gemini';
    return 'mock';
  };

  const hasValidOpenAIKey = () => settings.openaiKey.length > 10;
  const hasValidGeminiKey = () => settings.geminiKey.length > 10;

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      getActiveAIProvider,
      hasValidOpenAIKey,
      hasValidGeminiKey,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
