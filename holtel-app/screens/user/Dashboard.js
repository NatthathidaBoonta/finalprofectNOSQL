import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import theme from '../../utils/theme';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        if (!auth || !auth.user || !auth.user.room_number) return;
        const res = await axios.get(`http://localhost:5001/api/rooms/${auth.user.room_number}`);
        setRoom(res.data);
      } catch (err) {
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [auth]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>รายละเอียดห้องของคุณ</Text>

      {!room ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>ไม่พบข้อมูลห้องของคุณ</Text>
        </Card>
      ) : (
        <Card style={styles.roomCard}>
          <Text style={styles.roomNumber}>ห้อง {room.room_number}</Text>
          <View style={{ width: '100%', marginBottom: 8 }}>
            <Text style={styles.facilityText}><Text style={styles.labelBold}>อุปกรณ์ในห้อง:</Text></Text>
            {room.facilities && room.facilities.length > 0 ? (
              <View style={styles.chipsContainer}>
                {room.facilities.map((f, i) => (
                  <View key={i} style={styles.chip}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.chipText}>{f}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>ไม่มีข้อมูล</Text>
            )}
          </View>
          <Text style={styles.facilityText}>
            <Text style={styles.labelBold}>ชั้น: </Text>
            {room.floor}
          </Text>
        </Card>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: theme.primary,
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  roomCard: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'flex-start',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
  },
  roomNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.primary,
    marginBottom: 10,
  },
  facilityText: {
    fontSize: 15,
    color: theme.text,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    backgroundColor: theme.secondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  labelBold: {
    fontWeight: '700',
    color: theme.muted,
  },
  emptyText: {
    color: theme.muted,
    fontStyle: 'italic',
  },
});

export default Dashboard;