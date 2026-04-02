// FleetOn — Add Car Screen (theme-aware)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { getCurrentUser, addCar } from '../lib/database';

export default function AddCarScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [plate, setPlate] = useState('');
  const [km, setKm] = useState('');
  const [loading, setLoading] = useState(false);
  const s = styles(COLORS);

  const handleAdd = async () => {
    if (!plate.trim()) { Alert.alert(i18n.t('error'), i18n.t('plateNumber') + ' required'); return; }
    setLoading(true);
    try {
      const user = await getCurrentUser();
      await addCar({ plate: plate.trim().toUpperCase(), companyId: user.company_id });
      Alert.alert(i18n.t('success'), i18n.locale === 'ar' ? 'تمت إضافة السيارة' : 'Car added', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) { Alert.alert(i18n.t('error'), err.message); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← {i18n.t('cancel')}</Text></TouchableOpacity>
        <Text style={s.title}>{i18n.t('addCar')}</Text>
      </View>
      <View style={s.form}>
        <Text style={s.label}>{i18n.t('plateNumber')}</Text>
        <TextInput style={s.input} placeholder="ABC-1234" placeholderTextColor={COLORS.textMuted} value={plate} onChangeText={setPlate} autoCapitalize="characters" />
        <Text style={s.label}>{i18n.t('currentKm')}</Text>
        <TextInput style={s.input} placeholder="0" placeholderTextColor={COLORS.textMuted} value={km} onChangeText={setKm} keyboardType="numeric" />
        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleAdd} disabled={loading}>
          <Text style={s.btnText}>{loading ? i18n.t('loading') : i18n.t('addCar')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg },
  back: { color: COLORS.primary, fontSize: FONTS.sizes.md, marginBottom: SPACING.sm },
  title: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold, marginBottom: SPACING.xxl },
  form: { padding: SPACING.xxl },
  label: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, color: COLORS.textPrimary, padding: SPACING.lg, borderRadius: RADIUS.lg, fontSize: FONTS.sizes.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  btn: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center', marginTop: SPACING.md },
  btnText: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
});
