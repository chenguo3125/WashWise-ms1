import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, Timestamp, updateDoc } from 'firebase/firestore';
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
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const timerRef = useRef(null);
  const presetTimes = [30, 45, 60];

  const scheduleLaundryReminder = async (machineName, duration) => {
    if (duration > 5 * 60) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏳ 5 minutes left!',
          body: `Get ready to collect your laundry on ${machineName}.`,
        },
        trigger: { seconds: duration - 5 * 60 },
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Laundry Reminder',
        body: `Your laundry on ${machineName} is done! Please collect it.`,
      },
      trigger: {
        seconds: duration,
      },
    });

    const reminderId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Collection Reminder',
        body: `Your laundry on ${machineName} has been sitting for 10 minutes.`,
      },
      trigger: { seconds: duration + 10 * 60 },
    });

    return reminderId;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const data = snapshot.exists() ? snapshot.data() : { balance: 0 };
        setBalance(data.balance || 0);
      }
    });
    return unsubscribe;
  }, []);

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

    list.sort((a, b) => {
      if (a.availability !== b.availability) {
        return a.availability ? -1 : 1;
      }
      if (a.type < b.type) return 1;
      if (a.type > b.type) return -1;
      return a.index - b.index;
    });
    setMachines(list);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const startLaundry = async () => {
    if (!selectedMachine || duration === 0) {
      Alert.alert('Error', 'Please select both the machine and duration.');
      return;
    }

    const price = duration / 30 / 60;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    const currentBalance = userSnap.data()?.balance || 0;

    if (currentBalance < price) {
      Alert.alert(
        `Insufficient balance: Need $${(price - currentBalance).toFixed(2)} more.`,
        'Please top up first.'
      );
      return;
    }

    const endTime = Date.now() + duration * 1000;
    const reminderId = await scheduleLaundryReminder(
      `${selectedMachine.type} ${selectedMachine.index}`,
      duration
    );

    await updateDoc(userRef, {
      balance: currentBalance - price,
    });
    setBalance(currentBalance - price);

    const sessionsRef = collection(db, 'laundry_sessions');
    const sessionRef = await addDoc(sessionsRef, {
      userId: user.uid,
      machineId: selectedMachine.id,
      machineType: selectedMachine.type,
      machineIndex: selectedMachine.index,
      startTime: Timestamp.now(),
      endTime,
      duration: duration/ 60,
      price,
      status: 'in_progress',
      pointsAwarded: 0,
      reminderId,
    });

    await updateDoc(doc(db, 'machines', selectedMachine.id), {
      availability: false,
      endTime,
      userId: user.uid,
      reminderId,
      sessionId: sessionRef.id,
    });

    setSelectedMachine(null);
    setDuration(0);
    fetchMachines();

    Alert.alert('Successfully Booked', `${selectedMachine.type} No.${selectedMachine.index} has started!`);
  };

  const stopMachine = async (machineId) => {
    const machineRef = doc(db, 'machines', machineId);
    const machineSnap = await getDoc(machineRef);
    const machineData = machineSnap.data();

    const now = Date.now();
    const endTime = machineData.endTime;
    const timeDiff = now - endTime;
    const minutesLate = timeDiff / 60000;
    const reminderId = machineData.reminderId;

    if (reminderId) {
      await Notifications.cancelScheduledNotificationAsync(reminderId);
    }

    let pointsToAward = 0;
    if (minutesLate >= 0 && minutesLate <= 15) {
      pointsToAward = Math.round(50 * (1 - minutesLate / 15));
    }

    if (pointsToAward > 0 && user?.uid) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentPoints = userSnap.exists() ? userSnap.data().points || 0 : 0;

      await updateDoc(userRef, {
        points: currentPoints + pointsToAward,
      });

      Alert.alert('Good Job!', `You earned ${pointsToAward} points for timely collection.`);
    } else if (minutesLate > 15) {
      Alert.alert('Too Late', `You missed the 15-minute window. No points awarded.`);
    } else {
      Alert.alert('Cancellation Successful', 'Please collect your laundry soon.');
    }

    const sessionId = machineData.sessionId;
    if (sessionId) {
      const sessionDoc = doc(db, 'laundry_sessions', sessionId);
      await updateDoc(sessionDoc, {
        endTime: new Date(),
        status: 'finished',
        pointsAwarded: pointsToAward,
      });
    }

    await updateDoc(machineRef, {
      availability: true,
      endTime: null,
      userId: null,
      reminderId: null,
      sessionId: null,
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
          <Text style={styles.balance}>Balance: ${balance.toFixed(2)}</Text>

          <Text style={styles.subheading}>Machines:</Text>
          <FlatList
            data={machines}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            style={styles.flatList}
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
                    {item.type} <Text style={{ fontStyle: 'italic' }}>No.{item.index}</Text>
                  </Text>
                  <Text style={[styles.machineLocation, inUse && styles.strikethrough]}>
                    📍 {item.location}
                  </Text>
                  <Text style={{
                    color: inUse ? '#D9534F' : '#28a745',
                    fontWeight: '600',
                    marginBottom: 6,
                  }}>
                    {!inUse ? 'Available' : item.maintenance ? 'Maintenance' : 'In Use'}
                  </Text>

                  {(inUse && !item.maintenance) && (
                    <>
                      <Text style={styles.timer}>⏳ {formatTime(item.remaining || 0)}</Text>
                      {item.userId === user?.uid && (
                        <TouchableOpacity
                          style={styles.stopButton}
                          onPress={() => stopMachine(item.id)}
                        >
                          <Text style={styles.buttonText}>{item.remaining === 0 ? 'Collect' : 'Cancel'}</Text>
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
                <Text style={styles.optionText}>${mins / 30}</Text>
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
    marginBottom: 10,
    color: '#333',
  },
  balance: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#4682B4',
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    color: '#000',
  },
  flatList: {
    borderRadius: 10,
    padding: 6,
    borderColor: '#4682B4',
    borderWidth: 2,
    marginBottom: 10,
  },
  machineCard: {
    backgroundColor: '#e6e6e6',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: 'rgba(70, 130, 180, 0.2)',
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
    backgroundColor: '#e6e6e6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 6,
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: 'rgba(70, 130, 180, 0.2)',
  },
  optionText: {
    color: 'rgba(55, 45, 45, 0.8)',
    fontWeight: '600',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
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
    backgroundColor: '#7f8c8d',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 15,
    // paddingHorizontal: 24,
    // paddingVertical: 12,
    elevation: 2,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
