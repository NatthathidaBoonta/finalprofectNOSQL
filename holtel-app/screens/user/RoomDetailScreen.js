import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_LABEL = {
  new: 'รอรับเรื่อง',
  'in-progress': 'กำลังดำเนินการ',
  done: 'สำเร็จแล้ว',
};

const RoomDetailScreen = () => {
  const route = useRoute();
  const { auth } = useContext(AuthContext);
  // รับ room_number จาก navigation param หรือจาก user
  const roomNumber = route.params?.room_number || route.params?.room?.room_number || auth?.user?.room_number;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomNumber) {
      setError('ไม่พบเลขห้อง');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:5001/api/reports?room_number=${roomNumber}`, {
      headers: { Authorization: `Bearer ${auth?.token || ''}` },
    })
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => {
        setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
        setLoading(false);
      });
  }, [roomNumber, auth]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.primary }]}>รายการแจ้งซ่อมห้อง {roomNumber}</Text>
      {loading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 30 }} />}
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <View>
          <Text style={styles.statText}>
            <Text style={{ fontWeight: 'bold' }}>จำนวนครั้งที่แจ้งซ่อม: </Text>
            {reports.length}
          </Text>
          <Text style={styles.sectionTitle}>รายการแจ้งซ่อม</Text>
          {reports.length === 0 ? (
            <Text style={styles.emptyText}>ไม่มีรายการแจ้งซ่อม</Text>
          ) : (
            reports.map((r, idx) => (
              <View key={r._id || idx} style={[styles.reportCard, { backgroundColor: theme.card }]}>
                <Text style={styles.reportFacility}>
                  อุปกรณ์: {r.facility || '-'}
                </Text>
                <Text>รายละเอียด: {r.description || '-'}</Text>
                <Text>
                  สถานะ: {STATUS_LABEL[r.status] || r.status}
                </Text>
                <Text>วันที่แจ้ง: {formatDate(r.created_at)}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#f7faff',
    minHeight: 400,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 18,
    textAlign: 'center',
  },
  statText: {
    fontSize: 18,
    marginBottom: 6,
    color: '#1565c0',
  },
  sectionTitle: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
    // สำหรับ web ใช้ boxShadow, RN Mobile จะข้ามไปเอง
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  reportFacility: {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  emptyText: {
    color: 'gray',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 8,
  },
  dateText: {
    color: '#555',
    fontSize: 15,
    marginLeft: 12,
  },
  error: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  }
});

export default RoomDetailScreen;