// FleetOn — About Us Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';

export default function AboutUsScreen({ navigation }) {
  const { COLORS } = useTheme();
  const s = styles(COLORS);

  const features = [
    i18n.t('aboutFeature1'),
    i18n.t('aboutFeature2'),
    i18n.t('aboutFeature3'),
    i18n.t('aboutFeature4'),
    i18n.t('aboutFeature5'),
    i18n.t('aboutFeature6'),
    i18n.t('aboutFeature7'),
    i18n.t('aboutFeature8'),
  ];

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← {i18n.t('back')}</Text>
        </TouchableOpacity>

        {/* Logo Section */}
        <View style={s.logoSection}>
          <Text style={s.logoEmoji}>🚗</Text>
          <Text style={s.logoTitle}>{i18n.t('appName')}</Text>
          <Text style={s.logoTagline}>{i18n.t('tagline')}</Text>
          <View style={s.versionBadge}>
            <Text style={s.versionText}>{i18n.t('aboutVersion')} 1.0.0</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎯 {i18n.t('aboutMission')}</Text>
          <Text style={s.sectionText}>{i18n.t('aboutMissionText')}</Text>
        </View>

        {/* Features */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>✨ {i18n.t('aboutFeatures')}</Text>
          {features.map((feat, idx) => (
            <View key={idx} style={s.featureRow}>
              <Text style={s.featureBullet}>•</Text>
              <Text style={s.featureText}>{feat}</Text>
            </View>
          ))}
        </View>

        {/* Team */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>👥 {i18n.t('aboutTeam')}</Text>
          <Text style={s.sectionText}>{i18n.t('aboutTeamText')}</Text>
        </View>

        {/* Contact */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>📬 {i18n.t('aboutContact')}</Text>
          <Text style={s.sectionText}>{i18n.t('aboutContactText')}</Text>

          <TouchableOpacity style={s.contactRow} onPress={() => Linking.openURL('mailto:support@fleeton.app')}>
            <Text style={s.contactEmoji}>📧</Text>
            <Text style={s.contactText}>support@fleeton.app</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.contactRow} onPress={() => Linking.openURL('https://fleeton.app')}>
            <Text style={s.contactEmoji}>🌐</Text>
            <Text style={s.contactText}>fleeton.app</Text>
          </TouchableOpacity>
        </View>

        {/* Pricing */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💰 {i18n.t('currentPlan')}</Text>
          {[
            { name: 'Free Trial', price: '$0', cars: '1 car', desc: '7 days' },
            { name: 'Starter', price: '$10/car/mo', cars: '5 cars', desc: '' },
            { name: 'Business', price: '$18/car/mo', cars: '30 cars', desc: '' },
            { name: 'Enterprise', price: '$25/car/mo', cars: 'Unlimited', desc: '+ API' },
          ].map((plan, idx) => (
            <View key={idx} style={s.planRow}>
              <View style={s.planLeft}>
                <Text style={s.planName}>{plan.name}</Text>
                <Text style={s.planCars}>{plan.cars} {plan.desc ? `• ${plan.desc}` : ''}</Text>
              </View>
              <Text style={s.planPrice}>{plan.price}</Text>
            </View>
          ))}
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
  logoSection: { alignItems: 'center', marginBottom: SPACING.xxxl, paddingBottom: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  logoEmoji: { fontSize: 64, marginBottom: SPACING.sm },
  logoTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.hero, fontWeight: FONTS.weights.bold, letterSpacing: 3 },
  logoTagline: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: SPACING.xs },
  versionBadge: { backgroundColor: COLORS.primary + '20', borderRadius: RADIUS.full, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.lg, marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.primary + '40' },
  versionText: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },
  section: { marginBottom: SPACING.xxl },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  sectionText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, lineHeight: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  featureBullet: { color: COLORS.primary, fontSize: FONTS.sizes.lg, marginRight: SPACING.md, marginTop: 2 },
  featureText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, flex: 1, lineHeight: 22 },
  contactRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  contactEmoji: { fontSize: 20, marginRight: SPACING.md },
  contactText: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.medium },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  planLeft: { flex: 1 },
  planName: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  planCars: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  planPrice: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  footer: { alignItems: 'center', marginTop: SPACING.xxl, paddingTop: SPACING.xxl, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  footerMade: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: SPACING.xs },
});
