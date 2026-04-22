import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

export const getAlertsCollection = (userId) => {
  if (!userId) throw new Error('User ID is required');
  return collection(db, 'users', userId, 'alerts');
};

export const addAlert = async (userId, alertData) => {
  // Add a timestamp so we can sort them
  const dataWithTime = {
    ...alertData,
    timestamp: new Date().toISOString(),
  };
  return await addDoc(getAlertsCollection(userId), dataWithTime);
};

export const subscribeToAlerts = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(getAlertsCollection(userId), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(alerts);
  });
};
