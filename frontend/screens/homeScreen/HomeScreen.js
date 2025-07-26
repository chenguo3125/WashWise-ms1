import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import pfp0 from '../../assets/pfp/pfp0.png';
import pfp1 from '../../assets/pfp/pfp1.png';
import pfp2 from '../../assets/pfp/pfp2.png';
import pfp3 from '../../assets/pfp/pfp3.png';
import pfp4 from '../../assets/pfp/pfp4.png';
import pfp5 from '../../assets/pfp/pfp5.png';
import pfp6 from '../../assets/pfp/pfp6.png';
import pfp7 from '../../assets/pfp/pfp7.png';
import { auth, db } from '../../config/firebaseConfig';
import { registerForPushNotificationsAsync } from '../../utils/notificationUtils';
import { styles } from './HomeScreen.styles';

const samplePfps = [pfp0, pfp1, pfp2, pfp3, pfp4, pfp5, pfp6, pfp7];

export default function HomeScreen() {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [pfpIndex, setPfpIndex] = useState(0);
  const [machines, setMachines] = useState([]);
  const [timers, setTimers] = useState([]);
  const router = useRouter();

  const handleStopMachine = async (timer) => {
    const { machineId, reminderId, sessionId } = timer;

    try {
      if (reminderId) {
        await Notifications.cancelScheduledNotificationAsync(reminderId);
      }

      const machineRef = doc(db, 'machines', machineId);
      const machineSnap = await getDoc(machineRef);
      const machineData = machineSnap.data();

      const now = Date.now();
      const endTime = machineData.endTime;
      const minutesLate = (now - endTime) / 60000;
      let pointsToAward = 0;

      if (minutesLate >= 0 && minutesLate <= 15) {
        pointsToAward = Math.round(50 * (1 - minutesLate / 15));
      }

      const user = auth.currentUser;
      if (pointsToAward > 0 && user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const currentPoints = userSnap.data().points || 0;
        await updateDoc(userRef, { points: currentPoints + pointsToAward });
      }

      const sessionRef = doc(db, 'laundry_sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'finished',
        endTime: Timestamp.fromMillis(now),
        pointsAwarded: pointsToAward,
      });

      await updateDoc(machineRef, {
        availability: true,
        endTime: null,
        userId: null,
        reminderId: null,
        sessionId: null,
      });

      setTimers(prev => prev.filter(t => t.id !== timer.id));

      if (minutesLate > 15) {
        Alert.alert('Too Late', 'You missed the 15-minute window. No points awarded.');
      } else if (pointsToAward > 0) {
        Alert.alert('Good Job!', `You earned ${pointsToAward} points for timely collection.`);
      } else {
        Alert.alert('Cancelled', 'Your laundry session has been cancelled.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  useEffect(() => {
    let unsubscribeUserSnap = () => { };
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);

        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: user.email,
            name: user.displayName || '',
            balance: 0,
            points: 0,
            pfpIndex: 0,
            createdAt: new Date(),
          });
        }

        unsubscribeUserSnap = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserEmail(data.email);
            setUserName(data.name || data.email);
            setPfpIndex(data.pfpIndex ?? 0);
          }
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserSnap();
    };
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
        collection(db, 'laundry_sessions'),
        where('userId', '==', userId),
        where('status', '==', 'in_progress')
      );

      const snapshot = await getDocs(q);
      const newTimers = [];

      for (const session of snapshot.docs) {
        const data = session.data();
        const start = data.startTime.toMillis();
        const end = start + data.duration * 1000 * 60;
        const secondsLeft = Math.max(0, Math.floor((end - Date.now()) / 1000));

        newTimers.push({
          id: session.id,
          machineName: `${data.machineType} No.${data.machineIndex}`,
          remaining: secondsLeft,
          machineId: data.machineId,
          reminderId: data.reminderId,
          sessionId: session.id,
        });

        if (secondsLeft === 0) {
          await updateDoc(doc(db, 'laundry_sessions', session.id), { status: 'complete' });
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>Welcome to WashWise@NUS</Text>
            {userName !== '' && (
              <Text style={[styles.welcome, { fontWeight: 'bold', color: '#4682B4' }]}>
                {userName}
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Image
              source={samplePfps[pfpIndex]}
              style={{ width: 45, height: 45, borderRadius: 30, marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>

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
              <Text style={styles.viewText}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {timers.length > 0 && (
          <View style={styles.timerScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {timers.map((timer) => (
                <View key={timer.id} style={styles.timerCard}>
                  <Text style={styles.machineName}>{timer.machineName}</Text>
                  <Text style={styles.timerText}>
                    ⏳ <Text style={styles.timeValue}>{formatTime(timer.remaining)}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={() => handleStopMachine(timer)}
                  >
                    <Text style={styles.buttonText}>
                      {timer.remaining === 0 ? 'Collect' : 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push('/myLaundry')}
          style={styles.laundryCTA}
        >
          <Text style={styles.laundryCTAText}>My Laundry</Text>
        </TouchableOpacity>

        <View style={styles.secondaryNav}>
          <TouchableOpacity onPress={() => router.push('/community')} style={styles.button}>
            <Text style={styles.secondaryText}>Community</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/report')} style={styles.button}>
            <Text style={styles.secondaryText}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </View>
      {/* <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
}
