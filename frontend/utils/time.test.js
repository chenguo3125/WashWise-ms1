const { formatTime } = require('./time');

test('formats 0 seconds as "Time is up!"', () => {
  expect(formatTime(0)).toBe('Time is up!');
});

test('formats 70 seconds as "01:10"', () => {
  expect(formatTime(70)).toBe('01:10');
});

test('formats 9 seconds as "00:09"', () => {
  expect(formatTime(9)).toBe('00:09');
});
