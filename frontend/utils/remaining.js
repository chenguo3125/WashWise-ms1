function calculateRemainingTime(endTime, now = Date.now()) {
  return Math.max(0, Math.floor((endTime - now) / 1000));
}

module.exports = { calculateRemainingTime };
