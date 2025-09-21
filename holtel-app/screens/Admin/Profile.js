import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../AuthContext';
import { resetToAuth } from '../../navigation/RootNavigation';
import theme from '../../utils/theme';

const AdminProfile = () => {
  const { auth, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    try { resetToAuth(); } catch (e) { console.warn('reset failed', e); }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.header}>Admin Profile</Text>
      <View style={[styles.card, { backgroundColor: theme.card }] }>
        <Text style={styles.label}>ชื่อ: <Text style={styles.value}>{auth.user?.name}</Text></Text>
        <Text style={styles.label}>Username: <Text style={styles.value}>{auth.user?.username}</Text></Text>
        <Text style={styles.label}>Role: <Text style={styles.value}>{auth.user?.role}</Text></Text>
      </View>
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.danger }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 60 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: theme.primary },
  card: { padding: 20, borderRadius: 12, width: 320, marginBottom: 20, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  label: { fontSize: 16, marginBottom: 8, color: theme.text },
  value: { fontWeight: 'bold' },
  logoutBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold' }
});

export default AdminProfile;
