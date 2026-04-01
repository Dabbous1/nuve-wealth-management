import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  // Dark mode is disabled for now — always force light
  const DARK_MODE_ENABLED = false;

  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (DARK_MODE_ENABLED) {
      AsyncStorage.getItem('themeMode').then(stored => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored);
        }
        setLoaded(true);
      }).catch(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    if (!DARK_MODE_ENABLED && mode !== 'light') return; // Block dark/system when disabled
    setThemeModeState(mode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  const isDark = useMemo(() => {
    if (!DARK_MODE_ENABLED) return false;
    if (themeMode === 'system') return systemScheme === 'dark';
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
