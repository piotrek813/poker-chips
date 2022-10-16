import { useLoaderData } from 'react-router-dom';
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { auth, converter, db } from '../utils/firebase';
import Table from '../components/Table';
import SelectPlayers from '../components/SelectPlayers';
import Button from '../components/Button';
import Lobby from '../components/Lobby';
import Spinner from '../components/Spinner';
import getBettingRoundName from '../utils/getBettingRoundName';
import getNextPlayerIndex from '../logic/getNextPlayerIndex';
import calculateProfit from '../logic/calculateProfit';

export async function loader({ params }) {
  return params.id;
}
function tableRoute() {
  const id = useLoaderData();
  const [isNewHand, setIsNewHand] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [bet, setBet] = useState(0);
  const [action, setAction] = useState('');
  const currentPlayerRef = doc(db, 'players', id + auth.currentUser.uid);

  const tableRef = doc(db, 'tables', id);
  const [table, isTableLoading] = useDocumentData(tableRef);

  const playersQuery = query(
    collection(db, 'players').withConverter(converter),
    orderBy('createdAt', 'asc'),
    where('tableId', '==', `tables/${id}`),
  );
  const [allPlayers, arePlayersLoading] = useCollectionData(playersQuery);

  const currentPlayer = arePlayersLoading
    ? {}
    : allPlayers.find((p) => p.uid === auth.currentUser.uid);
  const players = arePlayersLoading ? [] : allPlayers.filter((p) => !p.didFold);

  const handleBetChange = (e) => {
    const betVal = e.target.value.replace(/\D/g, '');

    setBet(betVal);
  };

  const handleAction = async (e) => {
    e.preventDefault();
    let startNewRound = false;
    let startNewHand = false;
    if (table.turn === -1) return;
    if (players[table.turn].uid !== currentPlayer.uid) return;
    if (currentPlayer.didFold) return;
    if (bet === '') return;
    let betNum = 0;
    if (action === 'bet') betNum = Number(bet);
    else
      betNum = table.highestChipsInvested - currentPlayer.currentContribution;
    if (currentPlayer.bankroll < betNum) betNum = currentPlayer.bankroll;
    const updatedPlayer = currentPlayer;
    const updatedTable = table;
    switch (action) {
      case 'fold':
        updatedPlayer.didFold = true;
        break;
      case 'bet':
      case 'call':
        if (betNum === 0) return;
        if (currentPlayer.bankroll < betNum) return;
        if (action === 'bet' && table.highestBet > betNum) return;
        updatedPlayer.bankroll -= betNum;
        updatedPlayer.currentContribution += betNum;
        updatedPlayer.totalContribution += betNum;
        updatedTable.pot += betNum;
        if (action === 'bet') {
          updatedTable.highestBet = betNum;
          updatedTable.highestChipsInvested = updatedPlayer.currentContribution;
        }
        break;
      case 'check':
        if (currentPlayer.bankroll)
          if (table.highestChipsInvested !== currentPlayer.currentContribution)
            return;
        break;
      default:
        break;
    }

    let nextPlayer = getNextPlayerIndex(players, table.turn);
    if (nextPlayer === -1 || nextPlayer === table.turn) {
      nextPlayer = getNextPlayerIndex(allPlayers);
      startNewHand = true;
    } else if (
      nextPlayer < table.turn &&
      updatedPlayer.currentContribution ===
        players[nextPlayer].currentContribution
    ) {
      if (table.bettingRoundIndex === 3) startNewHand = true;
      else {
        updatedTable.bettingRoundIndex += 1;
        updatedTable.highestBet = 0;
        updatedTable.highestChipsInvested = 0;
        startNewRound = true;
      }
    }
    updatedTable.turn = nextPlayer;

    if (updatedPlayer.didFold && updatedTable.turn !== 0)
      updatedTable.turn -= 1;

    if (players.length === 2 && currentPlayer.didFold) startNewHand = true;

    await updateDoc(tableRef, updatedTable);
    await updateDoc(currentPlayerRef, updatedPlayer);
    if (startNewRound) {
      const batch = writeBatch(db);
      players.forEach((p) =>
        batch.update(doc(db, 'players', p.id), { currentContribution: 0 }),
      );
      await batch.commit();
    }
    if (startNewHand) setIsNewHand(true);
    setBet(0);
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

    await batch.commit();
    await updateDoc(tableRef, {
      bettingRoundIndex: 0,
      highestBet: 0,
      highestChipsInvested: 0,
      pot: 0,
    });

    setSelectedPlayers([]);
  };

  if (isTableLoading || arePlayersLoading) return <Spinner autoHeight />;
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

      <h1>{getBettingRoundName(table.bettingRoundIndex)}</h1>
      <Table players={players} />

      {players.length !== 0 && (
        <form onSubmit={(e) => handleAction(e)}>
          <Fieldset
            disabled={
              currentPlayer.didFold ||
              table.turn === -1 ||
              players[table.turn].uid !== currentPlayer.uid
            }
          >
            <BetInputContainer>
              <BetNumberInput
                type="number"
                id="bet"
                name="bet"
                value={bet}
                inputMode="numeric"
                min="0"
                max={`${currentPlayer.bankroll}`}
                onChange={handleBetChange}
              />
              <BetRangeInput
                type="range"
                name="bet"
                id="bet"
                min="0"
                step="1"
                max={`${currentPlayer.bankroll}`}
                value={bet}
                onChange={(e) => setBet(e.target.value)}
              />
            </BetInputContainer>
            <ButtonsGrid>
              <Button
                type="submit"
                size="medium"
                boxShadow
                variant="lightGrey"
                onClick={() => setAction('bet')}
              >
                Bet
              </Button>
              <Button
                type="submit"
                size="medium"
                boxShadow
                onClick={() => setAction('fold')}
              >
                Fold
              </Button>
              <Button
                type="submit"
                size="medium"
                boxShadow
                variant="lightGrey"
                onClick={() => setAction('call')}
              >
                Call
              </Button>
              <Button
                type="submit"
                size="medium"
                boxShadow
                variant="secondary"
                onClick={() => setAction('check')}
              >
                Check
              </Button>
            </ButtonsGrid>
          </Fieldset>
        </form>
      )}
    </>
  );
}

const Fieldset = styled.fieldset`
  border: none;
  padding: 0;

  &:disabled {
    opacity: 0.7;
  }
`;

const BetInputContainer = styled(Fieldset)`
  background: var(--c-grey-1);
  margin: 0;
  padding: 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  margin-bottom: 23px;
`;

const BetNumberInput = styled.input`
  appearance: textfield;
  margin: 0;
  margin: 0;
  display: inline-block;
  font-size: 14px;
  background: var(--c-dark-1);
  border: none;
  color: var(--c-white-3);
  padding: 8px 10px;
  border-radius: 5px;
  width: 50px;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    appearance: none;
  }
`;

const BetRangeInput = styled.input`
  cursor: ew-resize;
  width: 80%;
  appearance: none;
  background: transparent;

  &::-webkit-slider-runnable-track {
    height: 8px;
    background: var(--c-grey-2);
    border-radius: 8px;
  }
  &::-moz-range-track {
    height: 8px;
    background: var(--c-grey-2);
    border-radius: 8px;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    background: var(--c-purple-1);
    margin-top: -6px;
    height: 20px;
    width: 20px;
    border-radius: 50%;
  }

  &::-moz-range-thumb {
    border: none;
    border-radius: 50%;
    background: var(--c-purple-1);
    height: 20px;
    width: 20px;
  }
`;

const ButtonsGrid = styled(Fieldset)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 2;
  grid-gap: 14px;
`;

export default tableRoute;
