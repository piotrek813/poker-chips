import { useLoaderData } from 'react-router-dom';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {
  collection,
  query,
  where,
  limit,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { auth, converter, db } from '../utils/firebase';
import { bettingRoundsIndexToNameMap } from '../utils/constants';
import SelectPlayers from '../components/SelectPlayers';

export async function loader({ params }) {
  return params.id;
}
function Table() {
  const id = useLoaderData();
  const [isNewHand, setIsNewHand] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [bet, setBet] = useState(0);
  const [action, setAction] = useState('');
  const currentPlayerRef = doc(db, 'players', id + auth.currentUser.uid);
  const [currentPlayer, isCurrentPlayerLoading] =
    useDocumentData(currentPlayerRef);

  const tableRef = doc(db, 'tables', id);
  const [table, isTableLoading] = useDocumentData(tableRef);

  const playersQuery = query(
    collection(db, 'players').withConverter(converter),
    orderBy('createdAt', 'asc'),
    where('tableId', '==', `tables/${id}`),
  );
  const [allPlayers, arePlayersLoading] = useCollectionData(playersQuery);
  const players = useMemo(
    () => (arePlayersLoading ? [] : allPlayers.filter((p) => !p.didFold)),
    [allPlayers],
  );

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
    let isNewRound = false;
    if (players.length === 1) setIsNewHand(true);
    else if (players[table.turn].uid !== currentPlayer.uid) return;
    if (currentPlayer.didFold) return;
    if (bet === '') return;
    const betNum =
      action === 'bet'
        ? Number(bet)
        : table.highestChipsInvested - currentPlayer.chipsInvestedInRound;
    const updatedPlayer = currentPlayer;
    const updatedTable = table;
    switch (action) {
      case 'fold':
        updatedPlayer.didFold = true;
        break;
      case 'bet':
      case 'call':
        if (betNum === 0) return;
        if (currentPlayer.bankroll <= betNum) return;
        if (action === 'bet' && table.highestBet > betNum) return;
        updatedPlayer.bankroll -= betNum;
        updatedPlayer.chipsInvestedInRound += betNum;
        updatedTable.pot += betNum;
        if (action === 'bet') {
          updatedTable.highestBet = betNum;
          updatedTable.highestChipsInvested =
            updatedPlayer.chipsInvestedInRound;
        }
        break;
      case 'check':
        if (table.highestChipsInvested !== currentPlayer.chipsInvestedInRound)
          return;
        break;
      default:
        break;
    }

    if (table.turn === players.length - 1) {
      updatedTable.turn = 0;
      if (
        updatedPlayer.chipsInvestedInRound === players[0].chipsInvestedInRound
      ) {
        if (table.bettingRoundIndex === 3) setIsNewHand(true);
        else {
          // new betting round
          updatedTable.bettingRoundIndex += 1;
          updatedTable.highestBet = 0;
          updatedTable.highestChipsInvested = 0;
          isNewRound = true;
        }
      }
    } else if (!updatedPlayer.didFold) updatedTable.turn += 1;

    await updateDoc(tableRef, updatedTable);
    await updateDoc(currentPlayerRef, updatedPlayer);
    if (isNewRound) {
      const batch = writeBatch(db);
      players.forEach((p) =>
        batch.update(doc(db, 'players', p.id), { chipsInvestedInRound: 0 }),
      );
      await batch.commit();
    }
  };

  const selectPlayer = (player) => {
    if (selectedPlayers.some((p) => p.id === player.id))
      setSelectedPlayers((current) =>
        current.filter((p) => p.id !== player.id),
      );
    else setSelectedPlayers((current) => [...current, player]);
  };

  const removePlayer = (playerId) => {
    deleteDoc(doc(db, 'players', playerId));
  };

  const closeSelectPlayers = async () => {
    if (selectedPlayers.length === 0) return;
    setIsNewHand(false);
    const batch = writeBatch(db);
    allPlayers.forEach((p) =>
      batch.update(doc(db, 'players', p.id), {
        ...(selectedPlayers.some((s) => s.id === p.id) && {
          bankroll: increment(Math.floor(table.pot / selectedPlayers.length)),
        }),
        didFold: false,
        chipsInvestedInRound: 0,
      }),
    );
    await batch.commit();
    await updateDoc(tableRef, {
      bettingRoundIndex: 0,
      highestBet: 0,
      highestChipsInvested: 0,
      pot: 0,
    });
  };

  if (typeof currentPlayer === 'undefined')
    return <h1>You don&apos;t have access to this table</h1>;
  if (!isCurrentPlayerLoading && !isTableLoading && !arePlayersLoading) {
    return (
      <div>
        {isNewHand && (
          <SelectPlayers
            players={players}
            selectedPlayers={selectedPlayers}
            selectPlayer={selectPlayer}
            closeModal={closeSelectPlayers}
          />
        )}
        <h2>Pot: {table.pot}</h2>
        <h2>Turn: {table.turn}</h2>
        <h3>{bettingRoundsIndexToNameMap[table.bettingRoundIndex]}</h3>
        <ol className="players">
          {players.map((player, index) => (
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
              {currentPlayer.isAdmin && !player.isAdmin && (
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
        {players.length !== 0 && (
          <form onSubmit={(e) => handleAction(e)}>
            <fieldset
              disabled={
                currentPlayer.didFold ||
                players[table.turn].uid !== currentPlayer.uid
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
        )}
      </div>
    );
  }
  return <>Loading</>;
}

export default Table;
