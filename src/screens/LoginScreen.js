// FleetOn — Login Screen (theme-aware)
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { signIn } from '../lib/database';

export default function LoginScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(i18n.t('error'), i18n.t('email') + ' & ' + i18n.t('password') + ' required');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert(i18n.t('error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(COLORS);

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={s.logoContainer}>
            <Text style={s.logo}>🚗</Text>
            <Text style={s.appName}>{i18n.t('appName')}</Text>
            <Text style={s.tagline}>{i18n.t('tagline')}</Text>
          </View>
          <View style={s.form}>
            <Text style={s.label}>{i18n.t('email')}</Text>
            <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={COLORS.textMuted}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
            <Text style={s.label}>{i18n.t('password')}</Text>
            <TextInput style={s.input} placeholder="••••••••" placeholderTextColor={COLORS.textMuted}
              value={password} onChangeText={setPassword} secureTextEntry returnKeyType="done" onSubmitEditing={handleLogin} />
            <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
              <Text style={s.buttonText}>{loading ? i18n.t('loading') : i18n.t('login')}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.footer}>
            <Text style={s.footerText}>{i18n.t('noAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={s.footerLink}> {i18n.t('signUp')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.huge },
  logo: { fontSize: 72, marginBottom: SPACING.sm },
  appName: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.bold, letterSpacing: 2 },
  tagline: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: SPACING.xs },
  form: { marginBottom: SPACING.xxl },
  label: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: SPACING.xs, fontWeight: FONTS.weights.medium },
  input: { backgroundColor: COLORS.surface, color: COLORS.textPrimary, padding: SPACING.lg, borderRadius: RADIUS.lg, fontSize: FONTS.sizes.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  button: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: SPACING.sm },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  footerLink: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
});
