// FleetOn — Accountant Home Screen (theme-aware)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { getCurrentUser, getTrips } from '../lib/database';

export default function AccountantHomeScreen() {
  const { COLORS } = useTheme();
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const appState = useRef(AppState.currentState);

  useEffect(() => { init(); const sub = AppState.addEventListener('change', handleAppState); return () => sub.remove(); }, []);

  const init = async () => {
    const userData = await getCurrentUser();
    setUser(userData);
    await loadTrips(userData.company_id);
  };

  const handleAppState = useCallback((nextState) => {
    if (appState.current.match(/inactive|background/) && nextState === 'active') { if (user) loadTrips(user.company_id); }
    appState.current = nextState;
  }, [user]);

  const loadTrips = async (companyId) => {
    const data = await getTrips(companyId, { limit: 50 });
    setTrips(data.filter(t => t.status === 'completed'));
  };

  const s = styles(COLORS);

  const totalKm = trips.reduce((sum, t) => sum + ((t.end_km || 0) - (t.start_km || 0)), 0);
  const avgKm = trips.length > 0 ? Math.round(totalKm / trips.length) : 0;

  const renderTrip = ({ item }) => {
    const km = (item.end_km || 0) - (item.start_km || 0);
    return (
      <View style={s.tripCard}>
        <View style={s.tripRow}>
          <Text style={s.tripCar}>🚗 {item.car?.plate || '—'}</Text>
          <Text style={s.tripKm}>{km.toLocaleString()} KM</Text>
        </View>
        <Text style={s.tripDriver}>👤 {item.driver?.name || '—'}</Text>
        <Text style={s.tripInfo}>📍 {item.start_location || '—'} → {item.end_location || '...'}</Text>
        <Text style={s.tripDate}>{new Date(item.started_at).toLocaleDateString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}><Text style={s.headerTitle}>📊 {i18n.t('accountant')}</Text>{user && <Text style={s.headerSub}>{user.name}</Text>}</View>
      <View style={s.statsRow}>
        <View style={s.statCard}><Text style={s.statNum}>{trips.length}</Text><Text style={s.statLabel}>{i18n.t('totalTrips')}</Text></View>
        <View style={s.statCard}><Text style={s.statNum}>{totalKm.toLocaleString()}</Text><Text style={s.statLabel}>{i18n.locale === 'ar' ? 'إجمالي كم' : 'Total KM'}</Text></View>
        <View style={s.statCard}><Text style={s.statNum}>{avgKm}</Text><Text style={s.statLabel}>{i18n.locale === 'ar' ? 'متوسط كم' : 'Avg KM'}</Text></View>
      </View>
      <FlatList data={trips} keyExtractor={item => item.id} renderItem={renderTrip} contentContainerStyle={s.listContent}
        ListEmptyComponent={<View style={s.emptyContainer}><Text style={s.emptyEmoji}>📊</Text><Text style={s.emptyText}>{i18n.t('noTripsYet')}</Text></View>} />
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  headerSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statNum: { color: COLORS.primary, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  listContent: { padding: SPACING.lg },
  tripCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  tripRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripCar: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  tripKm: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  tripDriver: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 4 },
  tripInfo: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 4 },
  tripDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
});
