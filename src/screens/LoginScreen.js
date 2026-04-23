import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';
import { loginUser } from '../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = useCallback((val) => setEmail(val), []);
  const handlePasswordChange = useCallback((val) => setPassword(val), []);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in both email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginUser(email.trim(), password);
    } catch (error) {
      Alert.alert('Login Failed', `${friendlyError(error.code)}\n\n(Code: ${error.code || 'unknown'})`);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const goToSignup = useCallback(() => navigation.navigate('Signup'), [navigation]);

  return (
    <View style={styles.bg}>
      <LinearGradient colors={['#0D0D1A', '#12122A', '#0D0D1A']} style={StyleSheet.absoluteFillObject} renderToHardwareTextureAndroid />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex} keyboardVerticalOffset={0}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/icon.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.brand}>Raksha App</Text>
            <Text style={styles.tagline}>Welcome back 👋</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <AuthInput label="Email" icon="mail-outline" placeholder="you@example.com" value={email} onChangeText={handleEmailChange} keyboardType="email-address" />
            <AuthInput label="Password" icon="lock-closed-outline" placeholder="••••••••" value={password} onChangeText={handlePasswordChange} secureTextEntry />
            <PrimaryButton title="Sign In" onPress={handleLogin} loading={loading} />
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity style={styles.linkRow} onPress={goToSignup}>
              <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAccent}>Sign Up</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const friendlyError = (code) => {
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/invalid-email': return 'The email address is invalid.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try later.';
    case 'auth/invalid-credential': return 'Invalid credentials. Check email & password.';
    default: return 'Something went wrong. Please try again.';
  }
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0D0D1A' },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoArea: { alignItems: 'center', marginBottom: 36 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#FF3B3B', elevation: 12, overflow: 'hidden', shadowColor: '#FF3B3B', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16 },
  logoImage: { width: 88, height: 88, resizeMode: 'cover' },
  brand: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
  tagline: { fontSize: 14, color: '#888', marginTop: 4 },
  card: { backgroundColor: '#13132A', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2A2A3C', elevation: 10 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A3C' },
  dividerText: { color: '#555', marginHorizontal: 12, fontSize: 13 },
  linkRow: { alignItems: 'center' },
  linkText: { color: '#888', fontSize: 14 },
  linkAccent: { color: '#6C63FF', fontWeight: '700' },
});

export default LoginScreen;
