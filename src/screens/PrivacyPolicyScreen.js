// FleetOn — Privacy Policy Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';

export default function PrivacyPolicyScreen({ navigation }) {
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
          <Text style={s.heroEmoji}>🔒</Text>
          <Text style={s.heroTitle}>{i18n.t('privacyPolicy')}</Text>
          <Text style={s.heroDate}>
            {i18n.t('lastUpdated')}: April 2024
          </Text>
        </View>

        <Section title={i18n.t('privacyIntro').split('.')[0]} text={i18n.t('privacyIntro')} />
        <Section title={i18n.t('privacyInfoCollected')} text={i18n.t('privacyInfoCollectedText')} />
        <Section title={i18n.t('privacyHowWeUse')} text={i18n.t('privacyHowWeUseText')} />
        <Section title={i18n.t('privacyDataSecurity')} text={i18n.t('privacyDataSecurityText')} />
        <Section title={i18n.t('privacyThirdParty')} text={i18n.t('privacyThirdPartyText')} />
        <Section title={i18n.t('privacyDataRetention')} text={i18n.t('privacyDataRetentionText')} />
        <Section title={i18n.t('privacyYourRights')} text={i18n.t('privacyYourRightsText')} />
        <Section title={i18n.t('privacyChildren')} text={i18n.t('privacyChildrenText')} />
        <Section title={i18n.t('privacyChanges')} text={i18n.t('privacyChangesText')} />
        <Section title={i18n.t('privacyContact')} text={i18n.t('privacyContactText')} />

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
