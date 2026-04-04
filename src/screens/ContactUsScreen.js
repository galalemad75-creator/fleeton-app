// FleetOn — Contact Us Screen (with form → emadh5156@gmail.com)
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Linking, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';

export default function ContactUsScreen({ navigation }) {
  const { COLORS } = useTheme();
  const s = styles(COLORS);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert(i18n.t('error'), i18n.t('contactRequired'));
      return;
    }

    setSending(true);
    const body = `Name: ${name}%0AEmail: ${email}%0A%0A${encodeURIComponent(message)}`;
    const mailUrl = `mailto:emadh5156@gmail.com?subject=${encodeURIComponent('[FleetOn] ' + subject)}&body=${body}`;

    Linking.openURL(mailUrl)
      .then(() => {
        Alert.alert(i18n.t('success'), i18n.t('contactSuccess'));
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      })
      .catch(() => {
        Alert.alert(i18n.t('error'), i18n.t('contactError'));
      })
      .finally(() => setSending(false));
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scrollContent}>
          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← {i18n.t('back')}</Text>
          </TouchableOpacity>

          <View style={s.hero}>
            <Text style={s.heroEmoji}>📬</Text>
            <Text style={s.heroTitle}>{i18n.t('contactTitle')}</Text>
            <Text style={s.heroSub}>{i18n.t('contactSubtitle')}</Text>
          </View>

          {/* Contact Info Card */}
          <View style={s.infoCard}>
            <Text style={s.infoTitle}>📋 {i18n.t('contactInfo')}</Text>

            <TouchableOpacity style={s.infoRow} onPress={() => Linking.openURL('mailto:emadh5156@gmail.com')}>
              <Text style={s.infoEmoji}>📧</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.infoLabel}>{i18n.t('contactDirectEmail')}</Text>
                <Text style={s.infoValue}>emadh5156@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <View style={s.infoRow}>
              <Text style={s.infoEmoji}>⏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.infoLabel}>{i18n.t('contactResponse')}</Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={s.formSection}>
            <Text style={s.formTitle}>✉️ {i18n.t('contactTitle')}</Text>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>{i18n.t('contactName')}</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder={i18n.t('contactName')}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>{i18n.t('contactEmail')}</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>{i18n.t('contactSubject')}</Text>
              <TextInput
                style={s.input}
                value={subject}
                onChangeText={setSubject}
                placeholder={i18n.t('contactSubject')}
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>{i18n.t('contactMessage')}</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder={i18n.t('contactMessage')}
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[s.sendBtn, sending && { opacity: 0.6 }]}
              onPress={handleSend}
              disabled={sending}
            >
              <Text style={s.sendBtnText}>
                {sending ? `⏳ ${i18n.t('loading')}` : `📤 ${i18n.t('contactSend')}`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cross-links */}
          <View style={s.crossLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text style={s.linkText}>🔒 {i18n.t('viewPrivacyPolicy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
              <Text style={s.linkText}>📄 {i18n.t('viewTerms')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('RefundPolicy')}>
              <Text style={s.linkText}>💰 {i18n.t('viewRefund')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('AboutUs')}>
              <Text style={s.linkText}>ℹ️ {i18n.t('viewAboutUs')}</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>{i18n.t('aboutCopyright')}</Text>
            <Text style={s.footerMade}>{i18n.t('aboutMadeWith')}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.xxl },
  backBtn: { marginBottom: SPACING.lg },
  backText: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  hero: { alignItems: 'center', marginBottom: SPACING.xxl, paddingBottom: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heroEmoji: { fontSize: 48, marginBottom: SPACING.md },
  heroTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.bold, textAlign: 'center' },
  heroSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: SPACING.sm, textAlign: 'center', lineHeight: 22 },

  infoCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.xxl, borderWidth: 1, borderColor: COLORS.border },
  infoTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoEmoji: { fontSize: 20, marginRight: SPACING.md },
  infoLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  infoValue: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, marginTop: 2 },

  formSection: { marginBottom: SPACING.xxl },
  formTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  inputLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.surface, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: SPACING.md, fontSize: FONTS.sizes.md,
  },
  textArea: { minHeight: 120, paddingTop: SPACING.md },
  sendBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginTop: SPACING.md,
  },
  sendBtnText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },

  crossLinks: {
    marginBottom: SPACING.xxl, paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  linkText: { color: COLORS.primary, fontSize: FONTS.sizes.md, marginBottom: SPACING.md, fontWeight: FONTS.weights.medium },

  footer: { alignItems: 'center', marginTop: SPACING.lg, paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  footerMade: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: SPACING.xs },
});
