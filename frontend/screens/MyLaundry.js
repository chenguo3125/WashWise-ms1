import { useRouter } from 'expo-router';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebaseConfig';

export default function MyLaundry() {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [duration, setDuration] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);
  const router = useRouter();

  const presetTimes = [30, 45, 60]; // in minutes

  useEffect(() => {
    const fetchMachines = async () => {
      const snapshot = await getDocs(collection(db, 'machines'));
      const availability = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(machine => machine.availability === true);
      setMachines(availability);
    };

    fetchMachines();
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setFinished(true);
            updateMachineAvailability(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const updateMachineAvailability = async (status) => {
    if (!selectedMachine) return;
    await updateDoc(doc(db, 'machines', selectedMachine.id), { available: status });
  };

  const startLaundry = async () => {
    if (!selectedMachine || selectedMachine.availability !== true || duration === 0) {
      Alert.alert('Error', 'Please select an available machine and duration.');
      return;
    }

    await updateMachineAvailability(false);
    setSecondsLeft(duration);
    setIsRunning(true);
    setFinished(false);
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleCollect = () => {
    setSelectedMachine(null);
    setDuration(0);
    setFinished(false);
    setSecondsLeft(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧼 Start Your Laundry</Text>

      {!isRunning && !finished && (
        <>
          <Text style={styles.subheading}>Select an Available Machine:</Text>
          <FlatList
            data={machines}
            keyExtractor={(item) => item.id}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.machineCard,
                  selectedMachine?.id === item.id && styles.selectedCard
                ]}
                onPress={() => setSelectedMachine(item)}
              >
                <Text style={styles.machineText}>{item.type} @ {item.location}</Text>
              </TouchableOpacity>
            )}
          />

          <Text style={styles.subheading}>Select Duration:</Text>
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

          <TouchableOpacity style={styles.startButton} onPress={startLaundry}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </>
      )}

      {isRunning && (
        <Text style={styles.timerText}>⏳ Time Left: {formatTime(secondsLeft)}</Text>
      )}

      {finished && (
        <>
          <Text style={styles.doneText}>🎉 Laundry Done!</Text>
          <TouchableOpacity style={styles.collectButton} onPress={handleCollect}>
            <Text style={styles.buttonText}>Collect</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.backHint} onPress={() => router.back()}>
        ← Back to Home
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  subheading: { fontSize: 18, fontWeight: '500', marginVertical: 10 },
  machineCard: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  selectedCard: {
    backgroundColor: '#007bff',
  },
  machineText: {
    color: 'white',
    fontWeight: '600',
  },
  options: { flexDirection: 'row', marginVertical: 20 },
  optionButton: {
    backgroundColor: '#bbb',
    padding: 10,
    borderRadius: 10,
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
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  collectButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
  timerText: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 40 },
  doneText: { fontSize: 22, textAlign: 'center', marginTop: 40, fontWeight: '600' },
});
