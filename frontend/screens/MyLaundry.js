import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
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
import { db } from '../config/firebaseConfig';

export default function MyLaundry() {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [duration, setDuration] = useState(0);
  const router = useRouter();
  const timerRef = useRef(null);
  const presetTimes = [30, 45, 60];
  const user = getAuth().currentUser;
  const scheduleLaundryReminder = async (machineName, duration) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Laundry Reminder',
      body: `Your laundry on ${machineName} is done! Please collect it.`,
    },
    trigger: {
      seconds: duration, 
    },
  });
};

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setMachines(prev =>
        prev.map(machine => {
          if (machine.availability === false && machine.endTime) {
            const remaining = Math.max(0, Math.floor((machine.endTime - Date.now()) / 1000));
            return { ...machine, remaining };
          }
          return machine;
        })
      );
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchMachines = async () => {
    const snapshot = await getDocs(collection(db, 'machines'));
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      const remaining = data.availability === false && data.endTime
        ? Math.max(0, Math.floor((data.endTime - Date.now()) / 1000))
        : 0;
      return {
        id: doc.id,
        ...data,
        remaining,
      };
    });
    setMachines(list);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const startLaundry = async () => {
    if (!selectedMachine || duration === 0) {
      Alert.alert('Error', 'Please select a machine and duration.');
      return;
    }
    const endTime = Date.now() + duration * 1000;
    await updateDoc(doc(db, 'machines', selectedMachine.id), {
      availability: false,
      endTime,
      userId: user.uid,
    });
    await scheduleLaundryReminder(`${selectedMachine.type} ${selectedMachine.index}`, duration);
    
    setSelectedMachine(null);
    setDuration(0);
    fetchMachines();
  };

  const stopMachine = async (machineId) => {
    await updateDoc(doc(db, 'machines', machineId), {
      availability: true,
      endTime: null,
      userId: null,
    });
    fetchMachines();
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return seconds === 0 ? `Time is up!` : `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          <Text style={styles.heading}>My Laundry</Text>

          <Text style={styles.subheading}>Machines:</Text>
          <FlatList
            data={machines}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const inUse = item.availability === false;
              const isSelected = selectedMachine?.id === item.id;
              return (
                <TouchableOpacity
                  disabled={inUse}
                  onPress={() => !inUse && setSelectedMachine(item)}
                  style={[
                    styles.machineCard,
                    isSelected && styles.selectedCard,
                    inUse && styles.disabledCard,
                  ]}
                >
                  <Text style={[styles.machineText, inUse && styles.strikethrough]}>
                    {item.type}{item.index}
                  </Text>
                  <Text style={[styles.machineLocation, inUse && styles.strikethrough]}>
                    📍 {item.location}
                  </Text>
                  <Text style={{
                    color: inUse ? '#D9534F' : '#28a745',
                    fontWeight: '600',
                    marginBottom: 6,
                  }}>
                    {inUse ? 'In Use' : 'Available'}
                  </Text>

                  {inUse && (
                    <>
                      <Text style={styles.timer}>⏳ {formatTime(item.remaining || 0)}</Text>
                      {item.userId === user?.uid && (
                        <TouchableOpacity
                          style={styles.stopButton}
                          onPress={() => stopMachine(item.id)}
                        >
                          <Text style={styles.buttonText}>{item.remaining === 0? 'Collect' : 'Cancel'}</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
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

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back to Home</Text>
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
    padding: 25,
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
  disabledCard: {
    backgroundColor: '#ccc',
    opacity: 0.7,
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
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  timer: {
    fontSize: 14,
    color: '#333',
  },
  stopButton: {
    backgroundColor: '#D9534F',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 6,
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
  startButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
