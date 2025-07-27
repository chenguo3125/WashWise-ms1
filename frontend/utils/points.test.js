const { calculatePoints } = require('./points');

test('on-time collection gets 50 points', () => {
  expect(calculatePoints(0)).toBe(50);
});

test('7.5 mins late gives 25 points', () => {
  expect(calculatePoints(7.5)).toBe(25);
});

test('15 mins late gives 0 points', () => {
  expect(calculatePoints(15)).toBe(0);
});

test('more than 15 mins late gets 0 points', () => {
  expect(calculatePoints(16)).toBe(0);
});

test('negative lateness gives 0 points', () => {
  expect(calculatePoints(-5)).toBe(0);
});
