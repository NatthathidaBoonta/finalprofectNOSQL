import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminTabNavigator from './AdminTabNavigator';
import AdminReportList from '../screens/Admin/admin_reportList';
import AdminReportDetail from '../screens/Admin/AdminReportDetail';

const Stack = createNativeStackNavigator();

const AdminStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
    <Stack.Screen name="AdminReports" component={AdminReportList} />
    <Stack.Screen name="AdminReportDetail" component={AdminReportDetail} />
  </Stack.Navigator>
);

export default AdminStackNavigator;
