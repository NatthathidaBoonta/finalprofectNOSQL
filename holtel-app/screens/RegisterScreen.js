// RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Input from '../components/Input';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [room_number, setRoomNumber] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'รหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      await axios.post('http://localhost:5001/api/register', {
        username,
        password,
        name,
        role: 'user',
        room_id: room_number
      });
      Alert.alert('Register Success', 'สมัครสมาชิกสำเร็จ!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Register Failed', err.response?.data?.message || 'Error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formBox}>
        <Text style={styles.title}>สมัครสมาชิก</Text>

        <Input placeholder="Username" value={username} onChangeText={setUsername} />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input placeholder="ยืนยันรหัสผ่าน" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <Input placeholder="ชื่อ-นามสกุล" value={name} onChangeText={setName} />
        <Input placeholder="หมายเลขห้อง" value={room_number} onChangeText={setRoomNumber} />

        <View style={styles.buttonWrap}>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.loginText}>เข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAE3D9',
    padding: 20,
  },
  formBox: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  buttonWrap: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#00B5C0',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#00C9C9',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 15,
    color: '#00B5C0',
  }
});

export default RegisterScreen;

