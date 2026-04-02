// FleetOn — Terms of Service Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';

export default function TermsOfServiceScreen({ navigation }) {
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
          <Text style={s.heroEmoji}>📄</Text>
          <Text style={s.heroTitle}>{i18n.t('terms')}</Text>
          <Text style={s.heroDate}>
            {i18n.t('effectiveDate')}: April 2024
          </Text>
        </View>

        <Section title={i18n.t('termsAcceptance')} text={i18n.t('termsAcceptanceText')} />
        <Section title={i18n.t('termsDescription')} text={i18n.t('termsDescriptionText')} />
        <Section title={i18n.t('termsAccount')} text={i18n.t('termsAccountText')} />
        <Section title={i18n.t('termsUsage')} text={i18n.t('termsUsageText')} />
        <Section title={i18n.t('termsSubscription')} text={i18n.t('termsSubscriptionText')} />
        <Section title={i18n.t('termsLocation')} text={i18n.t('termsLocationText')} />
        <Section title={i18n.t('termsIP')} text={i18n.t('termsIPText')} />
        <Section title={i18n.t('termsTermination')} text={i18n.t('termsTerminationText')} />
        <Section title={i18n.t('termsDisclaimer')} text={i18n.t('termsDisclaimerText')} />
        <Section title={i18n.t('termsLiability')} text={i18n.t('termsLiabilityText')} />
        <Section title={i18n.t('termsGoverning')} text={i18n.t('termsGoverningText')} />

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
});
