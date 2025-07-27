function calculatePoints(minutesLate) {
  if (minutesLate < 0) return 0;
  if (minutesLate > 15) return 0;
  return Math.round(50 * (1 - minutesLate / 15));
}

module.exports = { calculatePoints };
