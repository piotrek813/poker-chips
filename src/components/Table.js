import { addDoc, collection, query } from 'firebase/firestore';
import { Fragment } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, converter, db } from '../utils/firebase';

function Table() {
  const betsCollectionRef = collection(db, 'bets').withConverter(converter);
  const q = query(betsCollectionRef);
  const [values, loading, error] = useCollectionData(q);
  console.log(values);

  const joinTable = async () => {
    await addDoc(collection(db, 'players'), {
      uid: auth.currentUser.uid,
      name: auth.currentUser.displayName,
    });
  };

  return (
    <div>
      <p>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>loading...</span>}
        <button type="button" onClick={joinTable}>
          Join table
        </button>
      </p>
    </div>
  );
}

export default Table;
