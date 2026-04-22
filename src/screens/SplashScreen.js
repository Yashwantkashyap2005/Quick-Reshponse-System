// src/screens/SplashScreen.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const SplashScreen = () => (
  <LinearGradient colors={['#0D0D1A', '#12122A', '#0D0D1A']} style={styles.bg}>
    <View style={styles.center}>
      <View style={styles.logoCircle}>
        <Ionicons name="flash" size={40} color="#6C63FF" />
      </View>
      <Text style={styles.brand}>AuthKit</Text>
      <ActivityIndicator color="#6C63FF" style={{ marginTop: 32 }} size="large" />
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF44',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
  },
  brand: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: 2 },
});

export default SplashScreen;
