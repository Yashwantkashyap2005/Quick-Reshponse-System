import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, []);

  return (
    <LinearGradient colors={['#0D0D1A', '#12122A', '#0D0D1A']} style={styles.bg}>
      <View style={styles.center}>
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.pulseRingOuter, { transform: [{ scale: pulseAnim }], opacity: glowAnim }]} />
          <Animated.View style={[styles.pulseRingInner, { transform: [{ scale: pulseAnim }], opacity: glowAnim }]} />
          <View style={styles.logoCircle}>
            <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
          </View>
        </View>
        <Text style={styles.brand}>Raksha App</Text>
        <Text style={styles.tagline}>Your Safety, Our Priority</Text>
        <ActivityIndicator color="#FF3B3B" style={{ marginTop: 32 }} size="large" />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoWrapper: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  pulseRingOuter: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#FF3B3B', opacity: 0.15,
  },
  pulseRingInner: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#FF3B3B', opacity: 0.2,
  },
  logoCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#FF3B3B',
    shadowColor: '#FF3B3B', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 20, elevation: 16,
    overflow: 'hidden',
  },
  logoImage: { width: 110, height: 110, resizeMode: 'cover' },
  brand: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  tagline: { fontSize: 14, color: '#888', marginTop: 6, letterSpacing: 1 },
});

export default SplashScreen;
