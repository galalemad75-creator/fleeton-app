// FleetOn — Manage Team Screen (theme-aware)
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';
import { getCurrentUser, getTeamMembers, removeMember } from '../lib/database';

const ROLE_EMOJI = { driver: '🚗', dispatcher: '📡', maintenance: '🔧', owner: '👑', accountant: '📊' };

export default function ManageTeamScreen({ navigation }) {
  const { COLORS } = useTheme();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [company, setCompany] = useState(null);
  const s = styles(COLORS);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const userData = await getCurrentUser();
    setUser(userData); setCompany(userData.company);
    const teamData = await getTeamMembers(userData.company_id);
    setMembers(teamData);
  };

  const handleRemove = (member) => {
    if (member.id === user.id) { Alert.alert(i18n.t('error'), i18n.locale === 'ar' ? 'لا يمكنك حذف نفسك' : 'Cannot remove yourself'); return; }
    Alert.alert(i18n.t('removeMember'), `${member.name} (${i18n.t(member.role)})`, [
      { text: i18n.t('cancel'), style: 'cancel' },
      { text: i18n.t('delete'), style: 'destructive', onPress: async () => { await removeMember(member.id); await init(); } },
    ]);
  };

  const renderMember = ({ item }) => (
    <View style={s.memberCard}>
      <Text style={s.memberEmoji}>{ROLE_EMOJI[item.role] || '👤'}</Text>
      <View style={{ flex: 1 }}><Text style={s.memberName}>{item.name}</Text><Text style={s.memberRole}>{i18n.t(item.role)} • {item.email}</Text></View>
      {user?.role === 'owner' && item.id !== user.id && (<TouchableOpacity onPress={() => handleRemove(item)}><Text style={s.removeBtn}>🗑️</Text></TouchableOpacity>)}
    </View>
  );

  const grouped = members.reduce((acc, m) => { if (!acc[m.role]) acc[m.role] = []; acc[m.role].push(m); return acc; }, {});

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>← {i18n.t('back')}</Text></TouchableOpacity>
        <Text style={s.headerTitle}>{i18n.t('manageTeam')}</Text>
        <Text style={s.headerSub}>{members.length} {i18n.t('members')}</Text>
      </View>
      {company && (
        <View style={s.codesSection}>
          <Text style={s.codesTitle}>{i18n.t('groupCode')}</Text>
          <View style={s.codeRow}><Text style={s.codeLabel}>🚗 {i18n.t('driverCode')}</Text><Text style={s.codeValue}>{company.driver_code}</Text></View>
          <View style={s.codeRow}><Text style={s.codeLabel}>📡 {i18n.t('dispatcherCode')}</Text><Text style={s.codeValue}>{company.dispatcher_code}</Text></View>
        </View>
      )}
      {Object.entries(grouped).map(([role, roleMembers]) => (
        <View key={role}>
          <Text style={s.roleSection}>{ROLE_EMOJI[role]} {i18n.t(role)} ({roleMembers.length})</Text>
          {roleMembers.map(member => renderMember({ item: member }))}
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  backText: { color: COLORS.primary, fontSize: FONTS.sizes.md, marginBottom: SPACING.sm },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  headerSub: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
  codesSection: { backgroundColor: COLORS.primary + '15', marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.primary + '30' },
  codesTitle: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold, marginBottom: SPACING.md },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  codeLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  codeValue: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold, letterSpacing: 4 },
  roleSection: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold, paddingHorizontal: SPACING.xxl, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: 2, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  memberEmoji: { fontSize: 24, marginRight: SPACING.md },
  memberName: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.semibold },
  memberRole: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  removeBtn: { fontSize: 20, padding: SPACING.sm },
});
