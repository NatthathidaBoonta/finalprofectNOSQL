import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminDashboard from '../screens/Admin/Dashboard';
import AdminReportList from '../screens/Admin/admin_reportList';
import RoomManagement from '../screens/Admin/RoomManagement';
import AdminStatistic from '../screens/Admin/admin_statistic';
import AdminProfile from '../screens/Admin/Profile';
import theme from '../utils/theme';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: theme.background, shadowColor: 'transparent' },
      headerTitleStyle: { color: theme.primary, fontWeight: 'bold' },
      tabBarShowLabel: true,
      tabBarActiveTintColor: theme.primary,
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 16,
        elevation: 6,
        borderRadius: 16,
        height: 64,
        backgroundColor: theme.card,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      tabBarIcon: ({ focused, color }) => {
        // Use elegant emoji icons to avoid adding an icon library.
        let icon = '•';
        if (route.name === 'AdminDashboard') icon = '📊';
        else if (route.name === 'RoomManagement') icon = '🏨';
        else if (route.name === 'Statistics') icon = '📈';
        else if (route.name === 'Profile') icon = '👤';
        return (
          <View style={{ width: 36, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color }}>{icon}</Text>
          </View>
        );
      },
    })}
  >
    <Tab.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'แดชบอร์ด' }} />
    <Tab.Screen name="RoomManagement" component={RoomManagement} options={{ title: 'จัดการห้อง' }} />
    <Tab.Screen name="Statistics" component={AdminStatistic} options={{ title: 'สถิติ' }} />
    <Tab.Screen name="Profile" component={AdminProfile} options={{ title: 'โปรไฟล์' }} />
  </Tab.Navigator>
);

export default AdminTabNavigator;
