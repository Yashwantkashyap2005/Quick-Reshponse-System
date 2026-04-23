import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [shakeEnabled, setShakeEnabledState] = useState(true);
  const [customKeyword, setCustomKeywordState] = useState('');

  const setCustomKeyword = async (keyword) => {
    setCustomKeywordState(keyword);
    try {
      await AsyncStorage.setItem('customKeyword', keyword);
    } catch (e) {
      console.log('Error saving custom keyword', e);
    }
  };

  const setShakeEnabled = async (enabled) => {
    setShakeEnabledState(enabled);
    try {
      await AsyncStorage.setItem('shakeEnabled', JSON.stringify(enabled));
    } catch (e) {
      console.log('Error saving shake state', e);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedKeyword = await AsyncStorage.getItem('customKeyword');
        if (storedKeyword) setCustomKeywordState(storedKeyword);

        const storedShake = await AsyncStorage.getItem('shakeEnabled');
        if (storedShake !== null) setShakeEnabledState(JSON.parse(storedShake));
      } catch (e) {
        console.log('Error loading settings', e);
      }
    };
    loadSettings();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, voiceEnabled, setVoiceEnabled, customKeyword, setCustomKeyword, shakeEnabled, setShakeEnabled }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
