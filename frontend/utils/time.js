function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return seconds === 0 ? `Time is up!` : `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

module.exports = { formatTime };
