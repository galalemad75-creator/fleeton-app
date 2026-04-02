// FleetOn — Add Part Screen (theme-aware)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { getCurrentUser, getCars, addMaintenancePart } from '../lib/database';

export default function AddPartScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [partName, setPartName] = useState('');
  const [alertKm, setAlertKm] = useState('');
  const [loading, setLoading] = useState(false);
  const s = styles(COLORS);

  useEffect(() => { loadCars(); }, []);

  const loadCars = async () => {
    const user = await getCurrentUser();
    const data = await getCars(user.company_id);
    setCars(data);
  };

  const handleAdd = async () => {
    if (!selectedCar || !partName.trim() || !alertKm.trim()) { Alert.alert(i18n.t('error'), i18n.locale === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields required'); return; }
    setLoading(true);
    try {
      const user = await getCurrentUser();
      await addMaintenancePart({ carId: selectedCar.id, partName: partName.trim(), alertKm: parseFloat(alertKm), companyId: user.company_id });
      Alert.alert(i18n.t('success'), i18n.locale === 'ar' ? 'تمت الإضافة' : 'Part added', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) { Alert.alert(i18n.t('error'), err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← {i18n.t('cancel')}</Text></TouchableOpacity>
          <Text style={s.title}>{i18n.t('addPart')}</Text>
        </View>
        <View style={s.form}>
          <Text style={s.label}>{i18n.locale === 'ar' ? 'اختر السيارة' : 'Select Car'}</Text>
          {cars.map(car => (
            <TouchableOpacity key={car.id} style={[s.carOption, selectedCar?.id === car.id && s.carSelected]} onPress={() => setSelectedCar(car)}>
              <Text style={s.carText}>🚗 {car.plate}</Text>
            </TouchableOpacity>
          ))}
          <Text style={s.label}>{i18n.t('partName')}</Text>
          <TextInput style={s.input} placeholder={i18n.locale === 'ar' ? 'مثال: فرامل، زيت' : 'e.g. Brakes, Oil'} placeholderTextColor={COLORS.textMuted} value={partName} onChangeText={setPartName} />
          <Text style={s.label}>{i18n.t('alertKm')}</Text>
          <TextInput style={s.input} placeholder="50000" placeholderTextColor={COLORS.textMuted} value={alertKm} onChangeText={setAlertKm} keyboardType="numeric" />
          <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleAdd} disabled={loading}>
            <Text style={s.btnText}>{loading ? i18n.t('loading') : i18n.t('addPart')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg },
  back: { color: COLORS.primary, fontSize: FONTS.sizes.md, marginBottom: SPACING.sm },
  title: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold, marginBottom: SPACING.xxl },
  form: { padding: SPACING.xxl },
  label: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: SPACING.sm, fontWeight: FONTS.weights.medium },
  carOption: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  carSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  carText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  input: { backgroundColor: COLORS.surface, color: COLORS.textPrimary, padding: SPACING.lg, borderRadius: RADIUS.lg, fontSize: FONTS.sizes.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  btn: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: SPACING.md },
  btnText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
});
