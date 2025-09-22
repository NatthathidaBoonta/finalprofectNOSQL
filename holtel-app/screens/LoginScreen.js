// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const { setAuth } = React.useContext(require('./AuthContext').AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/api/login', { username, password });
      setAuth({ user: res.data.user, token: res.data.token, role: res.data.user.role });
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>เข้าสู่ระบบ</Text>

        <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, styles.inputFlex]}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.toggleBtn}>
            <Text style={styles.toggleText}>{showPassword ? 'ซ่อน' : 'แสดง'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cta} onPress={handleLogin}>
          <Text style={styles.ctaText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 10 }} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>สมัครสมาชิก</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE8EE',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#F7C9D9',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  title: {
    fontSize: 26,
    marginBottom: 16,
    color: '#E87CA6',
    fontWeight: '700',
    textAlign: 'center',
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
    width: '100%',
  },
  toggleBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    color: '#00B5C0',
    fontWeight: '600',
  },
  cta: {
    width: '100%',
    backgroundColor: '#00C9C9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  linkText: {
    color: '#00B5C0',
    marginTop: 12,
    fontWeight: '600',
  },
});

export default LoginScreen;
