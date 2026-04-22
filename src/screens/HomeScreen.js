// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/authService';
import { fetchContacts } from '../services/contactsService';
import { addAlert } from '../services/alertsService';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [isListening, setIsListening] = useState(false);

  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.toLowerCase() || '';
    if (
      transcript.includes('help help') ||
      transcript.includes('emergency emergency') ||
      transcript.includes('save me save me')
    ) {
      ExpoSpeechRecognitionModule.stop();
      handleSOSPress();
    }
  });

  const toggleVoice = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
    } else {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert('Permission denied', 'Microphone access is required for voice activation.');
        return;
      }
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
      });
    }
  };

  // Pulse animation loop
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handleSOSPress = useCallback(async () => {
    // Scale press-in animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSosActive(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      let locationLink = '';
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        locationLink = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
      } else {
        locationLink = 'Location permission denied.';
      }

      const message = `I am in danger. Track me: ${locationLink}`;
      
      let phoneNumbers = [];
      let contactNames = [];
      if (user?.uid) {
        const contacts = await fetchContacts(user.uid);
        phoneNumbers = contacts.map(contact => contact.phone);
        contactNames = contacts.map(contact => contact.name);
      }
      
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable && phoneNumbers.length > 0) {
        await SMS.sendSMSAsync(phoneNumbers, message);
      } else if (!isAvailable) {
        Alert.alert('SMS unavailable', 'Could not send SMS on this device');
      } else {
        Alert.alert('No Contacts', 'No emergency contacts found to send SMS.');
      }

      const recipientsText = contactNames.length > 0 ? `Sent to: ${contactNames.join(', ')}` : 'No contacts added';

      const alertData = {
        type: 'SOS',
        message: `SOS alert triggered.\n${recipientsText}\nLocation: ${locationLink}`,
        color: '#FF3B3B',
        link: locationLink.startsWith('http') ? locationLink : null
      };

      if (user?.uid) {
        await addAlert(user.uid, alertData);
      }

      navigation.navigate('Alerts');
    } catch (error) {
      console.error('Error fetching location', error);
      Alert.alert('Error', 'Could not fetch location.');
      setSosActive(false);
    }
  }, [scaleAnim, navigation]);

  const handleLogout = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Alert.alert is not supported on web — use browser confirm
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        try { await logoutUser(); } catch (e) { console.error('Logout error:', e); }
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try { await logoutUser(); } catch (e) { console.error('Logout error:', e); }
          },
        },
      ]);
    }
  }, []);

  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <View style={styles.bg}>
      <LinearGradient
        colors={['#0A0A14', '#0D0D1A', '#0A0A14']}
        style={StyleSheet.absoluteFillObject}
        renderToHardwareTextureAndroid
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userPill}>
          <View style={styles.onlineDot} />
          <Text style={styles.userPillText}>
            {displayName}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.center}>

        {/* Status Text */}
        <Text style={styles.statusLabel}>CURRENT STATUS</Text>
        <Text style={[styles.safeText, sosActive && styles.dangerText]}>
          {sosActive ? '🚨 SOS Sent' : '✅ You Are Safe'}
        </Text>

        <TouchableOpacity 
          onPress={toggleVoice} 
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 10, borderRadius: 20, backgroundColor: isListening ? '#FF3B3B11' : '#2A2A3C' }}
        >
          <Ionicons name={isListening ? "mic" : "mic-off"} size={20} color={isListening ? "#FF3B3B" : "#888"} />
          <Text style={{ color: isListening ? "#FF3B3B" : "#aaa", marginLeft: 8, fontSize: 14, fontWeight: '600' }}>
            {isListening ? "Listening for 'Help help'..." : "Voice Activation Off"}
          </Text>
        </TouchableOpacity>

        {/* Pulse rings + SOS Button */}
        <View style={styles.sosWrapper}>
          {/* Outer pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRingOuter,
              { transform: [{ scale: pulseAnim }], opacity: sosActive ? 0.6 : 0.2 },
            ]}
          />
          {/* Inner pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRingInner,
              { transform: [{ scale: pulseAnim }], opacity: sosActive ? 0.5 : 0.15 },
            ]}
          />

          {/* SOS Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onLongPress={handleSOSPress}
              delayLongPress={1000}
              style={({ pressed }) => [
                styles.sosButton,
                pressed && styles.sosButtonPressed,
              ]}
            >
              <LinearGradient
                colors={sosActive ? ['#FF1744', '#D50000'] : ['#FF3B3B', '#CC0000']}
                style={styles.sosGradient}
              >
                <Text style={styles.sosText}>SOS</Text>
                <Text style={styles.sosSubText}>Hold for Emergency</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        <Text style={styles.hint}>
          Press SOS to alert your emergency contacts
        </Text>
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomGrid}>
        <ActionButton
          icon="people"
          label="Contacts"
          color="#6C63FF"
          onPress={() => navigation.navigate('Contacts')}
        />
        <ActionButton
          icon="map"
          label="Map"
          color="#60A5FA"
          onPress={() => navigation.navigate('Map')}
        />
        <ActionButton
          icon="notifications"
          label="Alerts"
          color="#F59E0B"
          onPress={() => navigation.navigate('Alerts')}
        />
        <ActionButton
          icon="person"
          label="Profile"
          color="#34D399"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    </View>
  );
};

const ActionButton = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.actionIconBg, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Ionicons name={icon} size={26} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#0A0A14',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A3C',
    gap: 8,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  userPillText: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF6B6B11',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B33',
  },

  // Center
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  safeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4ADE80',
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  dangerText: {
    color: '#FF3B3B',
  },

  // SOS
  sosWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FF3B3B',
  },
  pulseRingOuter: {
    width: 220,
    height: 220,
  },
  pulseRingInner: {
    width: 180,
    height: 180,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#FF3B3B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
  },
  sosButtonPressed: {
    opacity: 0.9,
  },
  sosGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#FF6B6B55',
  },
  sosText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  sosSubText: {
    fontSize: 9,
    color: '#ffcccc',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  hint: {
    fontSize: 13,
    color: '#444',
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 20,
  },

  // Bottom Buttons
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A2E',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  actionIconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  actionLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
