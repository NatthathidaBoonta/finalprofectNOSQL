import React, { useEffect, useState, useContext, useMemo } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Modal, ScrollView, StyleSheet, Switch, ActivityIndicator, Alert, TextInput } from 'react-native';
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

  // search states
  const [searchText, setSearchText] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // delete modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [forceDelete, setForceDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setRooms(curr => curr.map(r => ((r._id || r.id) === (room._id || room.id) ? res.data : r)));
    } catch (err) {
      Alert.alert('Error', 'ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  // replace confirmDelete -> open modal to ask reason / force
  const confirmDelete = (room) => {
    setRoomToDelete(room);
    setDeleteReason('');
    setForceDelete(false);
    setDeleteModalVisible(true);
  };

  const performDelete = async ({ room, force = false, reason = '' }) => {
    if (force && (!reason || !reason.trim())) {
      Alert.alert('ต้องระบุเหตุผล', 'กรุณาใส่เหตุผลสำหรับการลบแบบบังคับ');
      return;
    }

    try {
      setDeleting(true);
      // axios.delete with body: use { data: {...} } second param
      await axios.delete(`http://localhost:5001/api/rooms/${room._id || room.id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
        data: { force, reason }
      });
      // remove from local state immediately
      setRooms(curr => curr.filter(r => (r._id || r.id) !== (room._id || room.id)));
      setDeleteModalVisible(false);
      Alert.alert('สำเร็จ', 'ลบห้องเรียบร้อยแล้ว');
    } catch (err) {
      Alert.alert('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถลบห้องได้');
    } finally {
      setDeleting(false);
    }
  };

  // derived filtered list based on search and availability
  const filteredRooms = useMemo(() => {
    const q = (searchText || '').trim().toLowerCase();
    return rooms.filter(r => {
      if (onlyAvailable && r.occupied) return false;
      if (!q) return true;
      // match room_number, floor or id
      if (String(r.room_number).toLowerCase().includes(q)) return true;
      if (r.floor && String(r.floor).toLowerCase().includes(q)) return true;
      if (r._id && r._id.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [rooms, searchText, onlyAvailable]);

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
        <View style={{ width: 12 }} />
        <Button title="ลบ" color="#d9534f" onPress={() => confirmDelete(item)} />
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{marginTop: 40}} color={theme.primary} />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      <Text style={styles.header}>จัดการห้อง</Text>

      {/* Search + filter */}
      <View style={styles.searchWrap}>
        <Input
          placeholder="ค้นหาเลขห้อง หรือชั้น..."
          value={searchText}
          onChangeText={setSearchText}
          style={{ marginBottom: 8 }}
        />
        <View style={styles.searchRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch value={onlyAvailable} onValueChange={setOnlyAvailable} />
            <Text style={{ marginLeft: 8 }}>แสดงเฉพาะห้องว่าง</Text>
          </View>
          <TouchableOpacity onPress={() => { setSearchText(''); setOnlyAvailable(false); }}>
            <Text style={{ color: theme.primary, fontWeight: '700' }}>ล้าง</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.countText}>แสดง {filteredRooms.length} จาก {rooms.length} ห้อง</Text>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => openModal(null)}>
        <Text style={styles.addBtnText}>+ เพิ่มห้องใหม่</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredRooms}
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

      {/* Delete confirmation modal */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent>
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.modalHeader}>ยืนยันการลบห้อง</Text>
            <Text style={{marginBottom:8}}>ห้อง: {roomToDelete?.room_number}</Text>

            <View style={{flexDirection:'row', alignItems:'center', marginBottom:8}}>
              <Switch value={forceDelete} onValueChange={setForceDelete} />
              <Text style={{marginLeft:8}}>Force delete (ลบแม้มีผู้เช่า/ผู้ที่อ้างถึง)</Text>
            </View>

            {forceDelete && (
              <>
                <Text style={{marginBottom:6}}>ระบุเหตุผลสำหรับการลบ (จำเป็นเมื่อใช้ Force)</Text>
                <TextInput
                  value={deleteReason}
                  onChangeText={setDeleteReason}
                  style={styles.reasonInput}
                  placeholder="เหตุผล..."
                  multiline
                />
              </>
            )}

            <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
              <Button title="ยกเลิก" onPress={() => setDeleteModalVisible(false)} />
              <Button
                title={deleting ? "กำลังลบ..." : "ลบ"}
                color="#d9534f"
                onPress={() => performDelete({ room: roomToDelete, force: forceDelete, reason: deleteReason })}
                disabled={deleting}
              />
            </View>
          </View>
        </View>
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
  addBtn: { backgroundColor: theme.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, alignSelf: 'flex-start', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700' },

  /* search styles */
  searchWrap: { width: '100%', maxWidth: 420, marginBottom: 8 },
  searchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  countText: { marginTop: 6, color: theme.muted },

  /* delete modal styles */
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteModalContent: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 6,
  },
  reasonInput: {
    minHeight: 80,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    textAlignVertical: 'top'
  },
});

export default RoomManagement;