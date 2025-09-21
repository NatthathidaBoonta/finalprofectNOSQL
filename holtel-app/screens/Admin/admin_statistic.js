import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';

const AdminStatistic = () => {
  const { auth } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [topRooms, setTopRooms] = useState([]);
  const [topFacilities, setTopFacilities] = useState([]);
  const [avgTime, setAvgTime] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5001/api/admin/reports/advance-statistics', {
          headers: { Authorization: `Bearer ${auth?.token || ''}` }
        });
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลสถิติ');
        const data = await res.json();
        setMonthlyStats(data.monthlyStats || []);
        setTopRooms(data.topRooms || []);
        setTopFacilities(data.topFacilities || []);
        setAvgTime(data.avgTime || null);
      } catch (err) {
        Alert.alert('Error', err.message || 'เกิดข้อผิดพลาด');
      }
      setLoading(false);
    };
    fetchStats();
  }, [auth?.token]);

  const totalReports = monthlyStats.reduce((s, m) => s + (m.count || 0), 0);
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>สถิติการแจ้งซ่อม</Text>

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} color={theme.primary} />
        ) : (
          <View style={styles.flexGrow}>
            {/* รวมแจ้งซ่อม */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>แจ้งซ่อมรวม</Text>
              <Text style={styles.summaryValue}>{totalReports}</Text>
            </View>

            {/* แจ้งซ่อมรายเดือน */}
            <Text style={styles.sectionTitle}>จำนวนแจ้งซ่อมรายเดือน</Text>
            {monthlyStats.length === 0 ? (
              <Text style={styles.emptyText}>ไม่มีข้อมูล</Text>
            ) : (
              monthlyStats.map((item, idx) => (
                <View key={idx} style={styles.rowCard}>
                  <View style={styles.rowSpace}>
                    <Text style={styles.bold}>{item.month}</Text>
                    <Text style={styles.muted}>{item.count} ครั้ง</Text>
                  </View>
                </View>
              ))
            )}

            {/* ห้องที่แจ้งซ่อมมากที่สุด */}
            <Text style={styles.sectionTitle}>ห้องที่แจ้งซ่อมมากที่สุด</Text>
            {topRooms.length === 0 ? (
              <Text style={styles.emptyText}>ไม่มีข้อมูล</Text>
            ) : (
              topRooms.map((item, idx) => (
                <View key={idx} style={styles.rowCard}>
                  <View style={styles.rowSpace}>
                    <Text>ห้อง <Text style={styles.bold}>{item.room_number}</Text></Text>
                    <Text style={styles.muted}>{item.count} ครั้ง</Text>
                  </View>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${Math.min(100, (item.count / (topRooms[0]?.count || item.count)) * 100)}%`, backgroundColor: theme.primary }]} />
                  </View>
                </View>
              ))
            )}

            {/* อุปกรณ์ที่แจ้งซ่อมมากที่สุด */}
            <Text style={styles.sectionTitle}>อุปกรณ์ที่แจ้งซ่อมมากที่สุด</Text>
            {topFacilities.length === 0 ? (
              <Text style={styles.emptyText}>ไม่มีข้อมูล</Text>
            ) : (
              topFacilities.map((item, idx) => (
                <View key={idx} style={styles.rowCard}>
                  <View style={styles.rowSpace}>
                    <Text style={styles.bold}>{item.facility}</Text>
                    <Text style={styles.muted}>{item.count} ครั้ง</Text>
                  </View>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${Math.min(100, (item.count / (topFacilities[0]?.count || item.count)) * 100)}%`, backgroundColor: theme.accent }]} />
                  </View>
                </View>
              ))
            )}

            {/* เวลาเฉลี่ย */}
            <Text style={styles.sectionTitle}>เวลาเฉลี่ยในการดำเนินการ</Text>
            <View style={styles.rowCard}>
              <Text style={styles.centerText}>{avgTime !== null ? `${avgTime} วัน` : 'ไม่มีข้อมูล'}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 16,
  },
  flexGrow: {
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
    color: theme.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
    color: theme.text,
  },
  emptyText: {
    color: theme.muted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 14,
  backgroundColor: theme.card,
  marginBottom: 14,
  boxShadow: '0 2px 6px ' + theme.shadow,
  },
  summaryTitle: {
    fontSize: 13,
    color: theme.muted,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
    marginTop: 6,
  },
  rowCard: {
    paddingVertical: 12,
  paddingHorizontal: 12,
  borderRadius: 12,
  backgroundColor: theme.card,
  marginVertical: 6,
  boxShadow: '0 1px 4px ' + theme.shadow,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muted: {
    color: theme.muted,
  },
  bold: {
    fontWeight: 'bold',
    color: theme.text,
  },
  barBackground: {
    height: 10,
    backgroundColor: '#EAEAEA',
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
    width: '100%'
  },
  barFill: {
    height: 10,
    borderRadius: 8,
  },
  centerText: {
    textAlign: 'center',
    color: theme.text,
    fontSize: 16,
  },
});

export default AdminStatistic;
