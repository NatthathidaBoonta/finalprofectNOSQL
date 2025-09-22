// RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [room_number, setRoomNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!username || !password || !name) {
      Alert.alert('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
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
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>สมัครสมาชิก</Text>

          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" />
          <TextInput placeholder="ชื่อ-นามสกุล" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="หมายเลขห้อง" value={room_number} onChangeText={setRoomNumber} style={styles.input} keyboardType="numeric" />

          <View style={styles.inputRow}>
            <TextInput
              placeholder="รหัสผ่าน"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, styles.inputFlex]}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.toggleBtn}>
              <Text style={styles.toggleText}>{showPassword ? 'ซ่อน' : 'แสดง'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              style={[styles.input, styles.inputFlex]}
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.toggleBtn}>
              <Text style={styles.toggleText}>{showConfirm ? 'ซ่อน' : 'แสดง'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cta} onPress={handleRegister}>
            <Text style={styles.ctaText}>สมัครสมาชิก</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.secondaryText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
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
    width: '100%',            // ทำให้เต็มความกว้างของคอนเทนเนอร์ (ใช้ร่วมกับ inputFlex ใน row)
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputFlex: {
    flex: 1,
    width: '100%',            // ช่วยให้ TextInput ยืดเต็มพื้นที่ที่เหลือใน row
  },
  toggleBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,       // ให้ปุ่มมีความสูงใกล้เคียงกับ input
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
  secondary: {
    width: '100%',
    backgroundColor: '#00B5C0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default RegisterScreen;

