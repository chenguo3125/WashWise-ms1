import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { auth, db } from '../config/firebaseConfig';

export default function MyLaundry() {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [duration, setDuration] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const timerRef = useRef(null);
  const router = useRouter();
  const presetTimes = [30, 45, 60]; // in minutes

  useEffect(() => {
    fetchMachines();
    fetchSession();
  }, []);

  const fetchMachines = async () => {
    const snapshot = await getDocs(collection(db, 'machines'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMachines(list);
  };

  const fetchSession = async () => {
    const userId = auth.currentUser?.uid;
    const q = query(
      collection(db, 'laundrySessions'),
      where('userId', '==', userId),
      where('status', '==', 'running')
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0];
      const data = docRef.data();
      const start = data.startTime.toMillis();
      const now = Date.now();
      const end = start + data.duration * 1000;
      const secondsLeft = Math.max(0, Math.floor((end - now) / 1000));

      setActiveSession({
        id: docRef.id,
        ...data,
      });
      setSessionId(docRef.id);
      setSecondsLeft(secondsLeft);
    }
  };

  useEffect(() => {
    if (!activeSession) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [activeSession]);

  const handleTimerEnd = async () => {
    if (activeSession?.id) {
      await updateDoc(doc(db, 'laundrySessions', activeSession.id), { status: 'complete' });
      await updateDoc(doc(db, 'machines', activeSession.machineId), { availability: true });
    }
    setActiveSession(null);
    setSessionId(null);
    setSecondsLeft(0);
    fetchMachines();
  };

  const startLaundry = async () => {
    if (!selectedMachine || duration === 0) {
      Alert.alert('Error', 'Please select a machine and duration.');
      return;
    }
    const userId = auth.currentUser?.uid;
    const sessionRef = await addDoc(collection(db, 'laundrySessions'), {
      userId,
      machineId: selectedMachine.id,
      startTime: serverTimestamp(),
      duration,
      status: 'running',
    });
    await updateDoc(doc(db, 'machines', selectedMachine.id), {
      availability: false,
    });
    setSelectedMachine(null);
    setDuration(0);
    setSessionId(sessionRef.id);
    setSecondsLeft(duration);
    setActiveSession({
      id: sessionRef.id,
      userId,
      machineId: selectedMachine.id,
      duration,
    });
    fetchMachines();
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          <Text style={styles.heading}>My Laundry</Text>

          {activeSession ? (
            <>
              <Text style={styles.timer}>⏳ Time Remaining: {formatTime(secondsLeft)}</Text>
              <TouchableOpacity style={styles.stopButton} onPress={handleTimerEnd}>
                <Text style={styles.buttonText}>Collect</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subheading}>Select a Machine:</Text>
              <FlatList
                data={machines.filter(m => m.availability)}
                horizontal
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = selectedMachine?.id === item.id;
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedMachine(item)}
                      style={[
                        styles.machineCard,
                        isSelected && styles.selectedCard,
                      ]}
                    >
                      <Text style={styles.machineText}>{item.type}{item.index}</Text>
                      <Text style={styles.machineLocation}>📍 {item.location}</Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <Text style={styles.subheading}>Duration:</Text>
              <View style={styles.options}>
                {presetTimes.map(mins => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.optionButton,
                      duration === mins * 60 && styles.optionSelected,
                    ]}
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
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backHint}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#000',
  },
  machineCard: {
    backgroundColor: '#e6e6e6',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 8,
    width: 160,
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#6495ED',
  },
  machineText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  machineLocation: {
    fontSize: 13,
    color: '#555',
    marginVertical: 4,
  },
  timer: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    marginVertical: 20,
    color: '#333',
  },
  stopButton: {
    backgroundColor: '#D9534F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 30,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  optionSelected: {
    backgroundColor: '#4682B4',
  },
  optionText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  backHint: {
    textAlign: 'center',
    marginTop: 10,
    color: '#007AFF',
    fontSize: 16,
  },
});
