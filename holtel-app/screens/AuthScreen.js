import React, { useState, useContext } from 'react';
import { View, Text, Button, TouchableOpacity, Alert } from 'react-native';
import Input from '../components/Input';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../utils/theme';

const AuthScreen = () => {
  const { setAuth } = useContext(AuthContext);
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [room_id, setRoomId] = useState('');

  const handleSubmit = async () => {
    if (!username || !password || (mode === 'register' && (!confirm || !name || !room_id))) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (mode === 'register' && password !== confirm) {
      Alert.alert('รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      if (mode === 'login') {
        const res = await axios.post('http://localhost:5001/api/login', { username, password });
        // Persist token and user for session persistence
        try {
          await AsyncStorage.setItem('token', res.data.token);
          await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (e) {
          console.warn('Failed to persist auth to storage', e);
        }
        setAuth({
          user: res.data.user,
          token: res.data.token,
          role: res.data.user.role,
        });
      } else {
        await axios.post('http://localhost:5001/api/register', { username, password, name, room_id });
        Alert.alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setMode('login');
        setUsername('');
        setPassword('');
        setConfirm('');
        setName('');
        setRoomId('');
      }
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: theme.background }}>
      <Text style={{ fontSize: 32, marginBottom: 24, color: theme.primary }}>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Text>
  <Input placeholder="Username" value={username} onChangeText={setUsername} style={{ width: 300 }} />
  <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ width: 300 }} />
      {mode === 'register' && (
        <>
          <Input placeholder="ยืนยันรหัสผ่าน" value={confirm} onChangeText={setConfirm} secureTextEntry style={{ width: 250 }} />
          <Input placeholder="ชื่อ-นามสกุล" value={name} onChangeText={setName} style={{ width: 250 }} />
          <Input placeholder="หมายเลขห้อง" value={room_id} onChangeText={setRoomId} style={{ width: 250 }} />
        </>
      )}
      <TouchableOpacity onPress={handleSubmit} style={{ width: 300, backgroundColor: theme.primary, padding: 12, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>{mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={{ marginTop: 16, color: theme.primary }}>
          {mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;