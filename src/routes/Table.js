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
  deleteDoc,
  doc,
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { useState } from 'react';
import { auth, converter, db } from '../utils/firebase';
import { bettingRoundsIndexToNameMap } from '../utils/constants';

export async function loader({ params }) {
  return params.id;
}
function Table() {
  const id = useLoaderData();
  const [bet, setBet] = useState(0);
  const [action, setAction] = useState('');
  const currentPlayerRef = doc(db, 'players', id + auth.currentUser.uid);
  const [currentPlayer, isCurrentPlayerLoading] =
    useDocumentData(currentPlayerRef);

  const tableRef = doc(db, 'tables', id);
  const [table, isTableLoading] = useDocumentData(tableRef);

  const playersQuery = query(
    collection(db, 'players').withConverter(converter),
    where('tableId', '==', `tables/${id}`),
    where('didFold', '==', false),
  );
  const [players, isLoadingPlayers] = useCollectionData(playersQuery);

  const actionsQuery = query(
    collection(db, 'actions').withConverter(converter),
    orderBy('createdAt', 'asc'),
    limit(25),
    where('tableId', '==', `tables/${id}`),
  );
  const [actions, isLoadingActions] = useCollectionData(actionsQuery);

  const handleBetChange = (e) => {
    const betVal = e.target.value.replace(/\D/g, '');

    setBet(betVal);
  };
  const handleAction = async (e) => {
    e.preventDefault();
    if (players[table.turn].uid === currentPlayer.uid)
      if (!currentPlayer.didFold) {
        if (bet !== '') {
          let betNum = Number(bet);
          if (
            action === 'check' ||
            action === 'fold' ||
            (action === 'call' &&
              table.highestBet &&
              currentPlayer.bankroll >= table.highestBet) ||
            (action === 'bet' &&
              betNum !== 0 &&
              currentPlayer.bankroll >= betNum &&
              (typeof table.highestBet === 'undefined' ||
                table.highestBet <= betNum))
          ) {
            await addDoc(collection(db, 'actions'), {
              type: action,
              ...(action === 'bet' && { bet: betNum }),
              tableId: `tables/${id}`,
              playerName: auth.currentUser.displayName,
              createdAt: serverTimestamp(),
            });

            if (action === 'fold')
              await updateDoc(currentPlayerRef, {
                didFold: true,
              });

            if (
              action === 'bet' ||
              (action === 'call' &&
                currentPlayer.chipsInvestedInRound !==
                  table.highestChipsInvested)
            ) {
              if (action === 'call')
                betNum =
                  table.highestChipsInvested -
                  currentPlayer.chipsInvestedInRound;
              await updateDoc(tableRef, {
                ...(action === 'bet' && {
                  highestBet: betNum,
                  highestChipsInvested:
                    currentPlayer.highestChipsInvestedInRound || betNum,
                }),
                pot: increment(betNum),
              });
              await updateDoc(currentPlayerRef, {
                bankroll: increment(-betNum),
                chipsInvestedInRound: increment(betNum),
              });
            }

            const { turn } = table;
            let bettingRoundIndex = 0;
            if (turn === players.length - 1) {
              if (
                players[turn].chipsInvestedInRound ===
                players[0].chipsInvestedInRound
              ) {
                bettingRoundIndex += 1;
                const batch = writeBatch(db);
                players.forEach((p) =>
                  batch.update(doc(db, 'players', p.id), {
                    didFold: false,
                    chipsInvestedInRound: 0,
                  }),
                );
                batch.commit();
              }
              await updateDoc(tableRef, {
                turn: 0,
                bettingRoundIndex,
              });
            } else {
              await updateDoc(tableRef, {
                turn: increment(1),
              });
            }
          }
        }
      }
  };

  const removePlayer = (playerId) => {
    deleteDoc(doc(db, 'players', playerId));
  };
  if (!isCurrentPlayerLoading) {
    return (
      <div>
        <h2>Pot: {!isTableLoading && table.pot}</h2>
        <h3>
          {!isTableLoading &&
            bettingRoundsIndexToNameMap[table.bettingRoundIndex]}
        </h3>
        <ol className="players">
          {!isLoadingPlayers &&
            players.map((player, index) => (
              <li
                key={player.id}
                className={`${player.didFold ? 'player-fold' : ''} ${
                  index === table.turn ? 'player-turn' : ''
                } `}
              >
                <div className="profile">
                  <img
                    className="avatar"
                    referrerPolicy="no-referrer"
                    src={
                      player.photoURL ||
                      `https://www.metal-archives.com/images/cats/${Math.floor(
                        Math.random() * 100,
                      )}.jpg`
                    }
                    alt={`${player.name} avatar`}
                  />
                  <b>{player.name}</b>
                </div>
                <ul>
                  <li>bankroll: {player.bankroll}</li>
                  <li>
                    chips invested in this round: {player.chipsInvestedInRound}
                  </li>
                </ul>
                {currentPlayer.admin && !player.admin && (
                  <button type="button" onClick={() => removePlayer(player.id)}>
                    remove
                  </button>
                )}
              </li>
            ))}
        </ol>
        <ul>
          {!isLoadingActions &&
            actions.map((a) => (
              <li key={a.id} className="profile">
                <b>{a.playerName}</b> {a.type} {a.bet}
              </li>
            ))}
        </ul>
        {console.log(players)}
        <form onSubmit={(e) => handleAction(e)}>
          <fieldset
            disabled={
              currentPlayer.didFold
              // ||
              // players[table.turn].uid !== currentPlayer.uid
            }
          >
            <label htmlFor="bet">
              <input
                type="text"
                id="bet"
                name="bet"
                value={bet}
                onChange={handleBetChange}
              />
            </label>
            <button type="submit" onClick={() => setAction('bet')}>
              Bet
            </button>
            <button type="submit" onClick={() => setAction('fold')}>
              Fold
            </button>
            <button type="submit" onClick={() => setAction('call')}>
              Call
            </button>
            <button type="submit" onClick={() => setAction('check')}>
              check
            </button>
          </fieldset>
        </form>
      </div>
    );
  }
  return <>Loading</>;
}

export default Table;
