import { useState } from 'react';
import styled, { css } from 'styled-components';
import Button from './Button';

function SelectPlayers({ players, selectedPlayers, selectPlayer, closeModal }) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  return (
    <>
      <Modal>
        <Heading>Decide the winner(s)</Heading>
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

        <Button type="button" onClick={() => setShowConfirmationModal(true)}>
          Confirm
        </Button>
      </Modal>
      {showConfirmationModal && (
        <Modal>
          <h3>Are you sure?</h3>
          <ButtonsGroup>
            <Button
              type="button"
              size="medium"
              variant="secondary"
              onClick={() => setShowConfirmationModal(false)}
            >
              No
            </Button>
            <Button type="button" size="medium" onClick={closeModal}>
              Yes
            </Button>
          </ButtonsGroup>
        </Modal>
      )}
    </>
  );
}

const ButtonsGroup = styled.div`
  display: flex;
  gap: 17px;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  column-gap: 20px;
  align-items: center;
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--c-dark-1);
`;

const Heading = styled.h1`
  text-align: center;
`;

const PlayerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(auto, 100px));
  grid-gap: 20px;
`;

const Player = styled.img`
  cursor: pointer;
  width: 100%;
  ${({ $selected }) => $selected && 'border-radius: 50%;'}
`;

export default SelectPlayers;
