import { useRouter } from 'expo-router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LaundryTimer from '../components/LaundryTimer';
import { db } from '../config/firebaseConfig';

const auth = getAuth();
const router = useRouter();

export default function HomeScreen() {
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email);
            } else {
                router.replace('/login'); // redirect to login if user signs out
            }
        });

        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            Alert.alert('Logged out');
        } catch (error) {
            Alert.alert('Logout error', error.message);
        }
    };

    const [machines, setMachines] = useState([]);

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'machines'));
                const machineList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                machineList.sort((a, b) => {
                    return (b.availability === true) - (a.availability === true);
                });

                setMachines(machineList);
            } catch (error) {
                console.error("Error fetching machines:", error);
            }
        };

        fetchMachines();
    }, []);

    const [secondsLeft, setSecondsLeft] = useState(1800); // 30 minutes = 1800 seconds

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const formatTime = (sec) => {
        const minutes = Math.floor(sec / 60);
        const seconds = sec % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };



    return (
        <View style={styles.container}>

            <Text style={styles.welcome}>🎉Welcome to WashWise @NUS, {userEmail}</Text>

            <TouchableOpacity onPress={() => router.push('/machinesFullList')}>
                <View style={styles.machinePreviewWrapper}>
                    <Text style={styles.heading}>🧺 Machine Availability</Text>

                    <ScrollView style={styles.machineList} contentContainerStyle={styles.listContainer}>
                        {machines.slice(0, 3).map(machine => (
                            <View key={machine.id} style={styles.machineCard}>
                                <Text style={styles.machineTitle}>Type: {machine.type}</Text>
                                <Text>Status: {machine.availability ? "✅ Available" : "❌ In Use"}</Text>
                                <Text>Location: {machine.location}</Text>
                            </View>
                        ))}
                        <Text style={styles.tapHint}>Tap to see all machines</Text>
                    </ScrollView>

                </View>
            </TouchableOpacity>

            <LaundryTimer />

            <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={() => router.push('/myLaundry')} style={styles.buttonSecondary}>
                    <Text style={styles.buttonText}>My Laundry</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonSecondary}>
                    <Text style={styles.buttonText}>Points & Rewards</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-evenly',
        backgroundColor: '#f2f4f8',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    heading: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1a1a1a',
        textAlign: 'center',
    },
    machineTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#1a1a1a',
    },
    tapHint: {
        fontSize: 12,
        marginTop: 10,
        color: '#1a1a1a',
    },
    listContainer: {
        paddingBottom: 20,
    },
    machineList: {
        maxHeight: 280,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    welcome: {
        fontSize: 18,
        fontWeight: '500',
        marginTop: 0,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    buttonGroup: {
        marginBottom: 30,
    },
    buttonPrimary: {
        backgroundColor: '#FF7F50',
        padding: 16,
        borderRadius: 12,
        marginVertical: 6,
        elevation: 2,
    },
    buttonSecondary: {
        backgroundColor: '#4682B4',
        padding: 16,
        borderRadius: 12,
        marginVertical: 6,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    logoutButton: {
        padding: 14,
        backgroundColor: '#D9534F',
        borderRadius: 10,
        elevation: 2,
    },
    logoutText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
    },
});
