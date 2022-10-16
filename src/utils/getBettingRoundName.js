const bettingRoundsIndexToNameMap = Object.freeze({
  0: 'Pre-flop',
  1: 'Flop',
  2: 'Turn',
  3: 'River',
});
export default (index) => bettingRoundsIndexToNameMap[index];
