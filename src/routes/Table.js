import { useLoaderData } from 'react-router-dom';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {
  addDoc,
  collection,
  query,
  where,
  limit,
  serverTimestamp,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { useState } from 'react';
import { auth, converter, db } from '../utils/firebase';
import Input from '../components/Input';

export async function loader({ params }) {
  return params.id;
}
function Table() {
  const id = useLoaderData();
  const [action, setAction] = useState('');

  const handleAction = async (a) => {
    addDoc(collection(db, 'actions'), {
      type: a,
      tableId: `tables/${id}`,
      playerName: auth.currentUser.displayName,
      createdAt: serverTimestamp(),
    });
  };

  const playersQuery = query(
    collection(db, 'players'),
    where('tableId', '==', `tables/${id}`),
  );
  const [players, isLoadingPlayers] = useCollectionData(playersQuery);

  const actionsQuery = query(
    collection(db, 'actions').withConverter(converter),
    orderBy('createdAt', 'asc'),
    limit(25),
    where('tableId', '==', `tables/${id}`),
  );
  const [actions, isLoadingActions] = useCollectionData(actionsQuery);
  return (
    <div>
      <ol>
        {!isLoadingPlayers &&
          players.map((player) => (
            <li key={player.uid} className="profile">
              <img
                className="avatar"
                src={
                  player.photoURL ||
                  `https://www.metal-archives.com/images/cats/${Math.floor(
                    Math.random() * 100,
                  )}.jpg`
                }
                alt={`${player.name} avatar`}
              />
              <b>{player.name}</b>
            </li>
          ))}
      </ol>
      <ul>
        {!isLoadingActions &&
          actions.map((a) => (
            <li key={a.id} className="profile">
              <b>{a.playerName}</b> {a.type}
            </li>
          ))}
      </ul>
      <form onSubmit={handleAction}>
        <Input id="bet-value" />
        <button type="submit" onClick={() => setAction('bet')}>
          Bet
        </button>
        <button type="submit" onClick={() => setAction('fold')}>
          Fold
        </button>
        <button type="submit" onClick={() => setAction('call')}>
          Call
        </button>
      </form>
    </div>
  );
}

export default Table;
