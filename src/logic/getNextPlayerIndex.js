/**
 * @param {Array} players
 * @param {number} turn - table.turn if not specified it's going to check every player
 */
export default (players, turn = -1) => {
  if (typeof players === 'undefined') return players;

  const remainingPlayers = players.slice(turn + 1);
  const nextPlayerInRemaingPlayers = remainingPlayers.findIndex(
    (p) => p.bankroll,
  );
  if (nextPlayerInRemaingPlayers >= 0)
    return nextPlayerInRemaingPlayers + turn + 1;
  return players.findIndex((p) => p.bankroll);
};
