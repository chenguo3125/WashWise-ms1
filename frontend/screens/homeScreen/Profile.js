import { useRouter } from 'expo-router';
import {
    doc, getDoc, updateDoc
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
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

const samplePfps = [pfp0, pfp1, pfp2, pfp3, pfp4, pfp5, pfp6, pfp7];


export default function ProfileScreen() {
    const [name, setName] = useState('');
    const [pfpIndex, setPfpIndex] = useState(0);
    const [points, setPoints] = useState(0);
    const [balance, setBalance] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, 'users', user.uid);
            const snap = await getDoc(docRef);

            if (snap.exists()) {
                const data = snap.data();
                setName(data.name || '');
                setPfpIndex(data.pfpIndex ?? 0);  // default pfp0
                setPoints(data.points || 0);
                setBalance(data.balance || 0);
            }
        };

        fetchProfile();
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, 'users', user.uid);
        await updateDoc(doc(db, 'users', user.uid), {
            name,
            pfpIndex,
        });

        router.back();
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Edit Profile</Text>

            <Text style={styles.label}>Profile Picture</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', paddingVertical: 8 }}
                style={{ marginVertical: 10 }}
            >
                {samplePfps.map((img, idx) => (
                    <TouchableOpacity key={idx} onPress={() => setPfpIndex(idx)}>
                        <Image
                            source={img}
                            style={[
                                styles.pfpImage,
                                pfpIndex === idx && { borderColor: 'blue', borderWidth: 2 },
                            ]}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.label}>Username</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
            />

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <View style={styles.statsContainer}>
                <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/rewards')}>
                    <Text style={styles.actionLabel}>🎁 Rewards</Text>
                    <Text style={styles.actionValue}>{points} points</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/deposit')}>
                    <Text style={styles.actionLabel}>💰 Deposit</Text>
                    <Text style={styles.actionValue}>${balance.toFixed(2)}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/activity')}>
                    <Text style={styles.actionLabel}>📜 Activity</Text>
                    <Text >view recent actions ›</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>

    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    label: { fontWeight: 'bold', marginTop: 16 },
    input: {
        borderWidth: 1, borderColor: '#ccc', padding: 8, marginTop: 4, borderRadius: 6,
    },
    pfpList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    pfpImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    saveButton: {
        backgroundColor: '#4682B4',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold',
    },
    statsContainer: {
        marginTop: 30,
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Android shadow
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },

    actionRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 18,
  backgroundColor: '#f3f6fb',
  borderRadius: 10,
  marginVertical: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 2,
  elevation: 1,
},

actionLabel: {
  fontSize: 16,
  fontWeight: '500',
  color: '#333',
},

actionValue: {
  fontSize: 16,
  fontWeight: '700',
  color: '#4682B4',
},


});
