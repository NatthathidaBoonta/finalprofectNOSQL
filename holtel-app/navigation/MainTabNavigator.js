import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../screens/user/Dashboard';
import ProfileScreen from '../screens/user/ProfileScreen';
import ReportsScreen from '../screens/user/ReportScreen';
import MyReportsScreen from '../screens/user/MyReportsScreen';
import theme from '../utils/theme';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: theme.background, shadowColor: 'transparent' },
      headerTitleStyle: { color: theme.primary, fontWeight: '700' },
      tabBarShowLabel: true,
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 14,
        elevation: 6,
        borderRadius: 14,
        height: 64,
        backgroundColor: theme.card,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      tabBarIcon: ({ color }) => {
        let icon = '•';
        if (route.name === 'Dashboard') icon = '🏠';
        else if (route.name === 'Reports') icon = '📝';
        else if (route.name === 'MyReports') icon = '📂';
        else if (route.name === 'Profile') icon = '👤';
        return (
          <View style={{ width: 36, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color }}>{icon}</Text>
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'หน้าหลัก' }} />
    <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'แจ้งซ่อม' }} />
    <Tab.Screen name="MyReports" component={MyReportsScreen} options={{ title: 'รายการแจ้งซ่อม' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'โปรไฟล์' }} />
  </Tab.Navigator>
);

export default MainTabNavigator;