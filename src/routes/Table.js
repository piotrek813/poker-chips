import { useLoaderData } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../utils/firebase';

export async function loader({ params }) {
  return params.id;
}
function Table() {
  const id = useLoaderData();
  const [players, setPlayers] = useState([]);
  const [value, loading, error] = useDocumentData(doc(db, 'tables', id));
  useEffect(() => {
    if (value) {
      const getPlayers = async () => {
        const data = await Promise.all(
          value.players.map(async (playerRef) => {
            const playerSnap = await getDoc(doc(db, playerRef));
            return playerSnap.data();
          }),
        );
        setPlayers(data);
      };

      getPlayers();
    }
  }, [value]);

  if (loading) {
    return (
      <div>
        <p>Initialising User...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }
  return (
    <div>
      <ol>
        {players.map((player) => (
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
    </div>
  );
}

export default Table;
