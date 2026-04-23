import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, onSnapshot } from 'firebase/firestore';

export const getContactsCollection = (userId) => {
  if (!userId) throw new Error('User ID is required');
  return collection(db, 'users', userId, 'contacts');
};

export const addContact = async (userId, contactData) => {
  return await addDoc(getContactsCollection(userId), contactData);
};

export const updateContact = async (userId, contactId, contactData) => {
  const contactRef = doc(db, 'users', userId, 'contacts', contactId);
  return await updateDoc(contactRef, contactData);
};

export const deleteContact = async (userId, contactId) => {
  const contactRef = doc(db, 'users', userId, 'contacts', contactId);
  return await deleteDoc(contactRef);
};

export const fetchContacts = async (userId) => {
  if (!userId) return [];
  const snapshot = await getDocs(query(getContactsCollection(userId)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToContacts = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(getContactsCollection(userId));
  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(contacts);
  });
};
