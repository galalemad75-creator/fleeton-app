// FleetOn — Trip Detail Screen (theme-aware)
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';

export default function TripDetailScreen({ route, navigation }) {
  const { COLORS } = useTheme();
  const trip = route?.params?.trip || {};
  const s = styles(COLORS);
  const km = (trip.end_km || 0) - (trip.start_km || 0);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← {i18n.t('back')}</Text>
        </TouchableOpacity>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>🚗</Text>
          <Text style={s.heroTitle}>{trip.car?.plate || '—'}</Text>
          <Text style={[s.statusBadge, { color: trip.status === 'completed' ? COLORS.available : COLORS.warning }]}>
            {trip.status === 'completed' ? '✅ Completed' : '🔵 Active'}
          </Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>{i18n.locale === 'ar' ? 'تفاصيل الرحلة' : 'Trip Details'}</Text>
          <View style={s.row}><Text style={s.rowLabel}>👤 {i18n.locale === 'ar' ? 'السائق' : 'Driver'}</Text><Text style={s.rowValue}>{trip.driver?.name || '—'}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>📍 {i18n.locale === 'ar' ? 'البداية' : 'Start'}</Text><Text style={s.rowValue}>{trip.start_location || '—'}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>📍 {i18n.locale === 'ar' ? 'النهاية' : 'End'}</Text><Text style={s.rowValue}>{trip.end_location || '—'}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>📏 {i18n.locale === 'ar' ? 'كم البداية' : 'Start KM'}</Text><Text style={s.rowValue}>{(trip.start_km || 0).toLocaleString()}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>📏 {i18n.locale === 'ar' ? 'كم النهاية' : 'End KM'}</Text><Text style={s.rowValue}>{(trip.end_km || 0).toLocaleString()}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>🛣️ {i18n.locale === 'ar' ? 'المسافة' : 'Distance'}</Text><Text style={[s.rowValue, { color: COLORS.primary }]}>{km.toLocaleString()} KM</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>🕐 {i18n.locale === 'ar' ? 'وقت البدء' : 'Started'}</Text><Text style={s.rowValue}>{trip.started_at ? new Date(trip.started_at).toLocaleString() : '—'}</Text></View>
          <View style={s.row}><Text style={s.rowLabel}>🕐 {i18n.locale === 'ar' ? 'وقت الانتهاء' : 'Ended'}</Text><Text style={s.rowValue}>{trip.ended_at ? new Date(trip.ended_at).toLocaleString() : '—'}</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.xxl },
  backBtn: { marginBottom: SPACING.lg },
  backText: { color: COLORS.primary, fontSize: FONTS.sizes.md },
  hero: { alignItems: 'center', marginBottom: SPACING.xxl, paddingBottom: SPACING.xxl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heroEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  heroTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxxl, fontWeight: FONTS.weights.bold },
  statusBadge: { fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, marginTop: SPACING.sm },
  section: { marginBottom: SPACING.xxl },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  rowValue: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
});
