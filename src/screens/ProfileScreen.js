// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();
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
        {
          text: 'Sign Out', style: 'destructive',
          onPress: async () => { try { await logoutUser(); } catch (_) {} },
        },
      ]);
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

      {/* Avatar */}
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

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem icon="shield-checkmark" label="Safety Status" color="#4ADE80" />
        <MenuItem icon="location" label="Share Location" color="#60A5FA" />
        <MenuItem icon="notifications" label="Notification Settings" color="#F59E0B" />
        <MenuItem icon="lock-closed" label="Change Password" color="#A78BFA" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const MenuItem = ({ icon, label, color }) => (
  <TouchableOpacity style={styles.menuItem}>
    <View style={[styles.menuIcon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#444" />
  </TouchableOpacity>
);

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
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#6C63FF33', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#6C63FF', marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#A78BFA' },
  displayName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: '#666', marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#4ADE8022', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: '#4ADE8044',
  },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  statusText: { fontSize: 13, color: '#4ADE80', fontWeight: '600' },
  menu: { paddingHorizontal: 20, gap: 10, marginTop: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132A', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#2A2A3C', gap: 14,
  },
  menuIcon: {
    width: 42, height: 42, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  menuLabel: { flex: 1, fontSize: 15, color: '#ddd', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, margin: 20, marginTop: 24,
    backgroundColor: '#FF6B6B11', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#FF6B6B33',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FF6B6B' },
});

export default ProfileScreen;
