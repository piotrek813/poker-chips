import { initializeApp } from 'firebase/app';
import {
  collection,
  getFirestore,
  query,
  limit,
  orderBy,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import calculateProfit from '../logic/calculateProfit';

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
const formatId = (id) => String(id).padStart(4, 0);
export const generateTableId = async () => {
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

const setPlayer = ({ bankroll, tableId, playerId, isAdmin }) =>
  setDoc(doc(db, 'players', playerId), {
    createdAt: serverTimestamp(),
    uid: auth.currentUser.uid,
    name: auth.currentUser.displayName,
    photoURL: auth.currentUser.photoURL,
    bankroll,
    tableId,
    isAdmin: typeof isAdmin === 'undefined' ? false : isAdmin,
    didFold: false,
    currentContribution: 0,
    totalContribution: 0,
  });

export const joinTable = async (id) => {
  let tableId = Number(id);
  if (!Number.isNaN(tableId)) {
    tableId = formatId(tableId);
    const tableRef = doc(db, 'tables', tableId);
    const tableSnap = await getDoc(tableRef);
    if (tableSnap.didStart) return undefined;
    const playerRef = doc(db, 'players', tableId + auth.currentUser.uid);
    const playerSnap = await getDoc(playerRef);
    if (!playerSnap.exists())
      await setPlayer({
        bankroll: tableSnap.data().buyIn,
        tableId: tableRef.path,
        playerId: tableId + auth.currentUser.uid,
      });

    return tableId;
  }
  return undefined;
};

export const createTable = async (buyIn) => {
  const id = await generateTableId();
  if (id !== null) {
    const tableRef = doc(db, 'tables', id);
    await setDoc(tableRef, {
      createdAt: serverTimestamp(),
      buyIn,
      pot: 0,
      turn: 0,
      bettingRoundIndex: 0,
      highestBet: 0,
      highestChipsInvested: 0,
      didStart: false,
    });
    await setPlayer({
      bankroll: buyIn,
      tableId: tableRef.path,
      playerId: id + auth.currentUser.uid,
      isAdmin: true,
    });
    return id;
  }
  return undefined;
};

export const startGame = async (tableId, playersWaiting) => {
  const player = await getDoc(
    doc(db, 'players', tableId + auth.currentUser.uid),
  );
  const playerSnap = player.data();
  if (
    playerSnap.tableId === `tables/${tableId}` &&
    playerSnap.isAdmin &&
    playersWaiting > 1
  )
    await updateDoc(doc(db, 'tables', tableId), { didStart: true });
};

export const triggerNewHand = async (allPlayers, selectedPlayers, tableRef) => {
  const allPlayersProfit = calculateProfit(allPlayers, selectedPlayers);

  const batch = writeBatch(db);
  allPlayers.forEach((p, i) =>
    batch.update(doc(db, 'players', p.id), {
      bankroll: increment(allPlayersProfit[i]),
      didFold: false,
      currentContribution: 0,
      totalContribution: 0,
    }),
  );
  batch.update(tableRef, {
    bettingRoundIndex: 0,
    highestBet: 0,
    highestChipsInvested: 0,
    pot: 0,
  });

  await batch.commit();
};
