import { collection } from 'firebase/firestore';
import { Fragment } from 'react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '../utils/firebase';

function Table() {
  const [value, loading, error] = useCollection(collection(db, 'bets'), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  return (
    <div>
      <p>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>loading...</span>}
        {value && (
          <span>
            {value.docs.map((doc) => (
              <Fragment key={doc.id}>{JSON.stringify(doc.data())}, </Fragment>
            ))}
          </span>
        )}
      </p>
    </div>
  );
}

export default Table;
