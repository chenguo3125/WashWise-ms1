import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const rewardItems = [
  { id: '1', name: 'Free Wash Token', cost: 100 },
  { id: '2', name: 'Dryer Discount Coupon', cost: 80 },
  { id: '3', name: 'Laundry Bag', cost: 150 },
  { id: '4', name: 'Detergent Sample Pack', cost: 50 },
];

export default function RewardsScreen() {
  const router = useRouter();
  const [points, setPoints] = useState(200);

  const handleRedeem = async (item) => {
    if (points < item.cost) {
      Alert.alert('Not enough points', `You need ${item.cost - points} more points.`);
      return;
    }

    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('Not logged in');
      return;
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'rewards'), {
        name: item.name,
        cost: item.cost,
        used: false,
        redeemedAt: serverTimestamp(),
      });

      setPoints(points - item.cost);
      Alert.alert('Redeemed', `You've redeemed: ${item.name}`);
    } catch (error) {
      console.error('Redeem error:', error);
      Alert.alert('Error', 'Failed to redeem reward.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Rewards Center</Text>
        <Text style={styles.points}>My Points: {points}</Text>

        {rewardItems.map((item) => (
          <View key={item.id} style={styles.rewardCard}>
            <View>
              <Text style={styles.rewardName}>{item.name}</Text>
              <Text style={styles.rewardCost}>Cost: {item.cost} pts</Text>
            </View>
            <TouchableOpacity
              style={styles.redeemButton}
              onPress={() => handleRedeem(item)}
            >
              <Text style={styles.redeemText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity onPress={() => router.push('/myrewards')} style={styles.button}>
          <Text style={styles.buttonText}>My Rewards</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  content: { padding: 25 },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  points: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  rewardCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardCost: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  redeemButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  redeemText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
  },
  button: {
    backgroundColor: '#4682B4',
    padding: 10,
    borderRadius: 12,
    marginVertical: 0,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
