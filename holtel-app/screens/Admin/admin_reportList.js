import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList, Alert } from 'react-native';
import LazyImage from '../../components/LazyImage';
import theme from '../../utils/theme';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import { useNavigation } from '@react-navigation/native';

const STATUS_LABEL = {
  new: 'รอรับเรื่อง',
  'in-progress': 'กำลังดำเนินการ',
  done: 'สำเร็จแล้ว'
};
const STATUS_COLOR = {
  new: '#F6C36B',
  'in-progress': theme.primary,
  done: '#7FC6A5'
};

// ยกเลิก FILTERS เพื่อแสดงทุกสถานะพร้อมกัน

const AdminReportList = () => {
  const { auth } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigation = useNavigation();

  const fetchReports = async () => {
    setLoading(true);
    try {
  let url = `http://localhost:5001/api/reports`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth?.token || ''}` }
      });
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
      let data = await res.json();
      // เรียงล่าสุดก่อน
      data = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReports(data);
    } catch (err) {
      Alert.alert('Error', err.message || 'เกิดข้อผิดพลาด');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5001/api/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth?.token || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('อัปเดตสถานะไม่สำเร็จ');
      const updated = await res.json();
      setReports(reports =>
        reports.map(r => (r._id === updated.report._id ? updated.report : r))
      );
      Alert.alert('Success', `อัปเดตสถานะเป็น "${STATUS_LABEL[newStatus]}" แล้ว`);
      // แจ้งเตือนผู้ใช้ (สามารถปรับเป็น push/notification จริงได้ในอนาคต)
      if (newStatus === 'in-progress') {
        Alert.alert('แจ้งเตือน', 'รีพอร์ตนี้กำลังดำเนินการ');
      } else if (newStatus === 'done') {
        Alert.alert('แจ้งเตือน', 'รีพอร์ตนี้ดำเนินการเสร็จสิ้นแล้ว');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'เกิดข้อผิดพลาด');
    }
    setUpdating(false);
  };

  const renderReport = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('AdminReportDetail', { report: item })}
    >
      {item.image_url ? (() => {
        const isRel = item.image_url.startsWith('/uploads');
        const src = isRel ? `http://localhost:5001${item.image_url}` : item.image_url;
        return <LazyImage sourceUri={src} style={styles.thumb} resizeMode="cover" />;
      })() : null}
      <View style={styles.rowSpace}>
        <Text style={styles.roomText}>ห้อง: <Text style={styles.bold}>{item.room_number || '-'}</Text></Text>
        <Text style={[styles.statusTag, { backgroundColor: STATUS_COLOR[item.status] || '#ccc' }]}>
          {STATUS_LABEL[item.status]}
        </Text>
      </View>
      <Text style={styles.label}>อุปกรณ์: <Text style={styles.bold}>{item.facility || '-'}</Text></Text>
      <Text numberOfLines={2} style={styles.label}>รายละเอียด: {item.description || '-'}</Text>
      <Text style={styles.dateText}>วันที่แจ้ง: {new Date(item.created_at).toLocaleString('th-TH')}</Text>
      <View style={styles.actionRow}>
        {item.status === 'new' && (
          <TouchableOpacity
            style={styles.actionBtn}
            disabled={updating}
            onPress={() => handleUpdateStatus(item._id, 'in-progress')}
          >
            <Text style={styles.actionBtnText}>รับงาน</Text>
          </TouchableOpacity>
        )}
        {item.status === 'in-progress' && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: STATUS_COLOR.done }]}
            disabled={updating}
            onPress={() => handleUpdateStatus(item._id, 'done')}
          >
            <Text style={styles.actionBtnText}>เสร็จงาน</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer noScroll contentContainerStyle={styles.fullContent}>
      <View style={styles.container}>
        <Text style={styles.header}>รายการรีพอร์ตทั้งหมด</Text>
        {loading ? (
          <ActivityIndicator size="large" style={{marginTop: 40}} />
        ) : (
          <FlatList
            data={reports}
            keyExtractor={item => item._id || item.id}
            renderItem={({ item }) => (
              <Card style={styles.reportCard}>
                {item.image_url ? (() => {
                  const isRel = item.image_url.startsWith('/uploads');
                  const src = isRel ? `http://localhost:5001${item.image_url}` : item.image_url;
                  return <LazyImage sourceUri={src} style={styles.thumb} resizeMode="cover" />;
                })() : null}
                <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AdminReportDetail', { report: item })}>
                  <Text style={styles.roomText}>ห้อง: <Text style={styles.bold}>{item.room_number || '-'}</Text></Text>
                  <Text style={styles.label}>อุปกรณ์: <Text style={styles.bold}>{item.facility || '-'}</Text></Text>
                  <Text numberOfLines={2} style={styles.label}>รายละเอียด: {item.description || '-'}</Text>
                  <Text style={styles.dateText}>วันที่แจ้ง: {new Date(item.created_at).toLocaleString('th-TH')}</Text>
                </TouchableOpacity>
                <View style={styles.rowSpace}>
                  <Text style={[styles.statusTag, { backgroundColor: STATUS_COLOR[item.status] || '#ccc' }]}>
                    {STATUS_LABEL[item.status]}
                  </Text>
                  <View style={styles.actionRow}>
                    {item.status === 'new' && (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        disabled={updating}
                        onPress={() => handleUpdateStatus(item._id, 'in-progress')}
                      >
                        <Text style={styles.actionBtnText}>รับงาน</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === 'in-progress' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: STATUS_COLOR.done }]}
                        disabled={updating}
                        onPress={() => handleUpdateStatus(item._id, 'done')}
                      >
                        <Text style={styles.actionBtnText}>เสร็จงาน</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>ไม่มีรีพอร์ต</Text>
            }
            contentContainerStyle={{ paddingBottom: 160 }}
            style={{ flex: 1, width: '100%' }}
          />
        )}

        <View style={styles.dashboardBtnContainer} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.dashboardBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AdminTabs', { screen: 'AdminDashboard' })}
          >
            <Text style={styles.dashboardBtnText}>ไปหน้าแดชบอร์ด</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  dashboardBtnContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  dashboardBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  dashboardBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 0,
    // background handled by ScreenContainer
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: theme.peachBackground,
    marginHorizontal: 5,
  },
  filterBtnActive: {
    backgroundColor: theme.primary,
  },
  filterText: {
    color: theme.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reportCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  thumb: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: -4,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  roomText: {
    color: theme.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  statusTag: {
    color: '#fff',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  label: {
    fontSize: 15,
    color: theme.text,
  },
  bold: {
    fontWeight: '800',
    color: theme.text,
  },
  dateText: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: theme.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    color: 'gray',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 18,
  }
});

export default AdminReportList;