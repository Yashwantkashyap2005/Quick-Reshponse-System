import React, { useState, memo } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthInput = memo(({
  label,
  icon,
  secureTextEntry,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={focused ? '#6C63FF' : '#888'} style={styles.icon} />
        ) : null}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#aaa"
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          underlineColorAndroid="transparent"
          blurOnSubmit={false}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#ccc', marginBottom: 6, letterSpacing: 0.5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E2E', borderRadius: 14, borderWidth: 1.5, borderColor: '#2A2A3C', paddingHorizontal: 14, paddingVertical: 12 },
  inputRowFocused: { borderColor: '#6C63FF' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, textAlignVertical: 'center' },
});

export default AuthInput;
