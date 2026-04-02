// FleetOn — Register Screen (with proper auth flow)
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { signUp, createCompany, signIn } from '../lib/database';
import { supabase } from '../lib/supabase';
import { generateCompanyCodes, validateGroupCode } from '../lib/codeGenerator';

const ROLES = [
  { key: 'owner', label: 'owner', emoji: '👑', needsCode: false, isAdmin: true },
  { key: 'driver', label: 'driver', emoji: '🚗', needsCode: true },
  { key: 'dispatcher', label: 'dispatcher', emoji: '📡', needsCode: true },
  { key: 'maintenance', label: 'maintenance', emoji: '🔧', needsCode: true },
  { key: 'accountant', label: 'accountant', emoji: '📊', needsCode: true },
];

export default function RegisterScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [groupCode, setGroupCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState(null);
  const s = styles(COLORS);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(role.isAdmin ? 3 : 2);
  };

  const handleGroupCodeSubmit = async () => {
    if (groupCode.length !== 8) {
      Alert.alert(i18n.t('error'), 'Code must be 8 digits');
      return;
    }
    setLoading(true);
    try {
      const result = await validateGroupCode(groupCode);
      if (!result.valid) {
        const reasonMap = {
          invalid_code: i18n.t('invalidCode'),
          limit_reached: i18n.t('codeExpired'),
          owner_exists: i18n.t('registrationClosed'),
        };
        Alert.alert(i18n.t('error'), reasonMap[result.reason] || i18n.t('invalidCode'));
        return;
      }
      setSelectedRole({ ...selectedRole, key: result.role, companyId: result.company.id });
      setStep(3);
    } catch (err) {
      Alert.alert(i18n.t('error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert(i18n.t('error'), 'All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(i18n.t('error'), 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert(i18n.t('error'), 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      let companyId;

      if (selectedRole.isAdmin) {
        // === OWNER REGISTRATION ===
        if (!companyName.trim()) {
          Alert.alert(i18n.t('error'), 'Company name is required');
          setLoading(false);
          return;
        }

        // Step 1: Create auth user first
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw authError;

        // Step 2: If email confirmation is required, the session might be null
        // Try to sign in immediately
        if (!authData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (signInError) {
            // Email confirmation required
            Alert.alert(
              i18n.t('success'),
              i18n.locale === 'ar'
                ? 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتفعيل.'
                : 'Account created! Check your email to confirm.'
            );
            navigation.navigate('Login');
            return;
          }
        }

        // Step 3: Generate codes and create company
        const codes = await generateCompanyCodes();
        setGeneratedCodes(codes);
        const company = await createCompany({
          name: companyName.trim(),
          driverCode: codes.driverCode,
          dispatcherCode: codes.dispatcherCode,
        });
        companyId = company.id;

        // Step 4: Insert user profile
        const userId = authData.user?.id || (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Could not get user ID');

        const { error: profileError } = await supabase.from('users').insert({
          id: userId,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: selectedRole.key,
          company_id: companyId,
        });
        if (profileError) throw profileError;

        // Show codes
        Alert.alert(
          i18n.t('success'),
          `${i18n.t('shareCode')}\n\n🚗 ${i18n.t('driverCode')}: ${codes.driverCode}\n📡 ${i18n.t('dispatcherCode')}: ${codes.dispatcherCode}`,
          [{ text: 'OK' }]
        );

      } else {
        // === DRIVER/DISPATCHER/OTHER REGISTRATION ===
        companyId = selectedRole.companyId;

        // Step 1: Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (authError) throw authError;

        // Step 2: Try to sign in if no session
        if (!authData.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });
          if (signInError) {
            Alert.alert(
              i18n.t('success'),
              i18n.locale === 'ar'
                ? 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتفعيل.'
                : 'Account created! Check your email to confirm.'
            );
            navigation.navigate('Login');
            return;
          }
        }

        // Step 3: Insert user profile
        const userId = authData.user?.id || (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error('Could not get user ID');

        const { error: profileError } = await supabase.from('users').insert({
          id: userId,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: selectedRole.key,
          company_id: companyId,
        });
        if (profileError) throw profileError;
      }

    } catch (err) {
      console.error('Registration error:', err);
      Alert.alert(i18n.t('error'), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← {i18n.t('cancel')}</Text>
          </TouchableOpacity>
          <Text style={s.title}>{i18n.t('createAccount')}</Text>

          {/* STEP 1: Role Selection */}
          {step === 1 && (
            <View style={s.stepContainer}>
              <Text style={s.stepLabel}>{i18n.t('registerAs')}</Text>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.key}
                  style={[s.roleCard, selectedRole?.key === role.key && s.roleCardSelected]}
                  onPress={() => handleRoleSelect(role)}
                  activeOpacity={0.7}
                >
                  <Text style={s.roleEmoji}>{role.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.roleLabel}>{i18n.t(role.label)}</Text>
                    {role.isAdmin && (
                      <Text style={s.roleSubtext}>
                        {i18n.locale === 'ar' ? 'ينشئ حساب الشركة' : 'Creates the company account'}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* STEP 2: Group Code (for non-admin roles) */}
          {step === 2 && !selectedRole?.isAdmin && (
            <View style={s.stepContainer}>
              <Text style={s.stepLabel}>{i18n.t('enterCode')}</Text>
              <Text style={s.stepSubtext}>
                {selectedRole?.key === 'driver' || selectedRole?.key === 'accountant'
                  ? i18n.t('driverCode')
                  : i18n.t('dispatcherCode')}
              </Text>
              <TextInput
                style={[s.input, s.codeInput]}
                placeholder="00000000"
                placeholderTextColor={COLORS.textMuted}
                value={groupCode}
                onChangeText={(t) => setGroupCode(t.replace(/[^0-9]/g, '').slice(0, 8))}
                keyboardType="number-pad"
                maxLength={8}
                textAlign="center"
                fontSize={28}
                letterSpacing={8}
              />
              <TouchableOpacity
                style={[s.button, (groupCode.length < 8 || loading) && s.buttonDisabled]}
                onPress={handleGroupCodeSubmit}
                disabled={groupCode.length < 8 || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.buttonText}>{i18n.t('confirm')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: Account Details */}
          {step === 3 && (
            <View style={s.stepContainer}>
              {selectedRole?.isAdmin && (
                <>
                  <Text style={s.label}>{i18n.locale === 'ar' ? 'اسم الشركة' : 'Company Name'}</Text>
                  <TextInput
                    style={s.input}
                    placeholder="My Fleet Company"
                    placeholderTextColor={COLORS.textMuted}
                    value={companyName}
                    onChangeText={setCompanyName}
                  />
                </>
              )}
              <Text style={s.label}>{i18n.t('name')}</Text>
              <TextInput
                style={s.input}
                placeholder="Ahmed Mohamed"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <Text style={s.label}>{i18n.t('email')}</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={s.label}>{i18n.t('password')}</Text>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Text style={s.label}>{i18n.t('confirmPassword')}</Text>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity
                style={[s.button, loading && s.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.buttonText}>{i18n.t('createAccount')}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={s.footer}>
            <Text style={s.footerText}>{i18n.t('haveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={s.footerLink}> {i18n.t('signIn')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: SPACING.xxl },
  backBtn: { marginBottom: SPACING.lg },
  backText: { color: COLORS.primary, fontSize: FONTS.sizes.md },
  title: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold, marginBottom: SPACING.xxl },
  stepContainer: { marginBottom: SPACING.xxl },
  stepLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginBottom: SPACING.lg, fontWeight: FONTS.weights.medium },
  stepSubtext: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginBottom: SPACING.lg },
  label: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: SPACING.xs, fontWeight: FONTS.weights.medium },
  input: {
    backgroundColor: COLORS.surface, color: COLORS.textPrimary, padding: SPACING.lg,
    borderRadius: RADIUS.lg, fontSize: FONTS.sizes.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  codeInput: { fontSize: 28, letterSpacing: 8, textAlign: 'center', padding: SPACING.xxl },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  roleEmoji: { fontSize: 32, marginRight: SPACING.lg },
  roleLabel: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.semibold },
  roleSubtext: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  button: {
    backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.lg,
    alignItems: 'center', marginTop: SPACING.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  footerLink: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
});
