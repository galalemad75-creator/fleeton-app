// FleetOn — Refund & Replacement Policy Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';

export default function RefundPolicyScreen({ navigation }) {
  const { COLORS } = useTheme();
  const s = styles(COLORS);

  const Section = ({ title, text }) => (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← {i18n.t('back')}</Text>
        </TouchableOpacity>

        <View style={s.hero}>
          <Text style={s.heroEmoji}>💰</Text>
          <Text style={s.heroTitle}>{i18n.t('refundTitle')}</Text>
          <Text style={s.heroDate}>
            {i18n.t('lastUpdated')}: April 2025
          </Text>
        </View>

        <Section title={i18n.t('refundIntro').split('.')[0]} text={i18n.t('refundIntro')} />
        <Section title={i18n.t('refundEligibility')} text={i18n.t('refundEligibilityText')} />
        <Section title={i18n.t('refundProcess')} text={i18n.t('refundProcessText')} />
        <Section title={i18n.t('refundTimeline')} text={i18n.t('refundTimelineText')} />
        <Section title={i18n.t('refundPartial')} text={i18n.t('refundPartialText')} />
        <Section title={i18n.t('refundReplacement')} text={i18n.t('refundReplacementText')} />
        <Section title={i18n.t('refundCancellation')} text={i18n.t('refundCancellationText')} />
        <Section title={i18n.t('refundExceptions')} text={i18n.t('refundExceptionsText')} />
        <Section title={i18n.t('refundContact')} text={i18n.t('refundContactText')} />

        {/* Cross-links */}
        <View style={s.crossLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={s.linkText}>🔒 {i18n.t('viewPrivacyPolicy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={s.linkText}>📄 {i18n.t('viewTerms')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
            <Text style={s.linkText}>📬 {i18n.t('viewContact')}</Text>
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
  heroDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: SPACING.sm },
  section: { marginBottom: SPACING.xxl },
  sectionTitle: { color: COLORS.primary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  sectionText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, lineHeight: 24 },
  crossLinks: {
    marginBottom: SPACING.xxl, paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  linkText: { color: COLORS.primary, fontSize: FONTS.sizes.md, marginBottom: SPACING.md, fontWeight: FONTS.weights.medium },
  footer: { alignItems: 'center', marginTop: SPACING.lg, paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  footerMade: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: SPACING.xs },
});
