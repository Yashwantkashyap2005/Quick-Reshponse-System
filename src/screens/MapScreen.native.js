import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const watchRef = useRef(null);
  const webViewRef = useRef(null);

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
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            updateLocation(${newLocation.coords.latitude}, ${newLocation.coords.longitude}, ${newLocation.coords.accuracy || 30});
            true;
          `);
        }
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    watchRef.current?.remove();
    watchRef.current = null;
    setTracking(false);
  }, []);

  const centerMap = useCallback(() => {
    if (location && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        centerOnLocation(${location.coords.latitude}, ${location.coords.longitude});
        true;
      `);
    }
  }, [location]);

  useEffect(() => {
    requestAndFetch();
    return () => { watchRef.current?.remove(); };
  }, []);

  const getMapHTML = (lat, lng, accuracy) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
        .custom-marker {
          width: 36px; height: 36px;
          background: radial-gradient(circle, #6C63FF 40%, rgba(108,99,255,0.3) 70%, transparent 100%);
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 12px rgba(108,99,255,0.5);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(108,99,255,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(108,99,255,0); }
        }
        .leaflet-control-zoom { border-radius: 12px !important; overflow: hidden; border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,0.3) !important; }
        .leaflet-control-zoom a { background: #1A1A2E !important; color: #fff !important; border: none !important; width: 36px !important; height: 36px !important; line-height: 36px !important; font-size: 18px !important; }
        .leaflet-control-zoom a:hover { background: #2A2A3C !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: true,
          attributionControl: false
        }).setView([${lat}, ${lng}], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        var markerIcon = L.divIcon({
          className: '',
          html: '<div class="custom-marker"></div>',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        var marker = L.marker([${lat}, ${lng}], { icon: markerIcon }).addTo(map);
        var accuracyCircle = L.circle([${lat}, ${lng}], {
          radius: ${accuracy || 30},
          color: 'rgba(108,99,255,0.4)',
          fillColor: 'rgba(108,99,255,0.12)',
          fillOpacity: 0.5,
          weight: 1.5
        }).addTo(map);

        function updateLocation(lat, lng, acc) {
          marker.setLatLng([lat, lng]);
          accuracyCircle.setLatLng([lat, lng]);
          accuracyCircle.setRadius(acc || 30);
          map.setView([lat, lng], map.getZoom(), { animate: true });
        }

        function centerOnLocation(lat, lng) {
          map.setView([lat, lng], 16, { animate: true });
        }
      </script>
    </body>
    </html>
  `;

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
          <WebView
            ref={webViewRef}
            source={{ html: getMapHTML(location.coords.latitude, location.coords.longitude, location.coords.accuracy) }}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={[styles.centered, StyleSheet.absoluteFillObject, { backgroundColor: '#0A0A14' }]}>
                <ActivityIndicator size="large" color="#6C63FF" />
                <Text style={styles.loadingText}>Loading map…</Text>
              </View>
            )}
          />
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
  infoCard: { position: 'absolute', bottom: 120, left: 16, right: 16, backgroundColor: 'rgba(13,13,26,0.92)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#2A2A3C', gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { color: '#ccc', fontSize: 13, fontWeight: '500' },
  fabStack: { position: 'absolute', bottom: 32, right: 16, gap: 12 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabTrack: { backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#4ADE8055' },
  fabTrackActive: { backgroundColor: '#4ADE8022', borderColor: '#4ADE80' },
});

export default MapScreen;
