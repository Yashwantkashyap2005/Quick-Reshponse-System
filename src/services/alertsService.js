import { db } from './firebase';
import { collection, addDoc, doc, deleteDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

export const getAlertsCollection = (userId) => {
  if (!userId) throw new Error('User ID is required');
  return collection(db, 'users', userId, 'alerts');
};

export const addAlert = async (userId, alertData) => {
  const dataWithTime = {
    ...alertData,
    timestamp: new Date().toISOString(),
  };
  return await addDoc(getAlertsCollection(userId), dataWithTime);
};

export const deleteAlert = async (userId, alertId) => {
  const alertRef = doc(db, 'users', userId, 'alerts', alertId);
  return await deleteDoc(alertRef);
};

export const deleteAllAlerts = async (userId) => {
  const snapshot = await getDocs(getAlertsCollection(userId));
  const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
  return await Promise.all(deletePromises);
};

export const subscribeToAlerts = (userId, callback) => {
  if (!userId) return () => {};
  const q = query(getAlertsCollection(userId), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(alerts);
  });
};
