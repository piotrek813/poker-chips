export default (players, turn) => {
  if (typeof players === 'undefined') return players;
  if (typeof turn === 'undefined') return turn;

  const remainingPlayers = players.slice(turn + 1);
  const nextPlayerInRemaingPlayers = remainingPlayers.findIndex(
    (p) => p.bankroll,
  );
  if (nextPlayerInRemaingPlayers >= 0)
    return nextPlayerInRemaingPlayers + turn + 1;
  return players.findIndex((p) => p.bankroll);
};
