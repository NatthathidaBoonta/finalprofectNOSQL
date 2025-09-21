import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { resetToAuth } from '../../navigation/RootNavigation';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const { auth, logout, setAuth } = useContext(AuthContext);
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(auth.user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleConfirmLogout = async () => {
    setModalVisible(false);
    await logout();
    try {
      resetToAuth();
    } catch (e) {
      console.warn('Failed to reset to Auth via root nav', e);
    }
  };

  const handleLogout = () => {
    setModalVisible(true);
  };

  const handleStartEdit = () => {
    setPhone(auth.user?.phone || '');
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setPhone(auth.user?.phone || '');
  };

  const handleSavePhone = async () => {
    if (!phone.trim()) {
      Alert.alert('ไม่สำเร็จ', 'กรุณากรอกเบอร์โทร');
      return;
    }
    try {
      setSaving(true);
      const res = await axios.patch('http://localhost:5001/api/user/phone', { phone }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      const updatedUser = {
        ...auth.user,
        phone: res.data.user.phone || ''
      };
      // update context and storage
      setAuth({ ...auth, user: updatedUser });
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
      Alert.alert('สำเร็จ', 'บันทึกเบอร์โทรแล้ว');
    } catch (e) {
      Alert.alert('ผิดพลาด', e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.header}>โปรไฟล์</Text>
      <Card style={styles.card}>
        <Text style={styles.label}>ชื่อ: <Text style={styles.value}>{auth.user?.name || '-'}</Text></Text>
        <Text style={styles.label}>Username: <Text style={styles.value}>{auth.user?.username || '-'}</Text></Text>
            {!editing ? (
              <View style={styles.phoneRow}>
                <Text style={styles.label}>
                  เบอร์โทร: <Text style={styles.value}>{auth.user?.phone || '-'}</Text>
                </Text>
                <TouchableOpacity
                  style={styles.smallEditBtn}
                  onPress={handleStartEdit}
                  activeOpacity={0.8}
                  hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
                  accessibilityLabel="แก้ไขเบอร์โทร"
                >
                  <Text style={styles.smallEditIcon}>✎</Text>
                </TouchableOpacity>
              </View>
            ) : (
          <View style={styles.editRow}>
            <Input
              placeholder="กรอกเบอร์โทร"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={20}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.cancel]} onPress={handleCancelEdit} disabled={saving}>
                <Text style={styles.actionText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.save]} onPress={handleSavePhone} disabled={saving}>
                <Text style={styles.actionText}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <Text style={styles.label}>เลขห้อง: <Text style={styles.value}>{auth.user?.room_number || '-'}</Text></Text>
        {/* Role intentionally hidden per request */}
      </Card>
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.danger }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ออกจากระบบ</Text>
            <Text style={styles.modalMessage}>คุณต้องการออกจากระบบใช่หรือไม่?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>ยกเลิก</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={handleConfirmLogout}>
                <Text style={styles.confirmText}>ตกลง</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  card: {
    width: 320,
    alignSelf: 'center',
    padding: 20,
    marginBottom: 18,
  },
  editBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(33,169,177,0.10)', // light accent tint
    borderColor: theme.accent,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'center',
    boxShadow: '0 2px 6px rgba(43,198,207,0.12)',
  },
  editIcon: {
    marginRight: 8,
    fontSize: 14,
    color: theme.accent,
  },
  editText: {
    color: theme.accent,
    fontWeight: '800',
  },
  editRow: {
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.border,
  },
  save: {
    backgroundColor: theme.primary,
    boxShadow: '0 2px 6px rgba(43,198,207,0.12)',
  },
  actionText: {
    color: '#fff',
    fontWeight: '800',
  },
  label: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '700',
  },
  value: {
    fontWeight: '600',
    color: theme.primary,
  },
  logoutBtn: {
    backgroundColor: theme.danger,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: 'center',
    // red frame
    borderWidth: 2,
    borderColor: '#B71C1C',
    boxShadow: '0 2px 6px rgba(210,59,59,0.12)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: theme.danger,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
      phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      smallEditBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(33,169,177,0.10)',
        borderWidth: 1,
        borderColor: theme.accent,
      },
      smallEditIcon: {
        color: theme.accent,
        fontWeight: '800',
        fontSize: 14,
      },
});

export default ProfileScreen;