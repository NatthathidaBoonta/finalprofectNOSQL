import React, { useState } from 'react';
import { Text, ScrollView, StyleSheet, TouchableOpacity, Modal, View } from 'react-native';
import LazyImage from '../../components/LazyImage';
import { useRoute, useNavigation } from '@react-navigation/native';
import theme from '../../utils/theme';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';

const AdminReportDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const report = route.params?.report;
  const [previewVisible, setPreviewVisible] = useState(false);

  const getUserLabel = (r) => {
    if (!r) return '-';
    // prefer populated user or populated user_id; always return a primitive string
    const u = r.user || r.user_id;
    if (!u) return '-';
    if (typeof u === 'object') {
      return u.name || u.username || (u._id ? String(u._id) : '-') || '-';
    }
    return String(u);
  };

  if (!report) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>ไม่พบรีพอร์ตนี้</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>ย้อนกลับ</Text>
      </TouchableOpacity>

      <Text style={styles.header}>รายละเอียดรีพอร์ต</Text>

      {report.image_url ? (() => {
        const isRelative = report.image_url && report.image_url.startsWith('/uploads');
        const imageSrc = isRelative ? `http://localhost:5001${report.image_url}` : report.image_url;
        return (
          <>
            <TouchableOpacity onPress={() => setPreviewVisible(true)}>
              <LazyImage sourceUri={imageSrc} style={styles.image} resizeMode="cover" />
            </TouchableOpacity>
            <Modal visible={previewVisible} transparent={true} onRequestClose={() => setPreviewVisible(false)}>
              <View style={styles.previewOverlay}>
                <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewVisible(false)}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>ปิด</Text>
                </TouchableOpacity>
                <LazyImage sourceUri={imageSrc} style={styles.previewImage} resizeMode="contain" />
              </View>
            </Modal>
          </>
        );
      })() : null}

      <Card style={styles.card}>
        {(() => {
          const userLabelRaw = getUserLabel(report);
          const userLabel = (userLabelRaw && typeof userLabelRaw === 'object') ? (userLabelRaw.name || userLabelRaw.username || (userLabelRaw._id ? String(userLabelRaw._id) : JSON.stringify(userLabelRaw))) : String(userLabelRaw || '-');
          return <Text style={styles.label}><Text style={styles.labelBold}>ผู้แจ้ง: </Text>{userLabel}</Text>;
        })()}

        <Text style={styles.label}><Text style={styles.labelBold}>ห้อง: </Text>{report.room_number || '-'}</Text>
        <Text style={styles.label}><Text style={styles.labelBold}>อุปกรณ์: </Text>{report.facility || '-'}</Text>
        <Text style={styles.label}><Text style={styles.labelBold}>รายละเอียด: </Text>{report.description || '-'}</Text>
        <Text style={styles.label}><Text style={styles.labelBold}>สถานะ: </Text>{report.status || '-'}</Text>
        <Text style={styles.label}><Text style={styles.labelBold}>สร้างเมื่อ: </Text>{report.created_at ? new Date(report.created_at).toLocaleString('th-TH') : '-'}</Text>
        <Text style={styles.label}><Text style={styles.labelBold}>แก้ไขล่าสุด: </Text>{report.updated_at ? new Date(report.updated_at).toLocaleString('th-TH') : '-'}</Text>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    minHeight: 200,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    backgroundColor: theme.card,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: theme.text,
    marginBottom: 8,
  },
  labelBold: {
    fontWeight: 'bold',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  backText: {
    color: theme.primary,
    fontWeight: 'bold',
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    color: theme.muted,
  }
  ,
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: '100%',
    height: '80%'
  },
  previewClose: {
    position: 'absolute',
    top: 30,
    right: 20,
    zIndex: 10,
    padding: 8,
  }
});

export default AdminReportDetail;
