// FleetOn — Owner Home Screen (theme-aware)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, AppState, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { getCurrentUser, getDashboardStats, getCars, getTrips, getTeamMembers, subscribeToCars } from '../lib/database';

export default function OwnerHomeScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [recentTrips, setRecentTrips] = useState([]);
  const [teamCount, setTeamCount] = useState(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => { init(); const sub = AppState.addEventListener('change', handleAppState); return () => sub.remove(); }, []);

  const init = async () => {
    const userData = await getCurrentUser();
    setUser(userData);
    await loadData(userData.company_id);
    subscribeCars(userData.company_id);
  };

  const handleAppState = useCallback((nextState) => {
    if (appState.current.match(/inactive|background/) && nextState === 'active') { if (user) loadData(user.company_id); }
    appState.current = nextState;
  }, [user]);

  const loadData = async (companyId) => {
    const [statsData, tripsData, teamData] = await Promise.all([getDashboardStats(companyId), getTrips(companyId, { limit: 5 }), getTeamMembers(companyId)]);
    setStats(statsData); setRecentTrips(tripsData); setTeamCount(teamData.length);
  };

  const subscribeCars = (companyId) => { subscribeToCars(companyId, () => loadData(companyId)); };

  const s = styles(COLORS);
  const plan = user?.company?.plan || 'free';
  const company = user?.company;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.header}><Text style={s.headerTitle}>👑 {i18n.t('owner')}</Text>{user && <Text style={s.headerSub}>{user.name} — {company?.name}</Text>}</View>
        <View style={s.planBadge}>
          <Text style={s.planText}>📦 {i18n.t('currentPlan')}: {plan.toUpperCase()}</Text>
          <Text style={s.planLimits}>🚗 {company?.cars_limit === 999999 ? '∞' : company?.cars_limit} cars • 👥 {teamCount} {i18n.t('members')}</Text>
        </View>
        <View style={s.statsGrid}>
          {[{ emoji: '🚗', num: stats.totalCars || 0, label: i18n.t('totalCars'), color: COLORS.primary },
            { emoji: '🟢', num: stats.availableCars || 0, label: i18n.t('available'), color: COLORS.available },
            { emoji: '🔴', num: stats.activeCars || 0, label: i18n.t('busy'), color: COLORS.danger },
            { emoji: '📋', num: stats.totalTrips || 0, label: i18n.t('totalTrips'), color: COLORS.info },
          ].map((stat, idx) => (
            <View key={idx} style={[s.statCard, { borderColor: stat.color }]}><Text style={s.statEmoji}>{stat.emoji}</Text><Text style={[s.statNum, { color: stat.color }]}>{stat.num}</Text><Text style={s.statLabel}>{stat.label}</Text></View>
          ))}
        </View>
        <Text style={s.sectionTitle}>{i18n.t('quickActions')}</Text>
        <View style={s.actionsGrid}>
          <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('ManageTeam')}><Text style={s.actionEmoji}>👥</Text><Text style={s.actionLabel}>{i18n.t('manageTeam')}</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('AddCar')}><Text style={s.actionEmoji}>➕</Text><Text style={s.actionLabel}>{i18n.t('addCar')}</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionCard} onPress={() => { if (company) Alert.alert(i18n.t('groupCode'), `${i18n.t('driverCode')}: ${company.driver_code}\n${i18n.t('dispatcherCode')}: ${company.dispatcher_code}`); }}><Text style={s.actionEmoji}>📱</Text><Text style={s.actionLabel}>{i18n.t('groupCode')}</Text></TouchableOpacity>
          <TouchableOpacity style={s.actionCard}><Text style={s.actionEmoji}>📊</Text><Text style={s.actionLabel}>{i18n.t('tripReport')}</Text></TouchableOpacity>
        </View>
        <Text style={s.sectionTitle}>{i18n.t('recentTrips')}</Text>
        {recentTrips.map(trip => (
          <View key={trip.id} style={s.tripCard}>
            <View style={s.tripHeader}><Text style={s.tripCar}>🚗 {trip.car?.plate || '—'}</Text><Text style={[s.tripStatus, { color: trip.status === 'completed' ? COLORS.available : COLORS.warning }]}>{trip.status === 'completed' ? '✅' : '🔵'} {trip.status}</Text></View>
            <Text style={s.tripDriver}>👤 {trip.driver?.name || '—'}</Text>
            <Text style={s.tripInfo}>📍 {trip.start_location || '—'} → {trip.end_location || '...'}</Text>
            {trip.start_km != null && <Text style={s.tripKm}>{trip.start_km?.toLocaleString()} → {trip.end_km?.toLocaleString() || '...'} KM</Text>}
          </View>
        ))}
        {recentTrips.length === 0 && <View style={s.emptyContainer}><Text style={s.emptyText}>{i18n.t('noTripsYet')}</Text></View>}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  headerSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  planBadge: { backgroundColor: COLORS.primary + '20', marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.primary + '40' },
  planText: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  planLimits: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', borderWidth: 1 },
  statEmoji: { fontSize: 24, marginBottom: SPACING.xs },
  statNum: { fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold, paddingHorizontal: SPACING.xxl, marginBottom: SPACING.md, marginTop: SPACING.md },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginBottom: SPACING.lg },
  actionCard: { width: '48%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  actionEmoji: { fontSize: 28, marginBottom: SPACING.sm },
  actionLabel: { color: COLORS.textPrimary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium },
  tripCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripCar: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  tripStatus: { fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium },
  tripDriver: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 4 },
  tripInfo: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 4 },
  tripKm: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  emptyContainer: { padding: SPACING.xxl, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
});
