// FleetOn — Navigation Configuration (updated with legal pages)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { useTheme, FONTS } from '../contexts/ThemeContext';
import { i18n } from '../lib/i18n';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Role screens
import DriverHomeScreen from '../screens/DriverHomeScreen';
import DispatcherHomeScreen from '../screens/DispatcherHomeScreen';
import MaintenanceHomeScreen from '../screens/MaintenanceHomeScreen';
import OwnerHomeScreen from '../screens/OwnerHomeScreen';
import AccountantHomeScreen from '../screens/AccountantHomeScreen';

// Shared screens
import SettingsScreen from '../screens/SettingsScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import ManageTeamScreen from '../screens/ManageTeamScreen';
import AddCarScreen from '../screens/AddCarScreen';
import AddPartScreen from '../screens/AddPartScreen';

// Legal pages
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import AboutUsScreen from '../screens/AboutUsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.6 }}>
        {emoji}
      </Text>
    </View>
  );
}

// ==================== AUTH STACK ====================

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ==================== DRIVER TABS ====================

function DriverTabs() {
  const { COLORS } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen name="DriverHome" component={DriverHomeScreen}
        options={{ tabBarLabel: i18n.t('driver'), tabBarIcon: ({ focused }) => <TabIcon emoji="🚗" focused={focused} /> }}
      />
      <Tab.Screen name="DriverSettings" component={SettingsScreen}
        options={{ tabBarLabel: i18n.t('settings'), tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ==================== DISPATCHER TABS ====================

function DispatcherTabs() {
  const { COLORS } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen name="DispatcherHome" component={DispatcherHomeScreen}
        options={{ tabBarLabel: i18n.t('fleet'), tabBarIcon: ({ focused }) => <TabIcon emoji="📡" focused={focused} /> }}
      />
      <Tab.Screen name="DispatcherSettings" component={SettingsScreen}
        options={{ tabBarLabel: i18n.t('settings'), tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ==================== MAINTENANCE TABS ====================

function MaintenanceTabs() {
  const { COLORS } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen name="MaintenanceHome" component={MaintenanceHomeScreen}
        options={{ tabBarLabel: i18n.t('maintenance'), tabBarIcon: ({ focused }) => <TabIcon emoji="🔧" focused={focused} /> }}
      />
      <Tab.Screen name="MaintenanceSettings" component={SettingsScreen}
        options={{ tabBarLabel: i18n.t('settings'), tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ==================== OWNER TABS ====================

function OwnerTabs() {
  const { COLORS } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen name="OwnerHome" component={OwnerHomeScreen}
        options={{ tabBarLabel: i18n.t('dashboard'), tabBarIcon: ({ focused }) => <TabIcon emoji="👑" focused={focused} /> }}
      />
      <Tab.Screen name="OwnerSettings" component={SettingsScreen}
        options={{ tabBarLabel: i18n.t('settings'), tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ==================== ACCOUNTANT TABS ====================

function AccountantTabs() {
  const { COLORS } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen name="AccountantHome" component={AccountantHomeScreen}
        options={{ tabBarLabel: i18n.t('expenses'), tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
      />
      <Tab.Screen name="AccountantSettings" component={SettingsScreen}
        options={{ tabBarLabel: i18n.t('settings'), tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ==================== MAIN NAVIGATOR ====================

export default function Navigation({ user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            {user.role === 'driver' && <Stack.Screen name="DriverFlow" component={DriverTabs} />}
            {user.role === 'dispatcher' && <Stack.Screen name="DispatcherFlow" component={DispatcherTabs} />}
            {user.role === 'maintenance' && <Stack.Screen name="MaintenanceFlow" component={MaintenanceTabs} />}
            {user.role === 'owner' && <Stack.Screen name="OwnerFlow" component={OwnerTabs} />}
            {user.role === 'accountant' && <Stack.Screen name="AccountantFlow" component={AccountantTabs} />}

            {/* Shared modal screens */}
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
            <Stack.Screen name="ManageTeam" component={ManageTeamScreen} />
            <Stack.Screen name="AddCar" component={AddCarScreen} />
            <Stack.Screen name="AddPart" component={AddPartScreen} />

            {/* Legal & Info pages */}
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
