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
import styled, { css } from 'styled-components';
import { auth, converter, db } from '../utils/firebase';
import { bettingRoundsIndexToNameMap } from '../utils/constants';
import SelectPlayers from '../components/SelectPlayers';
import Input from '../components/Input';
import Button from '../components/Button';
import Lobby from '../components/Lobby';
import Spinner from '../components/Spinner';

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

    if (updatedPlayer.didFold) setIsNewHand(true);
  };

  const selectPlayer = (player) => {
    if (selectedPlayers.some((p) => p.id === player.id))
      setSelectedPlayers((current) =>
        current.filter((p) => p.id !== player.id),
      );
    else setSelectedPlayers((current) => [...current, player]);
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

    setSelectedPlayers([]);
  };

  if (isTableLoading || isCurrentPlayerLoading || arePlayersLoading)
    return <Spinner autoHeight />;
  if (!table.didStart)
    return (
      <Lobby
        tableId={tableRef.id}
        isAdmin={currentPlayer.isAdmin}
        playersWaiting={allPlayers.length}
      />
    );
  if (typeof currentPlayer === 'undefined')
    return <h1>You don&apos;t have access to this table</h1>;

  return (
    <>
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
      <List className="players">
        {players.map((player, index) => (
          <Player key={player.id} $isTurn={index === table.turn}>
            <PlayerPicture
              referrerPolicy="no-referrer"
              src={
                player.photoURL ||
                `https://www.metal-archives.com/images/cats/${Math.floor(
                  Math.random() * 100,
                )}.jpg`
              }
              alt={`${player.name} avatar`}
            />
            <div>
              <h4>{player.name}</h4>
              <p>bankroll: {player.bankroll}</p>
              <p>chips invested in this round: {player.chipsInvestedInRound}</p>
            </div>
          </Player>
        ))}
      </List>
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
          <Fieldset
            disabled={
              currentPlayer.didFold ||
              players[table.turn].uid !== currentPlayer.uid
            }
          >
            <Label htmlFor="bet">
              Your Bet
              <Input
                type="text"
                id="bet"
                name="bet"
                value={bet}
                onChange={handleBetChange}
              />
            </Label>
            <ButtonsGrid>
              <Button type="submit" onClick={() => setAction('bet')}>
                Bet
              </Button>
              <Button type="submit" onClick={() => setAction('fold')}>
                Fold
              </Button>
              <Button type="submit" onClick={() => setAction('call')}>
                Call
              </Button>
              <Button type="submit" onClick={() => setAction('check')}>
                check
              </Button>
            </ButtonsGrid>
          </Fieldset>
        </form>
      )}
    </>
  );
}

const Label = styled.label`
  font-size: 20px;
`;

const Fieldset = styled.fieldset`
  display: contents;
`;

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 2;
  grid-column-gap: 20px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const Player = styled.li`
  display: grid;
  grid-template-columns: 50px 1fr;
  grid-gap: 20px;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;

  & h4 {
    margin: 0 0 3px 0;
  }
  & p {
    margin: 0 0 4px 0;
  }
  ${({ $isTurn }) =>
    $isTurn &&
    css`
      border-radius: 50px;
      background: #4b4b5a;
      box-shadow: 20px 20px 60px #40404d, -20px -20px 60px #565668;
    `}
`;

const PlayerPicture = styled.img`
  width: 100%;
  border-radius: 50%;
`;

export default Table;
