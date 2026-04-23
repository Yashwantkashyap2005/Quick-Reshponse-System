// src/screens/AlertsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { subscribeToAlerts } from '../services/alertsService';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const AlertsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToAlerts(user.uid, (data) => {
        setAlerts(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  return (
    <View style={styles.bg}>
    <LinearGradient colors={['#0A0A14', '#0D0D1A']} style={StyleSheet.absoluteFillObject} />

    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Alert History</Text>
      <View style={{ width: 40 }} />
    </View>

    <FlatList
      data={alerts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.alertCard}>
          <View style={[styles.alertDot, { backgroundColor: item.color || '#FF3B3B' }]} />
          <View style={styles.alertInfo}>
            <View style={styles.alertRow}>
              <Text style={[styles.alertType, { color: item.color || '#FF3B3B' }]}>{item.type}</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.alertTime}>{formatDate(item.timestamp)}</Text>
                <Text style={styles.alertTime}>{formatTime(item.timestamp)}</Text>
              </View>
            </View>
            <Text style={styles.alertMessage}>{item.message}</Text>
            {item.link && (
              <TouchableOpacity onPress={() => Linking.openURL(item.link)} style={styles.linkButton}>
                <Text style={styles.linkText}>View Location on Map</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Ionicons name="notifications-off-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>No alerts yet</Text>
        </View>
      }
    />
  </View>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0A0A14' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  list: { paddingHorizontal: 20, gap: 12 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132A', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#2A2A3C', gap: 14,
  },
  alertDot: { width: 12, height: 12, borderRadius: 6 },
  alertInfo: { flex: 1 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  alertType: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  alertTime: { fontSize: 12, color: '#555' },
  alertMessage: { fontSize: 14, color: '#aaa', lineHeight: 20 },
  linkButton: { marginTop: 8, paddingVertical: 4 },
  linkText: { color: '#60A5FA', fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  emptyBox: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#444', fontSize: 16 },
});

export default AlertsScreen;
