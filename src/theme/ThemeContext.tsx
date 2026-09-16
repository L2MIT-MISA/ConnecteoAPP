import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  cardBg: string;
  cardBgAlt: string;
  textDark: string;
  textLight: string;
  textMuted: string;
  subtitle: string;
  border: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  danger: string;
  dangerBg: string;
  dangerText: string;
  overlay: string;
  success: string;
  warning: string;
  info: string;
  placeholder: string;
  inputBg: string
};

const LIGHT: ThemeColors = {
  background: '#EFEBE4',
  cardBg: '#FFFFFF',
  cardBgAlt: '#F7F4EF',
  textDark: '#1B1B1B',
  textLight: '#FFFFFF',
  textMuted: '#6B7280',
  subtitle: '#A9C2B3',
  border: '#E3DED5',
  primary: '#2E6B4A',
  primaryDark: '#1F4A32',
  primaryLight: '#A9C2B3',
  danger: '#B71C1C',
  dangerBg: '#FBE9E7',
  dangerText: '#B71C1C',
  overlay: 'rgba(0,0,0,0.15)',
  success: '#2E7D32',
  warning: '#ED6C02',
  info: '#0288D1',
  placeholder: '#A9C2B3',
  inputBg: '#FFFFFF'
};

const DARK: ThemeColors = {
  background: '#0F1512',
  cardBg: '#1B2420',
  cardBgAlt: '#232D28',
  textDark: '#F2F5F3',
  textLight: '#FFFFFF',
  textMuted: '#9CA3AF',
  subtitle: '#7FA78C',
  border: '#2C3A32',
  primary: '#3E8E63',
  primaryDark: '#2E6B4A',
  primaryLight: '#7FA78C',
  danger: '#FF8A80',
  dangerBg: '#3B1F1E',
  dangerText: '#FF8A80',
  overlay: 'rgba(0,0,0,0.5)',
  success: '#66BB6A',
  warning: '#FFB74D',
  info: '#4FC3F7',
  placeholder: '#7FA78C',
  inputBg: '#FFFFFF'
};

export const THEME_COLORS = { light: LIGHT, dark: DARK };

type ThemeContextValue = {
  mode: ThemeMode;
  theme: ResolvedTheme;
  colors: ThemeColors;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'auto') {
          setModeState(stored);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => { });
  }, []);

  const theme: ResolvedTheme =
    mode === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const colors = theme === 'dark' ? DARK : LIGHT;

  const toggle = useCallback(() => {
    setMode(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setMode]);

  const value = useMemo(
    () => ({ mode, theme, colors, setMode, toggle }),
    [mode, theme, colors, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}

/** Helper pour créer un StyleSheet dépendant du thème */
export function useThemedStyles<T>(factory: (c: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}

export async function getTheme() {
  const currentTheme = await AsyncStorage.getItem('@theme_mode');
  return currentTheme;
}
