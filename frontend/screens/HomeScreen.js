import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../config/firebaseConfig';
import { registerForPushNotificationsAsync } from '../utils/notificationUtils';

export default function HomeScreen() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [machines, setMachines] = useState([]);
  const [timers, setTimers] = useState([]);
  const router = useRouter();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || '',
          balance: 0,
          points: 0,
          createdAt: new Date(),
        });
      }else {
        const data = userSnap.data();
        setUserEmail(data.email);
        setUserName(data.name || 'WashWiser');
      }
    }
  });
  return unsubscribe;
}, []);

  useEffect(() => {
  const saveTokenToFirestore = async () => {
    const token = await registerForPushNotificationsAsync();
    const user = auth.currentUser;

    if (user && token) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { expoPushToken: token }, { merge: true });
    }
  };

  saveTokenToFirestore();
}, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      }
      else router.replace('/login');
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    const unsubscribeMachines = onSnapshot(collection(db, 'machines'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.availability === true) - (a.availability === true));
      
      list.sort((a, b) => {
        if (a.availability !== b.availability) {
          return a.availability ? -1 : 1;
        }
        if (a.type < b.type) return 1;
        if (a.type > b.type) return -1;
        return a.index - b.index;
      });
      setMachines(list);
    });
    return unsubscribeMachines;
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(
        collection(db, 'laundrySessions'),
        where('userId', '==', userId),
        where('status', '==', 'running')
      );

      const snapshot = await getDocs(q);
      const newTimers = [];

      for (const session of snapshot.docs) {
        const data = session.data();
        const start = data.startTime.toMillis();
        const end = start + data.duration * 1000;
        const secondsLeft = Math.max(0, Math.floor((end - Date.now()) / 1000));

        newTimers.push({
          id: session.id,
          machineId: data.machineId,
          remaining: secondsLeft,
        });

        if (secondsLeft === 0) {
          await updateDoc(doc(db, 'laundrySessions', session.id), { status: 'complete' });
          await updateDoc(doc(db, 'machines', data.machineId), { availability: true });
        }
      }
      setTimers(newTimers);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged out');
    } catch (error) {
      Alert.alert('Logout error', error.message);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to WashWise@NUS</Text>
        {userName !== '' && (
          <Text style={[styles.welcome, { fontWeight: 'bold', color: '#4682B4' }]}>
            {userName}
          </Text>
        )}


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Machine Availability</Text>
          <View style={styles.machineList}>
            <ScrollView contentContainerStyle={styles.listContainer}>
              {machines.slice(0, 3).map((machine) => (
                <View key={machine.id} style={styles.machineCard}>
                  <Text style={styles.machineType}>{machine.type} No.{machine.index}</Text>
                  <Text style={[styles.machineStatus, { color: machine.availability ? 'green' : 'red' }]}>Status: {machine.availability ? 'Available' : 'In Use'}</Text>
                  <Text style={styles.machineLocation}>📍 {machine.location}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => router.push('/machineStatus')} style={styles.viewButton}>
              <Text style={styles.viewText}>View All →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {timers.length > 0 && (
          <View style={styles.timerScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {timers.map(timer => (
                <View key={timer.id} style={styles.timerCard}>
                  <Text style={styles.timerText}>⏳ Machine: {timer.machineId}</Text>
                  <Text style={styles.timerText}>Time Left: {formatTime(timer.remaining)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.navButtons}>
          <TouchableOpacity onPress={() => router.push('/myLaundry')} style={styles.button}>
            <Text style={styles.buttonText}>My Laundry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/rewards')} style={styles.button}>
            <Text style={styles.buttonText}>Points & Rewards</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/community')} style={styles.button}>
            <Text style={styles.buttonText}>Community</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/deposit')} style={styles.button}>
            <Text style={styles.buttonText}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/report')} style={styles.button}>
            <Text style={styles.buttonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    padding: 25,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  welcome: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 0,
    color: 'grey',
  },
  section: {
    marginBottom: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  machineList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    maxHeight: 275,
    borderColor: '#4682B4',
    borderWidth: 2,
  },
  machineCard: {
    backgroundColor: '#f2f4f8',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  machineType: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  machineStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  machineLocation: {
    fontSize: 13,
    color: '#555',
  },
  button: {
    backgroundColor: '#4682B4',
    padding: 6,
    borderRadius: 12,
    marginVertical: 5,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgb(201, 47, 47)',
    padding: 2,
    marginHorizontal: 90,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewButton: {
    marginTop: 8,
    backgroundColor: 'rgb(127, 116, 180)',
    padding: 2,
    marginHorizontal: 90,
    borderRadius: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  viewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerScrollContainer: {
    paddingVertical: 10,
    marginBottom: 10,
  },
  timerCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    minWidth: 160,
    elevation: 2,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
