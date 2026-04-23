import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Switch, Share, TextInput, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const { user, voiceEnabled, setVoiceEnabled, customKeyword, setCustomKeyword, shakeEnabled, setShakeEnabled } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        try { await logoutUser(); } catch (e) { console.error('Logout error:', e); }
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => { try { await logoutUser(); } catch (_) {} } },
      ]);
    }
  };

  const handleShareLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'Location permission is required to share your location.');
        return;
      }
      if (Platform.OS !== 'web') {
        try {
          const providerStatus = await Location.getProviderStatusAsync();
          if (!providerStatus.locationServicesEnabled) {
            showAlert('GPS is Off', 'Please turn on your phone GPS / Location first.');
            return;
          }
        } catch(e){}
      }
      let location = null;
      try {
        location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, timeout: 5000 });
      } catch (e) {
        if (Platform.OS !== 'web') {
          location = await Location.getLastKnownPositionAsync();
        }
      }
      if (location) {
        const mapLink = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
        const msg = `I am safe. Here is my current location: ${mapLink}`;
        if (Platform.OS === 'web') {
          showAlert('Location Link (Copy this)', mapLink);
        } else {
          await Share.share({ message: msg });
        }
      } else {
        showAlert('Error', 'Could not get your location. Try going outside or turning GPS off and on.');
      }
    } catch (e) {
      showAlert('Error', 'An error occurred while fetching location.');
    }
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View style={styles.bg}>
      <LinearGradient colors={['#0A0A14', '#0D0D1A']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Active & Safe</Text>
          </View>
        </View>
        <View style={styles.menu}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#FF3B3B22', borderColor: '#FF3B3B44' }]}>
              <Ionicons name={voiceEnabled ? "mic" : "mic-off"} size={20} color="#FF3B3B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Voice Activation</Text>
              <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Say "help" to trigger SOS</Text>
            </View>
            <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} trackColor={{ false: '#2A2A3C', true: '#FF3B3B55' }} thumbColor={voiceEnabled ? '#FF3B3B' : '#888'} />
          </View>
          {voiceEnabled && (
            <View style={[styles.menuItem, { marginTop: -2 }]}>
              <View style={[styles.menuIcon, { backgroundColor: '#6C63FF22', borderColor: '#6C63FF44' }]}>
                <Ionicons name="pencil" size={18} color="#6C63FF" />
              </View>
              <TextInput style={{ flex: 1, color: '#fff', fontSize: 15 }} placeholder="Set custom voice word..." placeholderTextColor="#666" value={customKeyword} onChangeText={setCustomKeyword} />
            </View>
          )}
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: '#F59E0B22', borderColor: '#F59E0B44' }]}>
              <Ionicons name="phone-portrait-outline" size={20} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>Shake to SOS</Text>
              <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Shake phone to trigger SOS</Text>
            </View>
            <Switch value={shakeEnabled} onValueChange={setShakeEnabled} trackColor={{ false: '#2A2A3C', true: '#F59E0B55' }} thumbColor={shakeEnabled ? '#F59E0B' : '#888'} />
          </View>
          <MenuItem icon="shield-checkmark" label="Safety Status" color="#4ADE80" onPress={() => showAlert('Safety Status', 'Your status is currently set to: Active & Safe.')} />
          <MenuItem icon="location" label="Share Location" color="#60A5FA" onPress={handleShareLocation} />
          <MenuItem icon="notifications" label="Notification Settings" color="#F59E0B" onPress={() => showAlert('Notifications', 'All emergency and system notifications are currently enabled.')} />
          <MenuItem icon="lock-closed" label="Change Password" color="#A78BFA" onPress={() => showAlert('Security', 'A password reset link has been sent to your registered email.')} />
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const MenuItem = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#444" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0A0A14' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#6C63FF33', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#6C63FF', marginBottom: 14 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#A78BFA' },
  displayName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4ADE8022', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#4ADE8044' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  statusText: { fontSize: 13, color: '#4ADE80', fontWeight: '600' },
  menu: { paddingHorizontal: 20, gap: 10, marginTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13132A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2A3C', gap: 14 },
  menuIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  menuLabel: { flex: 1, fontSize: 15, color: '#ddd', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, margin: 20, marginTop: 24, backgroundColor: '#FF6B6B11', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FF6B6B33' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FF6B6B' },
});

export default ProfileScreen;
