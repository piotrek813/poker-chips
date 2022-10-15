const bettingRoundsIndexToNameMap = Object.freeze({
  0: 'pre-flop',
  1: 'flop',
  2: 'turn',
  3: 'river',
});
export default (index) => bettingRoundsIndexToNameMap[index];
