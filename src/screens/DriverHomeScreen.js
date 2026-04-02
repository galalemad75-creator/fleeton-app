// FleetOn — Driver Home Screen (with GPS tracking + error handling)
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Alert, AppState, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';

import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import {
  getCurrentUser, getCars, startTrip, endTrip, updateCar,
  getMessages, acknowledgeMessage, subscribeToMessages,
} from '../lib/database';

export default function DriverHomeScreen() {
  const { COLORS } = useTheme();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [activeCar, setActiveCar] = useState(null);
  const [messages, setMessages] = useState([]);
  const [hasLocation, setHasLocation] = useState(false);
  const locationSub = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    init();
    const sub = AppState.addEventListener('change', handleAppState);
    return () => { 
      sub.remove(); 
      locationSub.current?.remove(); 
    };
  }, []);

  const init = async () => {
    try {
      const userData = await getCurrentUser();
      if (!userData) return;
      setUser(userData);
      await requestPermissions();
      await loadCars(userData.company_id);
      await loadMessages(userData.id);
      subscribeMessages(userData.id);
    } catch (err) {
      console.error('Driver init error:', err.message);
    }
  };

  const handleAppState = useCallback((nextState) => {
    if (appState.current.match(/inactive|background/) && nextState === 'active' && user) {
      loadCars(user.company_id);
    }
    appState.current = nextState;
  }, [user]);

  const requestPermissions = async () => {
    try {
      const { status: fg } = await Location.requestForegroundPermissionsAsync();
      if (fg !== 'granted') {
        Alert.alert('⚠️', i18n.t('locationRequired'));
        return;
      }
      await Location.requestBackgroundPermissionsAsync();
      setHasLocation(true);
    } catch (err) {
      console.error('Permission error:', err);
    }
  };

  const loadCars = async (companyId) => {
    const data = await getCars(companyId);
    setCars(data.filter(c => c.status === 'available'));
  };

  const loadMessages = async (userId) => {
    const data = await getMessages(userId);
    setMessages(data.filter(m => !m.acknowledged));
  };

  const subscribeMessages = (userId) => {
    subscribeToMessages(userId, (payload) => {
      Vibration.vibrate([0, 500, 200, 500]);
      setMessages(prev => [payload.new, ...prev]);
    });
  };

  const handleStartTrip = async (car) => {
    if (!hasLocation) {
      Alert.alert('⚠️', i18n.t('locationRequired'));
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High 
      });
      const locationName = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
      
      const trip = await startTrip({
        carId: car.id,
        driverId: user.id,
        startKm: car.current_km || 0,
        startLocation: locationName,
        startLat: loc.coords.latitude,
        startLng: loc.coords.longitude,
      });
      
      setActiveTrip(trip);
      setActiveCar(car);
      
      // Watch position and update car location
      locationSub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
        async (loc) => {
          const pos = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
          try {
            await updateCar(car.id, {
              last_lat: loc.coords.latitude,
              last_lng: loc.coords.longitude,
              last_location: pos,
            });
          } catch (e) {
            // Silent fail for location updates
          }
        }
      );
      
      Alert.alert('✅', i18n.t('tripStarted'));
    } catch (err) {
      Alert.alert(i18n.t('error'), err.message);
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip || !activeCar) return;
    try {
      const loc = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.High 
      });
      const locationName = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
      
      await endTrip(activeTrip.id, {
        endKm: activeCar.current_km || 0,
        endLocation: locationName,
        endLat: loc.coords.latitude,
        endLng: loc.coords.longitude,
        carId: activeCar.id,
      });
      
      locationSub.current?.remove();
      locationSub.current = null;
      setActiveTrip(null);
      setActiveCar(null);
      
      await loadCars(user.company_id);
      Alert.alert('✅', i18n.t('tripEnded'));
    } catch (err) {
      Alert.alert(i18n.t('error'), err.message);
    }
  };

  const handleAcknowledge = async (msgId) => {
    try {
      await acknowledgeMessage(msgId);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      Alert.alert(i18n.t('error'), err.message);
    }
  };

  const handleSpeakLocation = () => {
    Speech.speak(
      i18n.locale === 'ar' ? 'انطق اسم المكان الآن' : 'Say the location name now',
      { language: i18n.locale }
    );
  };

  const s = styles(COLORS);

  const renderMessage = ({ item }) => (
    <View style={s.messageCard}>
      <Text style={s.messageTitle}>📢 {i18n.t('voiceMessage')}</Text>
      <Text style={s.messageFrom}>
        {i18n.locale === 'ar' ? 'من' : 'From'}: {item.sender?.name || 'Dispatcher'}
      </Text>
      <TouchableOpacity 
        style={s.ackButton} 
        onPress={() => handleAcknowledge(item.id)} 
        activeOpacity={0.7}
      >
        <Text style={s.ackButtonText}>✔️ {i18n.t('acknowledged')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCar = ({ item }) => (
    <TouchableOpacity 
      style={s.carCard} 
      onPress={() => handleStartTrip(item)} 
      activeOpacity={0.7}
    >
      <View style={s.carStatusDot} />
      <View style={{ flex: 1 }}>
        <Text style={s.carPlate}>{item.plate}</Text>
        <Text style={s.carKm}>{item.current_km || 0} KM</Text>
      </View>
      <Text style={s.startArrow}>▶</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>🚗 {i18n.t('driver')}</Text>
        {user && <Text style={s.headerSub}>{user.name}</Text>}
      </View>
      
      {messages.length > 0 && (
        <View style={s.section}>
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
          />
        </View>
      )}
      
      {activeTrip ? (
        <View style={s.activeTripContainer}>
          <View style={s.activeTripHeader}>
            <View style={[s.statusDot, { backgroundColor: COLORS.danger }]} />
            <Text style={s.activeTripTitle}>{i18n.t('busy')}</Text>
          </View>
          <Text style={s.activeTripCar}>{activeCar?.plate}</Text>
          <TouchableOpacity 
            style={s.speakButton} 
            onPress={handleSpeakLocation} 
            activeOpacity={0.7}
          >
            <Text style={s.speakButtonText}>🎤 {i18n.t('speakLocation')}</Text>
          </TouchableOpacity>
          <View style={s.tripActions}>
            <TouchableOpacity 
              style={s.continueButton} 
              onPress={() => Alert.alert('✅', i18n.t('continueTrip'))} 
              activeOpacity={0.7}
            >
              <Text style={s.tripActionText}>✅ {i18n.t('continueTrip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={s.endButton} 
              onPress={handleEndTrip} 
              activeOpacity={0.7}
            >
              <Text style={s.tripActionText}>🔴 {i18n.t('endTrip')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={cars}
          keyExtractor={item => item.id}
          renderItem={renderCar}
          contentContainerStyle={s.listContent}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <Text style={s.emptyEmoji}>🟢</Text>
              <Text style={s.emptyText}>{i18n.t('noCarsAvailable')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  headerSub: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  section: { marginBottom: SPACING.md },
  messageCard: {
    backgroundColor: COLORS.primaryDark + '30',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    minWidth: 250,
  },
  messageTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  messageFrom: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, marginTop: 4 },
  ackButton: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  ackButtonText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  listContent: { padding: SPACING.lg },
  carCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  carStatusDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.available,
    marginRight: SPACING.md,
  },
  carPlate: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  carKm: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  startArrow: { color: COLORS.primary, fontSize: FONTS.sizes.xxl },
  activeTripContainer: { flex: 1, padding: SPACING.xxl, justifyContent: 'center', alignItems: 'center' },
  activeTripHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: SPACING.sm },
  activeTripTitle: { color: COLORS.danger, fontSize: FONTS.sizes.xl, fontWeight: FONTS.weights.bold },
  activeTripCar: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.xxl,
    fontWeight: FONTS.weights.bold,
    marginBottom: SPACING.xxl,
  },
  speakButton: {
    backgroundColor: COLORS.info,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.huge,
    marginBottom: SPACING.xxl,
    width: '100%',
    alignItems: 'center',
  },
  speakButtonText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  tripActions: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  continueButton: {
    flex: 1, backgroundColor: COLORS.success,
    borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  endButton: {
    flex: 1, backgroundColor: COLORS.danger,
    borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  tripActionText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  emptyContainer: { alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { color: COLORS.textMuted, fontSize: FONTS.sizes.md, textAlign: 'center' },
});
