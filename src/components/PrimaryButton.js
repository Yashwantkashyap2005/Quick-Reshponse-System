import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const PrimaryButton = ({ title, onPress, loading = false, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={loading} style={style}>
    <LinearGradient colors={['#6C63FF', '#A78BFA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  gradient: { paddingVertical: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.8 },
});

export default PrimaryButton;
