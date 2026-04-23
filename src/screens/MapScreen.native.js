import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef(null);
  const mapRef = useRef(null);

  const requestAndFetch = useCallback(async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') { setLoading(false); return; }
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation(current);
    } catch (e) {
      console.error('Location error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (watchRef.current) return;
    setTracking(true);
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (newLocation) => {
        setLocation(newLocation);
        mapRef.current?.animateToRegion({
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 800);
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
    setTracking(false);
  }, []);

  const centerMap = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 600);
    }
  }, [location]);

  useEffect(() => {
    requestAndFetch();
    return () => { watchRef.current?.remove(); };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A14', '#0D0D1A']} style={StyleSheet.absoluteFillObject} renderToHardwareTextureAndroid />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Location</Text>
        <View style={[styles.statusDot, { backgroundColor: tracking ? '#4ADE80' : '#555' }]} />
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Fetching location…</Text>
        </View>
      ) : permissionStatus === 'denied' ? (
        <View style={styles.centered}>
          <Ionicons name="location-sharp" size={64} color="#FF3B3B" />
          <Text style={styles.permTitle}>Location Access Denied</Text>
          <Text style={styles.permSub}>Enable location permission in device settings to use this feature.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={requestAndFetch}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : location ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation={false}
            showsCompass
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
          >
            <Circle
              center={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              radius={location.coords.accuracy ?? 30}
              fillColor="rgba(108,99,255,0.12)"
              strokeColor="rgba(108,99,255,0.4)"
              strokeWidth={1.5}
            />
            <Marker
              coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
              title="You are here"
              description={`Accuracy: ±${Math.round(location.coords.accuracy ?? 0)}m`}
            >
              <View style={styles.markerOuter}>
                <View style={styles.markerInner}>
                  <Ionicons name="person" size={16} color="#fff" />
                </View>
              </View>
            </Marker>
          </MapView>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="navigate" size={14} color="#6C63FF" />
              <Text style={styles.infoText}>{location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="radio-button-on" size={14} color="#4ADE80" />
              <Text style={styles.infoText}>Accuracy: ±{Math.round(location.coords.accuracy ?? 0)} m</Text>
            </View>
          </View>
          <View style={styles.fabStack}>
            <TouchableOpacity style={styles.fab} onPress={centerMap}>
              <Ionicons name="locate" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fab, styles.fabTrack, tracking && styles.fabTrackActive]} onPress={tracking ? stopTracking : startTracking}>
              <Ionicons name={tracking ? 'pause' : 'play'} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  loadingText: { color: '#888', fontSize: 15, marginTop: 8 },
  permTitle: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center' },
  permSub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },
  retryBtn: { backgroundColor: '#6C63FF', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12, marginTop: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  markerOuter: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(108,99,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#6C63FF55' },
  markerInner: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  infoCard: { position: 'absolute', bottom: 120, left: 16, right: 16, backgroundColor: 'rgba(13,13,26,0.92)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2A2A3C', gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#ccc', fontSize: 13, fontWeight: '500' },
  fabStack: { position: 'absolute', bottom: 32, right: 16, gap: 12 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabTrack: { backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#4ADE8055' },
  fabTrackActive: { backgroundColor: '#4ADE8022', borderColor: '#4ADE80' },
});

export default MapScreen;
