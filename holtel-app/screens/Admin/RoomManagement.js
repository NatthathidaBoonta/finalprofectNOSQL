import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, ScrollView, StyleSheet, Switch, ActivityIndicator, Alert } from 'react-native';
import Input from '../../components/Input';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';

// fixed pricing per floor
const FLOOR_PRICING = {
  1: 2000,
  2: 2500,
  3: 3000
};

const RoomManagement = () => {
  const { auth } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState('1');
  const [occupied, setOccupied] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/rooms', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setRooms(res.data);
    } catch (err) {
      setRooms([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [auth.token]);

  const openModal = (room = null) => {
    setEditRoom(room);
    setRoomNumber(room ? String(room.room_number) : '');
    setFloor(room ? String(room.floor || '1') : '1');
    setOccupied(room ? !!room.occupied : false);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!roomNumber) return Alert.alert('Validation', 'กรุณากรอกเลขห้อง');
    const payload = {
      room_number: roomNumber,
      floor: Number(floor),
      occupied: !!occupied
    };
      try {
        if (editRoom) {
          await axios.put(`http://localhost:5001/api/rooms/${editRoom._id || editRoom.id}`, payload, {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
        } else {
          await axios.post('http://localhost:5001/api/rooms', payload, {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
        }
      setModalVisible(false);
      fetchRooms();
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const toggleOccupancy = async (room) => {
    try {
      const res = await axios.patch(`http://localhost:5001/api/rooms/${room._id || room.id}`, { occupied: !room.occupied }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      // update local list
      setRooms(curr => curr.map(r => (r._id === room._id ? res.data : r)));
    } catch (err) {
      Alert.alert('Error', 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.room}>ห้อง {item.room_number}</Text>
        <Text style={styles.price}>{FLOOR_PRICING[item.floor] ? `${FLOOR_PRICING[item.floor]} บาท` : '-'}</Text>
      </View>
      <View style={styles.rowSpace}>
        <Text>ชั้น: {item.floor || '-'}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{marginRight: 8}}>{item.occupied ? 'มีคนเช่า' : 'ว่าง'}</Text>
          <Switch value={!!item.occupied} onValueChange={() => toggleOccupancy(item)} />
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="แก้ไข" onPress={() => openModal(item)} />
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{marginTop: 40}} color={theme.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      <Text style={styles.header}>จัดการห้อง</Text>
      <TouchableOpacity style={styles.addBtn} onPress={() => openModal(null)}>
        <Text style={styles.addBtnText}>+ เพิ่มห้องใหม่</Text>
      </TouchableOpacity>
      <FlatList
        data={rooms}
        keyExtractor={item => item._id || item.id || String(item.room_number)}
        renderItem={renderItem}
        style={{marginTop: 12}}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>ยังไม่มีข้อมูลห้อง</Text>}
      />

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalHeader}>{editRoom ? 'แก้ไขห้อง' : 'เพิ่มห้อง'}</Text>
          <Text>เลขห้อง</Text>
          <Input value={roomNumber} onChangeText={setRoomNumber} style={{ width: '100%' }} />
          <Text>ชั้น (1/2/3)</Text>
          <Input value={floor} onChangeText={setFloor} style={{ width: '100%' }} keyboardType="numeric" />
          <Text>ราคาตามชั้น: {FLOOR_PRICING[Number(floor)] ? `${FLOOR_PRICING[Number(floor)]} บาท` : '-'}</Text>
          <View style={{flexDirection:'row', alignItems:'center', marginVertical: 8}}>
            <Text style={{marginRight: 8}}>สถานะเช่า:</Text>
            <Switch value={occupied} onValueChange={setOccupied} />
            <Text style={{marginLeft: 8}}>{occupied ? 'มีคนเช่า' : 'ว่าง'}</Text>
          </View>
          <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
            <Button title="บันทึก" onPress={handleSave} />
            <Button title="ยกเลิก" onPress={() => setModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '800', color: theme.primary, marginBottom: 12 },
  card: { backgroundColor: theme.card, padding: 12, borderRadius: 12, marginBottom: 10, boxShadow: '0 2px 6px rgba(43,198,207,0.12)', elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowSpace: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  room: { fontSize: 16, fontWeight: '800', color: theme.primary },
  price: { fontSize: 14, fontWeight: '600', color: theme.muted },
  actions: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' },
  modalContent: { padding: 16, alignItems: 'stretch' },
  modalHeader: { fontSize: 20, fontWeight: '800', color: theme.primary, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  addBtn: { backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignSelf: 'flex-start' },
  addBtnText: { color: '#fff', fontWeight: '700' }
});

export default RoomManagement;