import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
// ถ้าใช้ react-native-chart-kit สำหรับ doughnut chart บน web ให้ import แบบนี้
// import { Doughnut } from 'react-chartjs-2';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';

// ถ้าไม่ได้ใช้ chart ให้คอมเมนต์ section กราฟออก

const STATUS_LABEL = {
  new: 'รอรับเรื่อง',
  'in-progress': 'กำลังดำเนินการ',
  done: 'สำเร็จแล้ว'
};

const STATUS_COLOR = {
  new: '#fbbc04',          // yellow
  'in-progress': '#4285f4', // blue
  done: '#34a853'           // green
};

const AdminDashboard = () => {
  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState({ new: 0, 'in-progress': 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // สมมติว่าต้องแนบ token สำหรับ admin
        const res = await fetch('http://localhost:5001/api/admin/reports/statistics', {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
          }
        });
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลได้');
        const data = await res.json();
        setStats({
          new: data.new || 0,
          'in-progress': data['in-progress'] || 0,
          done: data.done || 0
        });
      } catch (err) {
        Alert.alert('Error', err.message || 'เกิดข้อผิดพลาด');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const total = stats.new + stats['in-progress'] + stats.done;

  // ตัวอย่างข้อมูลสำหรับ chart.js (web) หรือ react-native-chart-kit (mobile)
  // const chartData = {
  //   labels: [STATUS_LABEL.new, STATUS_LABEL['in-progress'], STATUS_LABEL.done],
  //   datasets: [{
  //     data: [stats.new, stats['in-progress'], stats.done],
  //     backgroundColor: [STATUS_COLOR.new, STATUS_COLOR['in-progress'], STATUS_COLOR.done],
  //   }],
  // };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }] }>
      <Text style={[styles.header, { color: theme.text }]}>Admin Dashboard</Text>
      <Text style={[styles.subHeader, { color: theme.muted }]}>สรุปสถานะรีพอร์ต</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{marginTop: 40}} color={theme.primary} />
      ) : (
        <View>
          <View style={styles.statusRow}>
            <View style={[styles.statusCard, {backgroundColor: theme.card}] }>
                <Text style={[styles.statusLabel, {color: STATUS_COLOR.new}]}>{STATUS_LABEL.new}</Text>
                <Text style={styles.statusCount}>{stats.new}</Text>
              </View>
            <View style={styles.statusCard}>
              <Text style={[styles.statusLabel, {color: STATUS_COLOR['in-progress']}]}>{STATUS_LABEL['in-progress']}</Text>
              <Text style={styles.statusCount}>{stats['in-progress']}</Text>
            </View>
            <View style={styles.statusCard}>
              <Text style={[styles.statusLabel, {color: STATUS_COLOR.done}]}>{STATUS_LABEL.done}</Text>
              <Text style={styles.statusCount}>{stats.done}</Text>
            </View>
          </View>
          <Text style={styles.totalText}>รวมทั้งหมด: <Text style={{fontWeight: 'bold'}}>{total}</Text> รายการ</Text>

          {/* Doughnut Chart (web only or ifใช้ chartkit บน mobile) */}
          {/* <View style={{alignItems: 'center', marginTop: 30}}>
            <Doughnut data={chartData} width={220} height={220} />
          </View> */}

          <TouchableOpacity
            style={[styles.linkBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('AdminReports')}
          >
            <Text style={[styles.linkBtnText, { color: '#fff' }]}>ดูรายการรีพอร์ตทั้งหมด</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: theme.background,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.primary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusCard: {
    alignItems: 'center',
    padding: 18,
    backgroundColor: theme.card,
    borderRadius: 12,
    minWidth: 100,
  boxShadow: '0 2px 6px rgba(43,198,207,0.12)',
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primary,
  },
  totalText: {
    textAlign: 'center',
    fontSize: 17,
    marginTop: 8,
    marginBottom: 16,
  },
  linkBtn: {
    backgroundColor: theme.primary,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 30,
    marginTop: 20,
    marginBottom: 10,
  },
  linkBtnText: {
    color: '#fff',
    fontSize: 17,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  linkBtnSecondary: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 30,
  },
  linkBtnText2: {
    color: '#1976d2',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

export default AdminDashboard;