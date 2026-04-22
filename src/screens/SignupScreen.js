// src/screens/SignupScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';
import { registerUser } from '../services/authService';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // Stable handlers — no re-render on every keystroke
  const handleNameChange = useCallback((val) => setName(val), []);
  const handleEmailChange = useCallback((val) => setEmail(val), []);
  const handlePasswordChange = useCallback((val) => setPassword(val), []);
  const handleConfirmChange = useCallback((val) => setConfirm(val), []);

  const handleSignup = useCallback(async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerUser(name.trim(), email.trim(), password);
    } catch (error) {
      console.error('SIGNUP ERROR:', error.code, error.message);
      Alert.alert('Signup Failed', friendlyError(error.code));
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirm]);

  const goToLogin = useCallback(() => navigation.navigate('Login'), [navigation]);

  return (
    <View style={styles.bg}>
      <LinearGradient
        colors={['#0D0D1A', '#12122A', '#0D0D1A']}
        style={StyleSheet.absoluteFillObject}
        renderToHardwareTextureAndroid
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add" size={34} color="#6C63FF" />
            </View>
            <Text style={styles.brand}>AuthKit</Text>
            <Text style={styles.tagline}>Create your account ✨</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign Up</Text>

            <AuthInput
              label="Full Name"
              icon="person-outline"
              placeholder="John Doe"
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="words"
            />
            <AuthInput
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
            />
            <AuthInput
              label="Password"
              icon="lock-closed-outline"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
            />
            <AuthInput
              label="Confirm Password"
              icon="shield-checkmark-outline"
              placeholder="Repeat password"
              value={confirm}
              onChangeText={handleConfirmChange}
              secureTextEntry
            />

            <PrimaryButton title="Create Account" onPress={handleSignup} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={goToLogin}>
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkAccent}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const friendlyError = (code) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/invalid-email': return 'The email address is invalid.';
    case 'auth/weak-password': return 'Password is too weak.';
    default: return 'Something went wrong. Please try again.';
  }
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0D0D1A' },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E1E2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#6C63FF44',
    elevation: 8,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
  },
  tagline: { fontSize: 14, color: '#888', marginTop: 4 },
  card: {
    backgroundColor: '#13132A',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A3C',
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#2A2A3C' },
  dividerText: { color: '#555', marginHorizontal: 12, fontSize: 13 },
  linkRow: { alignItems: 'center' },
  linkText: { color: '#888', fontSize: 14 },
  linkAccent: { color: '#6C63FF', fontWeight: '700' },
});

export default SignupScreen;
