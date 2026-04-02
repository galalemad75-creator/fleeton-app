// FleetOn — Theme Context (Dark / Light mode)
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';

// ==================== DARK THEME ====================
const darkColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceLight: '#334155',
  surfaceHover: '#475569',
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  success: '#10b981',
  successDark: '#059669',
  warning: '#f59e0b',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerDark: '#dc2626',
  info: '#6366f1',
  available: '#22c55e',
  busy: '#ef4444',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textInverse: '#0f172a',
  border: '#334155',
  borderLight: '#475569',
  overlay: 'rgba(15, 23, 42, 0.85)',
  shimmer: '#1e293b',
  statusBarStyle: 'light',
};

// ==================== LIGHT THEME ====================
const lightColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceLight: '#f1f5f9',
  surfaceHover: '#e2e8f0',
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  success: '#10b981',
  successDark: '#059669',
  warning: '#f59e0b',
  warningDark: '#d97706',
  danger: '#ef4444',
  dangerDark: '#dc2626',
  info: '#6366f1',
  available: '#22c55e',
  busy: '#ef4444',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#cbd5e1',
  overlay: 'rgba(248, 250, 252, 0.85)',
  shimmer: '#f1f5f9',
  statusBarStyle: 'dark',
};

export const FONTS = {
  sizes: {
    xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32, hero: 48,
  },
  weights: {
    regular: '400', medium: '500', semibold: '600', bold: '700',
  },
};

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48,
};

export const RADIUS = {
  sm: 8, md: 10, lg: 12, xl: 16, full: 999,
};

export const getShadows = (COLORS) => ({
  card: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 5,
  },
  button: {
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
});

export const PLANS = {
  free: { label: 'Free Trial', carsLimit: 1, driversLimit: 1, dispatchersLimit: 1, durationDays: 7, price: 0 },
  starter: { label: 'Starter', carsLimit: 5, driversLimit: 5, dispatchersLimit: 2, durationDays: null, price: 10 },
  business: { label: 'Business', carsLimit: 30, driversLimit: 30, dispatchersLimit: 10, durationDays: null, price: 18 },
  enterprise: { label: 'Enterprise', carsLimit: Infinity, driversLimit: Infinity, dispatchersLimit: Infinity, durationDays: null, price: 25, apiEnabled: true },
};

// ==================== CONTEXT ====================
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('fleeton_theme');
      if (saved !== null) setIsDark(saved === 'dark');
    } catch (e) { /* use default */ }
    setLoading(false);
  };

  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await AsyncStorage.setItem('fleeton_theme', newVal ? 'dark' : 'light');
  };

  const COLORS = isDark ? darkColors : lightColors;

  const value = {
    isDark,
    toggleTheme,
    COLORS,
    colors: COLORS,
    FONTS,
    SPACING,
    RADIUS,
    shadows: getShadows(COLORS),
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar barStyle={COLORS.statusBarStyle} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

// Backward compatibility exports
export { darkColors as COLORS };
