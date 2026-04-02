// FleetOn — App Entry Point (with Error Boundary + Config Check)
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, I18nManager, TouchableOpacity, Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { i18n, isRTL } from './src/lib/i18n';
import { getCurrentUser } from './src/lib/database';
import { supabase, isSupabaseConfigured } from './src/lib/supabase';
import Navigation from './src/navigation';

function ConfigError() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#0f172a',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    }}>
      <Text style={{ fontSize: 64, marginBottom: 16 }}>🔧</Text>
      <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
        Setup Required
      </Text>
      <Text style={{ color: '#94a3b8', fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
        FleetOn needs a Supabase connection to work.
        {'\n\n'}
        1. Create a project at supabase.com
        {'\n'}
        2. Run the SQL schema in SQL Editor
        {'\n'}
        3. Create a .env file with your keys
      </Text>
      <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
        Check the README.md for full setup instructions.
      </Text>
    </View>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const { COLORS } = useTheme();

  useEffect(() => {
    // Check Supabase config
    if (!isSupabaseConfigured()) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    // Set RTL for Arabic
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL());

    // Load user
    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const userData = await getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.log('No user session:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  if (configError) {
    return <ConfigError />;
  }

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🚗</Text>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12, fontSize: 14 }}>
          FleetOn
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Navigation user={user} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
