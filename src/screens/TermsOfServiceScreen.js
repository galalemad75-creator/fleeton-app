// FleetOn — Terms of Service Screen (enhanced with Google Play + App Store + AdSense)
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

  const NumberedList = ({ title, items }) => (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {items.map((item, idx) => (
        <View key={idx} style={s.listItem}>
          <Text style={s.listNumber}>{idx + 1}.</Text>
          <Text style={s.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const gpTerms = [
    i18n.t('termsGP1'), i18n.t('termsGP2'), i18n.t('termsGP3'), i18n.t('termsGP4'),
    i18n.t('termsGP5'), i18n.t('termsGP6'), i18n.t('termsGP7'), i18n.t('termsGP8'),
    i18n.t('termsGP9'), i18n.t('termsGP10'), i18n.t('termsGP11'), i18n.t('termsGP12'),
    i18n.t('termsGP13'), i18n.t('termsGP14'), i18n.t('termsGP15'),
  ];

  const asTerms = [
    i18n.t('termsAS1'), i18n.t('termsAS2'), i18n.t('termsAS3'), i18n.t('termsAS4'),
    i18n.t('termsAS5'), i18n.t('termsAS6'), i18n.t('termsAS7'), i18n.t('termsAS8'),
    i18n.t('termsAS9'), i18n.t('termsAS10'), i18n.t('termsAS11'), i18n.t('termsAS12'),
    i18n.t('termsAS13'), i18n.t('termsAS14'), i18n.t('termsAS15'),
  ];

  const adTerms = [
    i18n.t('termsAD1'), i18n.t('termsAD2'), i18n.t('termsAD3'), i18n.t('termsAD4'),
    i18n.t('termsAD5'), i18n.t('termsAD6'), i18n.t('termsAD7'), i18n.t('termsAD8'),
    i18n.t('termsAD9'), i18n.t('termsAD10'), i18n.t('termsAD11'),
  ];

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
            {i18n.t('effectiveDate')}: April 2025
          </Text>
        </View>

        {/* Core Terms */}
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

        {/* Store Compliance */}
        <NumberedList title={`🏪 ${i18n.t('termsGooglePlay')}`} items={gpTerms} />
        <NumberedList title={`🍎 ${i18n.t('termsAppStore')}`} items={asTerms} />
        <NumberedList title={`📢 ${i18n.t('termsAdSense')}`} items={adTerms} />

        {/* Cross-links */}
        <View style={s.crossLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={s.linkText}>🔒 {i18n.t('viewPrivacyPolicy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('RefundPolicy')}>
            <Text style={s.linkText}>💰 {i18n.t('viewRefund')}</Text>
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
  listItem: { flexDirection: 'row', marginBottom: SPACING.sm, paddingRight: SPACING.md },
  listNumber: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, marginRight: SPACING.sm, minWidth: 24 },
  listText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, flex: 1, lineHeight: 22 },
  crossLinks: {
    marginBottom: SPACING.xxl, paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  linkText: { color: COLORS.primary, fontSize: FONTS.sizes.md, marginBottom: SPACING.md, fontWeight: FONTS.weights.medium },
  footer: { alignItems: 'center', marginTop: SPACING.lg, paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  footerMade: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: SPACING.xs },
});
