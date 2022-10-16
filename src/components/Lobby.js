import { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Center from '../layouts/Center';
import Button from './Button';
import { startGame } from '../utils/firebase';

function Lobby({ tableId, isAdmin, playersWaiting }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `https://chips.webarts.pl/join/${tableId}`,
      );
      setIsCopied(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  console.log(navigator, navigator.clipboard);
  return (
    <Center>
      <Heading>Players waiting...</Heading>
      <Number>{playersWaiting}</Number>
      {isAdmin && (
        <Button
          type="button"
          onClick={() => startGame(tableId, playersWaiting)}
          fullWidth
        >
          Start game
        </Button>
      )}
      {navigator.clipboard && (
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={handleCopy}
          disabled={isCopied}
        >
          {!isCopied ? 'Copy Invitation' : 'Copied!'}
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
