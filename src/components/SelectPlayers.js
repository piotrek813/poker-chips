import styled from 'styled-components';
import Button from './Button';

function SelectPlayers({ players, selectedPlayers, selectPlayer, closeModal }) {
  return (
    <Modal>
      <div className="select-players">
        {players.map((p) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <Player
            key={`${p.id}select`}
            src={p.photoURL}
            alt={p.disaplayName}
            onClick={() => selectPlayer(p)}
            $selected={selectedPlayers.some((e) => e.id === p.id)}
          />
        ))}
      </div>

      <Button type="button" onClick={closeModal}>
        M&apos;key
      </Button>
    </Modal>
  );
}

const Modal = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: #8a8aa6;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Player = styled.img`
  ${({ $selected }) => $selected && 'border-radius: 50%;'}
`;

export default SelectPlayers;
