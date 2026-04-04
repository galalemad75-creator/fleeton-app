// FleetOn — Settings Screen (updated with refund + contact links)
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert, I18nManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, FONTS, SPACING, RADIUS } from '../contexts/ThemeContext';
import { i18n, setLocale, isRTL } from '../lib/i18n';
import { signOut, getCurrentUser } from '../lib/database';

export default function SettingsScreen({ navigation }) {
  const { isDark, toggleTheme, COLORS } = useTheme();
  const [user, setUser] = useState(null);
  const [currentLang, setCurrentLang] = useState(i18n.locale);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (e) { /* no user */ }
  };

  const handleLanguageSwitch = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    Alert.alert(
      i18n.t('language'),
      newLang === 'ar' ? 'تبديل إلى العربية؟' : 'Switch to English?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('confirm'),
          onPress: () => {
            setLocale(newLang);
            setCurrentLang(newLang);
            I18nManager.forceRTL(newLang === 'ar');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      i18n.t('logout'),
      i18n.locale === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?',
      [
        { text: i18n.t('cancel'), style: 'cancel' },
        {
          text: i18n.t('logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const roleEmoji = {
    driver: '🚗',
    dispatcher: '📡',
    maintenance: '🔧',
    owner: '👑',
    accountant: '📊',
  };

  const settingsGroups = [
    {
      title: i18n.locale === 'ar' ? 'الحساب' : 'Account',
      items: [
        {
          icon: roleEmoji[user?.role] || '👤',
          label: user?.name || '—',
          sublabel: i18n.t(user?.role || 'driver'),
          type: 'info',
        },
        {
          icon: '📧',
          label: user?.email || '—',
          type: 'info',
        },
      ],
    },
    {
      title: i18n.locale === 'ar' ? 'التطبيق' : 'App',
      items: [
        {
          icon: isDark ? '🌙' : '☀️',
          label: i18n.t('theme'),
          sublabel: isDark
            ? (i18n.locale === 'ar' ? 'داكن' : 'Dark')
            : (i18n.locale === 'ar' ? 'فاتح' : 'Light'),
          type: 'switch',
          value: isDark,
          onValueChange: () => toggleTheme(),
        },
        {
          icon: '🌐',
          label: i18n.t('language'),
          sublabel: currentLang === 'ar' ? 'العربية' : 'English',
          type: 'button',
          onPress: handleLanguageSwitch,
        },
        {
          icon: '🔔',
          label: i18n.t('notifications'),
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
      ],
    },
    {
      title: i18n.locale === 'ar' ? 'قانوني' : 'Legal',
      items: [
        {
          icon: '🔒',
          label: i18n.t('privacyPolicy'),
          type: 'button',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
        {
          icon: '📄',
          label: i18n.t('terms'),
          type: 'button',
          onPress: () => navigation.navigate('TermsOfService'),
        },
        {
          icon: '💰',
          label: i18n.t('refundPolicy'),
          type: 'button',
          onPress: () => navigation.navigate('RefundPolicy'),
        },
      ],
    },
    {
      title: i18n.locale === 'ar' ? 'حول' : 'Info',
      items: [
        {
          icon: 'ℹ️',
          label: i18n.t('aboutUs'),
          type: 'button',
          onPress: () => navigation.navigate('AboutUs'),
        },
        {
          icon: '💬',
          label: i18n.t('contact'),
          type: 'button',
          onPress: () => navigation.navigate('ContactUs'),
        },
      ],
    },
  ];

  const s = styles(COLORS);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView>
        <View style={s.header}>
          <Text style={s.headerTitle}>⚙️ {i18n.t('settings')}</Text>
        </View>

        {settingsGroups.map((group, gi) => (
          <View key={gi} style={s.group}>
            <Text style={s.groupTitle}>{group.title}</Text>
            {group.items.map((item, ii) => (
              <View key={ii} style={[s.settingRow, ii === group.items.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={s.settingIcon}>{item.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.settingLabel}>{item.label}</Text>
                  {item.sublabel && (
                    <Text style={s.settingSub}>{item.sublabel}</Text>
                  )}
                </View>
                {item.type === 'switch' && (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                    thumbColor={COLORS.textPrimary}
                  />
                )}
                {item.type === 'button' && (
                  <TouchableOpacity onPress={item.onPress}>
                    <Text style={s.settingArrow}>›</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>🚪 {i18n.t('logout')}</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={s.version}>FleetOn v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (COLORS) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  headerTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xxl, fontWeight: FONTS.weights.bold },
  group: { marginBottom: SPACING.xl },
  groupTitle: {
    color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold,
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: SPACING.xxl, marginBottom: SPACING.sm,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg, marginHorizontal: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  settingIcon: { fontSize: 20, marginRight: SPACING.md },
  settingLabel: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  settingSub: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  settingArrow: { color: COLORS.textMuted, fontSize: 24 },
  logoutBtn: {
    backgroundColor: COLORS.danger + '20', marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
    marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.danger + '40',
  },
  logoutText: { color: COLORS.danger, fontSize: FONTS.sizes.md, fontWeight: FONTS.weights.bold },
  version: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textAlign: 'center', marginTop: SPACING.xl },
});
