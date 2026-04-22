// src/screens/ContactsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Linking, Modal, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SMS from 'expo-sms';
import { useAuth } from '../context/AuthContext';
import { subscribeToContacts, addContact, updateContact, deleteContact } from '../services/contactsService';

const ContactsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToContacts(user.uid, (data) => {
        setContacts(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const openModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setName(contact.name);
      setPhone(contact.phone);
      setRelation(contact.relation);
    } else {
      setEditingContact(null);
      setName('');
      setPhone('');
      setRelation('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingContact(null);
  };

  const saveContact = async () => {
    if (!name.trim() || !phone.trim() || !relation.trim()) {
      Alert.alert('Missing Fields', 'Please fill all fields');
      return;
    }
    
    try {
      if (editingContact) {
        await updateContact(user.uid, editingContact.id, { name, phone, relation });
      } else {
        await addContact(user.uid, { name, phone, relation });
      }
      closeModal();
    } catch (error) {
      Alert.alert('Error', `Failed to save contact: ${error.message || error}`);
      console.error('Save Contact Error:', error);
    }
  };

  const confirmDelete = (contactId) => {
    if (Platform.OS === 'web') {
        const confirmed = window.confirm('Are you sure you want to delete this contact?');
        if (confirmed) {
            deleteContact(user.uid, contactId).catch(e => console.error(e));
        }
    } else {
        Alert.alert('Delete Contact', 'Are you sure you want to delete this contact?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
                await deleteContact(user.uid, contactId);
            } catch (e) {
                console.error('Failed to delete contact', e);
            }
        }}
        ]);
    }
  };

  const handleSMS = async (phoneNumber) => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      await SMS.sendSMSAsync([phoneNumber], 'I need your help. This is an emergency.');
    } else {
      Alert.alert('SMS unavailable', 'Could not send SMS on this device');
    }
  };

  return (
    <View style={styles.bg}>
      <LinearGradient colors={['#0A0A14', '#0D0D1A']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
          <Ionicons name="add" size={22} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.contactCard}
            onPress={() => openModal(item)}
            onLongPress={() => confirmDelete(item.id)}
            delayLongPress={600}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
              <Text style={styles.contactRelation}>{item.relation}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionBtn, { borderColor: '#60A5FA44', backgroundColor: '#60A5FA22' }]} onPress={() => handleSMS(item.phone)}>
                <Ionicons name="chatbubble" size={18} color="#60A5FA" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${item.phone}`)}>
                <Ionicons name="call" size={18} color="#4ADE80" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#444" />
            <Text style={styles.emptyText}>No contacts added yet</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingContact ? 'Edit Contact' : 'Add Contact'}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Relation (e.g. Parent, Friend)"
              placeholderTextColor="#888"
              value={relation}
              onChangeText={setRelation}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveContact}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0A0A14' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6C63FF22', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#6C63FF44',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  list: { paddingHorizontal: 20, gap: 12, paddingBottom: 40 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132A', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#2A2A3C',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#6C63FF33', alignItems: 'center', justifyContent: 'center',
    marginRight: 14, borderWidth: 1.5, borderColor: '#6C63FF55',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#A78BFA' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  contactPhone: { fontSize: 13, color: '#888', marginTop: 2 },
  contactRelation: {
    fontSize: 11, color: '#6C63FF', fontWeight: '600',
    marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#4ADE8022', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#4ADE8044',
  },
  emptyContainer: { alignItems: 'center', marginTop: 80, gap: 12 },
  emptyText: { color: '#444', fontSize: 16 },
  
  // Modal styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: {
    backgroundColor: '#13132A', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#2A2A3C',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 15, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A2A3C',
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#2A2A3C' },
  cancelBtnText: { color: '#fff', fontWeight: '600' },
  saveBtn: { backgroundColor: '#6C63FF' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
});

export default ContactsScreen;
