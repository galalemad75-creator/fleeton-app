// FleetOn — Dispatcher Home Screen (theme-aware)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, AppState, Vibration, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { getCurrentUser, getCars, sendMessage, getTeamMembers, subscribeToCars } from '../lib/database';

export default function DispatcherHomeScreen() {
  const { COLORS } = useTheme();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [viewMode, setViewMode] = useState('map');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [messageText, setMessageText] = useState('');
  const appState = useRef(AppState.currentState);
  const mapRef = useRef(null);

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
    const [carsData, teamData] = await Promise.all([getCars(companyId), getTeamMembers(companyId)]);
    setCars(carsData);
    setDrivers(teamData.filter(m => m.role === 'driver'));
  };

  const subscribeCars = (companyId) => { subscribeToCars(companyId, () => loadData(companyId)); };

  const handleSendMessage = async (driverId) => {
    if (!messageText.trim()) return;
    try {
      await sendMessage({ senderId: user.id, receiverId: driverId, type: 'text', content: messageText.trim() });
      setMessageText(''); setSelectedDriver(null);
      Alert.alert('✅', i18n.t('sendMessage'));
    } catch (err) { Alert.alert(i18n.t('error'), err.message); }
  };

  const s = styles(COLORS);
  const availableCars = cars.filter(c => c.status === 'available');
  const busyCars = cars.filter(c => c.status === 'busy');

  const renderCarItem = ({ item }) => (
    <View style={[s.carCard, item.status === 'busy' && s.busyCard]}>
      <View style={s.carHeader}>
        <View style={[s.statusDot, { backgroundColor: item.status === 'available' ? COLORS.available : COLORS.busy }]} />
        <Text style={s.carPlate}>{item.plate}</Text>
      </View>
      {item.status === 'busy' && item.current_driver && (
        <View style={s.carDetail}>
          <Text style={s.carInfo}>👤 {item.current_driver.name}</Text>
          {item.last_location && <Text style={s.carInfo}>📍 {item.last_location}</Text>}
          <TouchableOpacity style={s.voiceBtn} onPress={() => { setSelectedDriver(item.current_driver); Vibration.vibrate(100); }}>
            <Text style={s.voiceBtnText}>🎤 {i18n.t('sendVoice')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === 'available' && <Text style={s.carInfo}>{i18n.t('lastSeen')}: {item.last_location || '—'}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <View><Text style={s.headerTitle}>📡 {i18n.t('dispatcher')}</Text>{user && <Text style={s.headerSub}>{user.name}</Text>}</View>
        <View style={s.viewToggle}>
          <TouchableOpacity style={[s.toggleBtn, viewMode === 'map' && s.toggleActive]} onPress={() => setViewMode('map')}><Text style={s.toggleText}>🗺️</Text></TouchableOpacity>
          <TouchableOpacity style={[s.toggleBtn, viewMode === 'list' && s.toggleActive]} onPress={() => setViewMode('list')}><Text style={s.toggleText}>📋</Text></TouchableOpacity>
        </View>
      </View>
      <View style={s.statsBar}>
        <View style={s.statItem}><Text style={s.statNum}>{availableCars.length}</Text><Text style={s.statLabel}>🟢 {i18n.t('available')}</Text></View>
        <View style={s.statItem}><Text style={[s.statNum, { color: COLORS.danger }]}>{busyCars.length}</Text><Text style={s.statLabel}>🔴 {i18n.t('busy')}</Text></View>
        <View style={s.statItem}><Text style={s.statNum}>{cars.length}</Text><Text style={s.statLabel}>{i18n.t('allVehicles')}</Text></View>
      </View>
      {viewMode === 'map' ? (
        <MapView ref={mapRef} style={s.map} initialRegion={{ latitude: 30.0444, longitude: 31.2357, latitudeDelta: 0.5, longitudeDelta: 0.5 }}>
          {cars.map(car => car.last_lat && (
            <Marker key={car.id} coordinate={{ latitude: car.last_lat, longitude: car.last_lng }} pinColor={car.status === 'available' ? 'green' : 'red'} title={car.plate} description={car.status === 'busy' ? `👤 ${car.current_driver?.name || '—'}` : i18n.t('available')} />
          ))}
        </MapView>
      ) : (
        <FlatList data={cars} keyExtractor={item => item.id} renderItem={renderCarItem} contentContainerStyle={s.listContent} />
      )}
      {selectedDriver && (
        <View style={s.messageModal}>
          <View style={s.messageModalContent}>
            <Text style={s.messageModalTitle}>📤 {i18n.t('sendMessage')} → {selectedDriver.name}</Text>
            <TextInput style={s.messageInput} placeholder={i18n.t('sendMessage')} placeholderTextColor={COLORS.textMuted} value={messageText} onChangeText={setMessageText} multiline />
            <View style={s.messageActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => { setSelectedDriver(null); setMessageText(''); }}><Text style={s.cancelBtnText}>{i18n.t('cancel')}</Text></TouchableOpacity>
              <TouchableOpacity style={s.sendBtn} onPress={() => handleSendMessage(selectedDriver.id)}><Text style={s.sendBtnText}>📤 {i18n.t('sendMessage')}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  headerSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  viewToggle: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.md },
  toggleBtn: { padding: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 18 },
  statsBar: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  statItem: { flex: 1, alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, marginHorizontal: 4 },
  statNum: { color: COLORS.available, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  map: { flex: 1, margin: SPACING.lg, borderRadius: RADIUS.lg },
  listContent: { padding: SPACING.lg },
  carCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  busyCard: { borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  carHeader: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  carPlate: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  carDetail: { marginTop: SPACING.sm, paddingLeft: SPACING.lg },
  carInfo: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 4 },
  voiceBtn: { backgroundColor: COLORS.info, borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.sm, alignSelf: 'flex-start' },
  voiceBtnText: { color: '#fff', fontSize: FONTS.sizes.sm },
  messageModal: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.overlay, justifyContent: 'center', padding: SPACING.xxl },
  messageModalContent: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xxl },
  messageModalTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, marginBottom: SPACING.lg },
  messageInput: { backgroundColor: COLORS.background, color: COLORS.textPrimary, borderRadius: RADIUS.md, padding: SPACING.lg, fontSize: FONTS.sizes.md, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: COLORS.border },
  messageActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  cancelBtn: { flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  cancelBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  sendBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  sendBtnText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
});
