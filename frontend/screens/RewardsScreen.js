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

const rewardItems = [
  { id: '1', name: 'Free Wash Token', cost: 100 },
  { id: '2', name: 'Dryer Discount Coupon', cost: 80 },
  { id: '3', name: 'Laundry Bag', cost: 150 },
  { id: '4', name: 'Detergent Sample Pack', cost: 50 },
];

export default function RewardsScreen() {
  const router = useRouter();
  const [points, setPoints] = useState(200); // Replace with actual user points from backend if needed

  const handleRedeem = (item) => {
    if (points < item.cost) {
      Alert.alert('Not enough points', `You need ${item.cost - points} more points.`);
      return;
    }

    setPoints(points - item.cost);
    Alert.alert('Redeemed', `You've redeemed: ${item.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Rewards Center</Text>
        <Text style={styles.points}>Your Points: {points}</Text>

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

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  content: { padding: 20 },
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardCost: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  redeemButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  redeemText: {
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  backText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#007AFF',
  },
});