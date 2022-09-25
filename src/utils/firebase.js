import { initializeApp } from 'firebase/app';
import {
  collection,
  getFirestore,
  query,
  limit,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export default app;
export const db = getFirestore(app);
export const auth = getAuth(app);
export const converter = {
  toFirestore: (data) => data,
  fromFirestore: (snap) => ({
    id: snap.id,
    ...snap.data(),
  }),
};
export const generateTableId = async () => {
  const formatId = (id) => String(id).padStart(4, 0);

  const q = query(
    collection(db, 'tables'),
    orderBy('createdAt', 'desc'),
    limit(1),
  );
  const tableSnap = await getDocs(q);
  if (tableSnap.docs.length === 0) return formatId(0);
  const id = Number(tableSnap.docs[0].id);
  return Number.isNaN(id) ? null : formatId(id + 1);
};
