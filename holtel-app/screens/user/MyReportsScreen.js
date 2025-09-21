import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { resetToAuth } from '../../navigation/RootNavigation';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';

const STATUS_LABEL = {
  new: 'รอรับเรื่อง',
  'in-progress': 'กำลังดำเนินการ',
  done: 'เสร็จสิ้น',
};
const STATUS_COLOR = {
  new: '#F6C36B',
  'in-progress': theme.primary,
  done: '#7FC6A5',
};

const MyReportsScreen = () => {
  const { auth } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastStatus, setLastStatus] = useState({});

  useEffect(() => {
    if (!auth?.user || !auth?.token) {
      setLoading(false);
      return;
    }
    const fetchReports = async () => {
      setLoading(true);
      try {
        // เพิ่ม room_number ใน query string ถ้ามี
        const roomNumber = auth.user.room_number;
        let url = 'http://localhost:5001/api/reports';
        if (roomNumber) {
          url += `?room_number=${roomNumber}`;
        }
        console.log('[MyReports] Fetching reports from:', url);
        console.log('[MyReports] Using token:', auth.token);
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        console.log('[MyReports] Response status:', res.status);
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
        const data = await res.json();
        console.log('[MyReports] Fetched data:', data);
        setReports(data);
        // ตรวจสอบการเปลี่ยนแปลงสถานะ
        data.forEach(r => {
          if (lastStatus[r._id] && lastStatus[r._id] !== r.status) {
            if (r.status === 'in-progress') {
              Alert.alert('แจ้งเตือน', `รีพอร์ต "${r.facility}" กำลังดำเนินการ`);
            } else if (r.status === 'done') {
              Alert.alert('แจ้งเตือน', `รีพอร์ต "${r.facility}" ดำเนินการเสร็จสิ้นแล้ว`);
            }
          }
        });
        // อัปเดต lastStatus
        const statusMap = {};
        data.forEach(r => { statusMap[r._id] = r.status; });
        setLastStatus(statusMap);
      } catch (err) {
        console.warn('[MyReports] fetchReports error:', err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
    // Poll ทุก 10 วินาที
    const interval = setInterval(fetchReports, 100000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [auth?.user, auth?.token]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!auth?.user || !auth?.token) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={styles.header}>รายการแจ้งซ่อมของฉัน</Text>
        <Text style={styles.emptyText}>ยังไม่มีข้อมูล — กรุณาเข้าสู่ระบบเพื่อดูรายการของคุณ</Text>
        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: theme.primary }]} onPress={() => resetToAuth()}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>ไปยังหน้าล็อกอิน</Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 12, color: 'gray' }}>Debug token: {String(auth?.token)}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.header}>รายการแจ้งซ่อมของฉัน</Text>
      <FlatList
        data={reports}
        keyExtractor={item => item._id || item.id}
        renderItem={({ item }) => (
          <View style={[styles.reportCard, { backgroundColor: theme.card }] }>
            <Text style={styles.label}><Text style={{fontWeight:'bold'}}>อุปกรณ์:</Text> {item.facility}</Text>
            <Text style={styles.label}><Text style={{fontWeight:'bold'}}>รายละเอียด:</Text> {item.description}</Text>
            <Text style={styles.label}><Text style={{fontWeight:'bold'}}>วันที่แจ้ง:</Text> {new Date(item.created_at).toLocaleString('th-TH')}</Text>
            <Text style={[styles.statusTag, { backgroundColor: STATUS_COLOR[item.status] || '#ccc' }]}>สถานะ: {STATUS_LABEL[item.status]}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>ยังไม่มีรายการแจ้งซ่อม</Text>}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  reportCard: {
    borderRadius: 10,
    marginBottom: 12,
    padding: 14,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  },
  label: {
    fontSize: 15,
    marginBottom: 2,
  },
  statusTag: {
    color: '#fff',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  emptyText: {
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default MyReportsScreen;