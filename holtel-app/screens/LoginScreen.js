// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, Button, Alert, TouchableOpacity } from 'react-native';
import Input from '../components/Input';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setAuth } = React.useContext(require('./AuthContext').AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5001/api/login', { username, password });
      // อัปเดต AuthContext
      setAuth({ user: res.data.user, token: res.data.token, role: res.data.user.role });
      // นำผู้ใช้ไปหน้า Dashboard
      navigation.replace('Dashboard');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      <Input placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 20 }}>
        <Text style={{ color: 'blue' }}>สมัครสมาชิก (Register)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
