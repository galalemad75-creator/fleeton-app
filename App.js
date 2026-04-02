// FleetOn — App Entry Point (with ThemeProvider)
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { i18n, isRTL } from './src/lib/i18n';
import { getCurrentUser } from './src/lib/database';
import { supabase } from './src/lib/supabase';
import Navigation from './src/navigation';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { COLORS } = useTheme();

  useEffect(() => {
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
      console.log('No user session');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
