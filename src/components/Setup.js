import {
  doc,
  serverTimestamp,
  setDoc,
  addDoc,
  collection,
  arrayUnion,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { useState } from 'react';
import { auth, db, generateTableId } from '../utils/firebase';

function Setup() {
  const [tableId, setTableId] = useState('');

  const createTable = async () => {
    const id = await generateTableId();
    if (id !== null) {
      const playerRef = await addDoc(collection(db, 'players'), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        bankroll: 1000,
      });
      await setDoc(doc(db, 'tables', id), {
        createdAt: serverTimestamp(),
        buyIn: 1000,
        players: arrayUnion(`players/${playerRef.id}`),
      });
    }
  };

  const joinTable = async () => {
    const id = Number(tableId);
    if (!Number.isNaN(id)) {
      const playerRef = await addDoc(collection(db, 'players'), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        bankroll: 1000,
      });
      await updateDoc(doc(db, 'tables', tableId), {
        players: arrayUnion(`players/${playerRef.id}`),
      });
    }
  };

  return (
    <div>
      <button type="button" onClick={createTable}>
        Create Table
      </button>
      <input
        type="text"
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
      />
      <button type="button" onClick={joinTable}>
        Join Table
      </button>
    </div>
  );
}

export default Setup;
