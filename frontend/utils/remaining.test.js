const { calculateRemainingTime } = require('./remaining');

test('future endTime returns positive seconds', () => {
  const now = Date.now();
  const endTime = now + 120000; // 2 min
  expect(calculateRemainingTime(endTime, now)).toBe(120);
});

test('past endTime returns 0', () => {
  const now = Date.now();
  const endTime = now - 1000;
  expect(calculateRemainingTime(endTime, now)).toBe(0);
});
