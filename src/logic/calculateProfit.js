export default (allPlayers, selectedPlayers) => {
  if (typeof allPlayers === 'undefined') return allPlayers;
  if (typeof selectedPlayers === 'undefined') return selectedPlayers;

  const sidePots = [];
  const playersContribution = allPlayers.map((p) => p.totalContribution);

  const profitingPlayers = selectedPlayers.sort(
    (a, b) => a.totalContribution - b.totalContribution,
  );

  for (let i = 0; i < profitingPlayers.length; i += 1) {
    sidePots.push(0);
    const sum = profitingPlayers.slice(0, i).reduce((acc, cur) => {
      return cur.totalContribution + acc;
    }, 0);
    for (let j = 0; j < playersContribution.length; j += 1) {
      const totalContribution = profitingPlayers[i].totalContribution - sum;
      const amountToSubtract =
        playersContribution[j] - totalContribution < 0
          ? playersContribution[j]
          : totalContribution;
      sidePots[i] += amountToSubtract;
      playersContribution[j] -= amountToSubtract;
    }
  }

  for (let i = 0; i < sidePots.length; i += 1) {
    const sidePot = sidePots[i];
    for (let j = 0; j < allPlayers.length; j += 1) {
      if (profitingPlayers.some((s) => s.id === allPlayers[j].id))
        playersContribution[j] += sidePot / profitingPlayers.length;
    }
    profitingPlayers.shift();
  }
  return playersContribution;
};
