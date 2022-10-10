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
import { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { auth, converter, db } from '../utils/firebase';
import { bettingRoundsIndexToNameMap } from '../utils/constants';
import SelectPlayers from '../components/SelectPlayers';
import Input from '../components/Input';
import Button from '../components/Button';
import Lobby from '../components/Lobby';
import Spinner from '../components/Spinner';
import { ReactComponent as Logo } from '../images/logo.svg';
import { ReactComponent as Spade } from '../images/spade.svg';

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
      <Table>
        <StyledLogo />
        {players.map((p) => (
          <PlayerOuter key={p.id}>
            <PlayerInner>
              <Avatar src={p.photoURL} alt={`${p.displayName} avatar`} />
              <Bankroll>{p.bankroll}</Bankroll>
            </PlayerInner>
            <ChipOuter>
              <Chip>
                <Spade />
              </Chip>
              {p.chipsInvestedInRound}
            </ChipOuter>
          </PlayerOuter>
        ))}
      </Table>

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

const Table = styled.div`
  background: #68bc5b;
  height: 293px;
  border-radius: 28px;
  border: 8px solid #7b543f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const StyledLogo = styled(Logo)`
  width: 41%;
  opacity: 12%;
  & path {
    fill: #edf8eb;
  }
`;

const PlayerOuter = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 10px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateY(40%);
`;

const PlayerInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ChipOuter = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
  column-gap: 4px;
`;

const Chip = styled.div`
  background-color: #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #5b5bbc;
`;

const Avatar = styled.img`
  width: 44px;
  border-radius: 50%;
`;

const Bankroll = styled.span`
  font-size: 14px;
  background: #b5724e;
  border-radius: 4px;
  line-height: 21px;
  padding: 1px 11px;
  margin-top: -11px;
`;

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

export default tableRoute;
