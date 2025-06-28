import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '../config/firebaseConfig';

export default function MyRewards() {
  const [rewards, setRewards] = useState([]);
  const user = getAuth().currentUser;
  const router = useRouter();

  const fetchRewards = React.useCallback(async () => {
    if (!user) return;

    const rewardsRef = collection(db, 'users', user.uid, 'rewards');
    const snapshot = await getDocs(query(rewardsRef, orderBy('redeemedAt', 'desc')));

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRewards(data);
  }, [user]);

  const markAsUsed = async (rewardId) => {
    const ref = doc(db, 'users', user.uid, 'rewards', rewardId);
    await updateDoc(ref, { used: true });
    Alert.alert('Marked as used');
    fetchRewards();
  };

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>My Redeemed Rewards</Text>
        <View style={styles.machineList}>
          {rewards.length === 0 ? (
            <Text style={styles.emptyText}>You haven’t redeemed any rewards yet.</Text>
          ) : (
            rewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardCost}>Cost: {reward.cost} pts</Text>
                  <Text style={styles.rewardUsed}>
                    Status: {reward.used ? '✅ Used' : '🕒 Not used'}
                  </Text>
                </View>
                {!reward.used && (
                  <TouchableOpacity
                    style={styles.useButton}
                    onPress={() => markAsUsed(reward.id)}
                  >
                    <Text style={styles.useText}>Mark as Used</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

      </ScrollView>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8', marginBottom: 0, padding: 25 },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  rewardCard: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 6,
    borderColor: '#4682B4',
    borderWidth: 2,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardCost: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rewardUsed: {
    fontSize: 13,
    marginTop: 4,
    color: '#555',
  },
  useButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginTop: 30,
    borderRadius: 20,
  },
  useText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
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
