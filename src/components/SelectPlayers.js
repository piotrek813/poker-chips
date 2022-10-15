import styled from 'styled-components';
import Button from './Button';

function SelectPlayers({ players, selectedPlayers, selectPlayer, closeModal }) {
  return (
    <Modal>
      <PlayerGrid>
        {players.map((p) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <Player
            key={`${p.id}select`}
            src={p.photoURL}
            alt={p.disaplayName}
            onClick={() => selectPlayer(p)}
            $selected={selectedPlayers.some((e) => e.id === p.id)}
            referrerPolicy="no-referrer"
          />
        ))}
      </PlayerGrid>

      <Button type="button" onClick={closeModal}>
        M&apos;key
      </Button>
    </Modal>
  );
}

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  column-gap: 20px;
  align-items: center;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #8a8aa6;
  padding: 20vw;
`;

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-gap: 20px;
`;

const Player = styled.img`
  cursor: pointer;
  width: 100%;
  ${({ $selected }) => $selected && 'border-radius: 50%;'}
`;

export default SelectPlayers;
