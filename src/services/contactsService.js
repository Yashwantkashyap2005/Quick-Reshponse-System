import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, onSnapshot } from 'firebase/firestore';

// Get a reference to the user's contacts collection
export const getContactsCollection = (userId) => {
  if (!userId) throw new Error('User ID is required');
  return collection(db, 'users', userId, 'contacts');
};

// Add a new contact
export const addContact = async (userId, contactData) => {
  return await addDoc(getContactsCollection(userId), contactData);
};

// Update an existing contact
export const updateContact = async (userId, contactId, contactData) => {
  const contactRef = doc(db, 'users', userId, 'contacts', contactId);
  return await updateDoc(contactRef, contactData);
};

// Delete a contact
export const deleteContact = async (userId, contactId) => {
  const contactRef = doc(db, 'users', userId, 'contacts', contactId);
  return await deleteDoc(contactRef);
};

// Fetch all contacts (one-time fetch)
export const fetchContacts = async (userId) => {
  if (!userId) return [];
  const snapshot = await getDocs(query(getContactsCollection(userId)));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Listen to contacts (real-time listener)
export const subscribeToContacts = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(getContactsCollection(userId));
  return onSnapshot(q, (snapshot) => {
    const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(contacts);
  });
};
