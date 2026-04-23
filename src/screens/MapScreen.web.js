import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestAndFetch = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') { setLoading(false); return; }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(current);
    } catch (e) {
      console.error('Location error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { requestAndFetch(); }, []);

  const openGoogleMaps = useCallback(() => {
    if (!location) return;
    Linking.openURL(`https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`);
  }, [location]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A14', '#0D0D1A']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Location</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.iconBox}>
          <Ionicons name="map" size={60} color="#6C63FF" />
        </View>
        <Text style={styles.title}>Your Location</Text>
        <Text style={styles.subtitle}>
          Interactive map is available on the mobile app.{'\n'}Your live coordinates are shown below.
        </Text>
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={styles.loadingText}>Getting your location…</Text>
          </View>
        ) : permissionStatus === 'denied' ? (
          <View style={styles.deniedBox}>
            <Ionicons name="location-sharp" size={48} color="#FF3B3B" />
            <Text style={styles.deniedText}>Location permission denied</Text>
            <Text style={{color: '#aaa', textAlign: 'center', marginBottom: 12, paddingHorizontal: 20}}>
              Please click the 🔒 Lock icon in your browser's address bar at the top, change Location to "Allow", and try again.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={requestAndFetch}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : location ? (
          <>
            <View style={styles.coordCard}>
              <CoordRow icon="navigate" label="Latitude" value={location.coords.latitude.toFixed(6)} />
              <View style={styles.sep} />
              <CoordRow icon="compass" label="Longitude" value={location.coords.longitude.toFixed(6)} />
              <View style={styles.sep} />
              <CoordRow icon="radio-button-on" label="Accuracy" value={`±${Math.round(location.coords.accuracy ?? 0)} m`} />
              <View style={styles.sep} />
              <CoordRow icon="trending-up" label="Altitude" value={location.coords.altitude != null ? `${Math.round(location.coords.altitude)} m` : 'N/A'} />
            </View>
            <TouchableOpacity style={styles.gmapsBtn} onPress={openGoogleMaps}>
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={styles.gmapsBtnText}>Open in Google Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshBtn} onPress={requestAndFetch}>
              <Ionicons name="refresh" size={16} color="#6C63FF" />
              <Text style={styles.refreshText}>Refresh Location</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const CoordRow = ({ icon, label, value }) => (
  <View style={styles.coordRow}>
    <View style={styles.coordIcon}>
      <Ionicons name={icon} size={16} color="#6C63FF" />
    </View>
    <View>
      <Text style={styles.coordLabel}>{label}</Text>
      <Text style={styles.coordValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { alignItems: 'center', padding: 24, paddingBottom: 48 },
  iconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C63FF22', borderWidth: 1.5, borderColor: '#6C63FF44', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  loaderBox: { alignItems: 'center', gap: 12, marginTop: 16 },
  loadingText: { color: '#888', fontSize: 14 },
  deniedBox: { alignItems: 'center', gap: 12, marginTop: 16 },
  deniedText: { color: '#FF3B3B', fontSize: 16, fontWeight: '600' },
  retryBtn: { backgroundColor: '#6C63FF', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  coordCard: { width: '100%', maxWidth: 420, backgroundColor: '#13132A', borderRadius: 20, borderWidth: 1, borderColor: '#2A2A3C', marginBottom: 16 },
  coordRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  coordIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6C63FF22', alignItems: 'center', justifyContent: 'center' },
  coordLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 0.8 },
  coordValue: { fontSize: 16, color: '#fff', fontWeight: '700', marginTop: 2 },
  sep: { height: 1, backgroundColor: '#1A1A2E', marginHorizontal: 8 },
  gmapsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4285F4', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13, marginBottom: 12, width: '100%', maxWidth: 420, justifyContent: 'center' },
  gmapsBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#6C63FF22', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13, borderWidth: 1, borderColor: '#6C63FF44', width: '100%', maxWidth: 420, justifyContent: 'center' },
  refreshText: { color: '#6C63FF', fontWeight: '600', fontSize: 14 },
});

export default MapScreen;
