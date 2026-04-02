// FleetOn — Maintenance Home Screen (theme-aware)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, AppState, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { getCurrentUser, getMaintenanceParts, deleteMaintenancePart, getCars, subscribeToCars } from '../lib/database';

export default function MaintenanceHomeScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [user, setUser] = useState(null);
  const [parts, setParts] = useState([]);
  const [cars, setCars] = useState([]);
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
    const [partsData, carsData] = await Promise.all([getMaintenanceParts(companyId), getCars(companyId)]);
    setParts(partsData); setCars(carsData);
    partsData.forEach(part => {
      const car = carsData.find(c => c.id === part.car_id);
      if (car) { const remaining = part.alert_km - (car.current_km || 0); if (remaining <= 500 && remaining > 0) Vibration.vibrate([0, 300, 200, 300]); }
    });
  };

  const subscribeCars = (companyId) => { subscribeToCars(companyId, () => loadData(companyId)); };

  const handleDeletePart = (partId) => {
    Alert.alert(i18n.t('deletePart'), i18n.t('confirm'), [
      { text: i18n.t('cancel'), style: 'cancel' },
      { text: i18n.t('delete'), style: 'destructive', onPress: async () => { await deleteMaintenancePart(partId); if (user) loadData(user.company_id); } },
    ]);
  };

  const s = styles(COLORS);

  const renderPart = ({ item }) => {
    const car = cars.find(c => c.id === item.car_id);
    const currentKm = car?.current_km || 0;
    const remaining = item.alert_km - currentKm;
    const isAlert = remaining <= 500 && remaining > 0;
    const isOverdue = remaining <= 0;
    return (
      <View style={[s.partCard, isAlert && s.alertCard, isOverdue && s.overdueCard]}>
        <View style={s.partHeader}>
          <Text style={s.partEmoji}>{isOverdue ? '🚨' : isAlert ? '⚠️' : '🔩'}</Text>
          <View style={{ flex: 1 }}><Text style={s.partName}>{item.part_name}</Text><Text style={s.partCar}>🚗 {car?.plate || '—'}</Text></View>
          <TouchableOpacity onPress={() => handleDeletePart(item.id)}><Text style={s.deleteBtn}>🗑️</Text></TouchableOpacity>
        </View>
        <View style={s.partStats}>
          <View style={s.partStat}><Text style={s.partStatLabel}>{i18n.t('currentKm')}</Text><Text style={s.partStatValue}>{currentKm.toLocaleString()} KM</Text></View>
          <View style={s.partStat}><Text style={s.partStatLabel}>{i18n.t('alertKm')}</Text><Text style={s.partStatValue}>{item.alert_km?.toLocaleString()} KM</Text></View>
          <View style={s.partStat}><Text style={s.partStatLabel}>{i18n.t('kmRemaining')}</Text><Text style={[s.partStatValue, { color: isOverdue ? COLORS.danger : isAlert ? COLORS.warning : COLORS.available }]}>{remaining > 0 ? remaining.toLocaleString() : i18n.locale === 'ar' ? 'تجاوز!' : 'OVERDUE!'}</Text></View>
        </View>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${Math.min(100, (currentKm / item.alert_km) * 100)}%`, backgroundColor: isOverdue ? COLORS.danger : isAlert ? COLORS.warning : COLORS.primary }]} /></View>
      </View>
    );
  };

  const alertCount = parts.filter(p => { const car = cars.find(c => c.id === p.car_id); return (p.alert_km - (car?.current_km || 0)) <= 500; }).length;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View><Text style={s.headerTitle}>🔧 {i18n.t('maintenance')}</Text>{user && <Text style={s.headerSub}>{user.name}</Text>}</View>
        <TouchableOpacity style={s.addButton} onPress={() => navigation.navigate('AddPart')}><Text style={s.addButtonText}>+ {i18n.t('addPart')}</Text></TouchableOpacity>
      </View>
      {alertCount > 0 && (<View style={s.alertBanner}><Text style={s.alertBannerText}>⚠️ {alertCount} {i18n.t('maintenanceAlert')}{alertCount > 1 ? 's' : ''}</Text></View>)}
      <FlatList data={parts} keyExtractor={item => item.id} renderItem={renderPart} contentContainerStyle={s.listContent}
        ListEmptyComponent={<View style={s.emptyContainer}><Text style={s.emptyEmoji}>🔧</Text><Text style={s.emptyText}>{i18n.t('noPartsYet')}</Text></View>} />
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  headerSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  addButton: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  addButtonText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  alertBanner: { backgroundColor: COLORS.warning + '20', marginHorizontal: SPACING.lg, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.warning },
  alertBannerText: { color: COLORS.warning, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  listContent: { padding: SPACING.lg },
  partCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  alertCard: { borderLeftWidth: 4, borderLeftColor: COLORS.warning },
  overdueCard: { borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  partHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  partEmoji: { fontSize: 28, marginRight: SPACING.md },
  partName: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  partCar: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 2 },
  deleteBtn: { fontSize: 20, padding: SPACING.sm },
  partStats: { flexDirection: 'row', marginBottom: SPACING.md },
  partStat: { flex: 1 },
  partStatLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  partStatValue: { color: COLORS.textPrimary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, marginTop: 2 },
  progressBar: { height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
});
