import PropTypes from 'prop-types';
import styled from 'styled-components';
import Center from '../layouts/Center';
import Button from './Button';
import { startGame } from '../utils/firebase';

function Lobby({ tableId, isAdmin, playersWaiting }) {
  return (
    <Center>
      <Heading>Players waiting...</Heading>
      <Number>{playersWaiting}</Number>
      {isAdmin && (
        <Button
          type="button"
          onClick={() => startGame(tableId, playersWaiting)}
        >
          Start game
        </Button>
      )}
    </Center>
  );
}

const Heading = styled.h1`
  font-size: var(--font-size-heading-medium);
  color: var(--c-white-1);
`;

const Number = styled.span`
  font-size: 254px;
  color: var(--c-red-1);
`;

Lobby.propTypes = {
  tableId: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  playersWaiting: PropTypes.number.isRequired,
};

export default Lobby;
