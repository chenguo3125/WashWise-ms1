import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LaundryTimer() {
  const [duration, setDuration] = useState(0);        // selected duration in seconds
  const [secondsLeft, setSecondsLeft] = useState(0);  // countdown state
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  const presetTimes = [30, 45, 60]; // in minutes

  const startTimer = () => {
    if (duration > 0) {
      setSecondsLeft(duration);
      setIsRunning(true);
      setFinished(false);
    }
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setFinished(false);
    setDuration(0);
    setSecondsLeft(0);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // UI: Timer completed
  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.doneText}>🎉 Laundry Done!</Text>
        <TouchableOpacity style={styles.collectButton} onPress={resetTimer}>
          <Text style={styles.buttonText}>Collect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // UI: Timer running
  if (isRunning) {
    return (
      <View style={styles.container}>
        <Text style={styles.timerText}>⏳ Time Left: {formatTime(secondsLeft)}</Text>
      </View>
    );
  }

  // UI: Time selection
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Timer:</Text>
      <View style={styles.options}>
        {presetTimes.map(mins => (
          <TouchableOpacity
            key={mins}
            style={[styles.optionButton, duration === mins * 60 && styles.optionSelected]}
            onPress={() => setDuration(mins * 60)}
          >
            <Text style={styles.optionText}>{mins} min</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.startButton, duration === 0 && { backgroundColor: 'gray' }]}
        onPress={startTimer}
        disabled={duration === 0}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 18, fontWeight: '500', marginBottom: 10 },
  options: { flexDirection: 'row', marginBottom: 20 },
  optionButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  optionSelected: {
    backgroundColor: '#007bff',
  },
  optionText: {
    color: '#fff',
    fontWeight: '600',
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: '#28a745',
    borderRadius: 10,
  },
  collectButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: '#007bff',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  timerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
});
