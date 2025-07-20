import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export default function DepositScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);
      const data = snapshot.exists() ? snapshot.data() : { balance: 0 };
      setBalance(data.balance || 0);
    };

    fetchBalance();
  }, [user]);

  const handleDeposit = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid deposit amount');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    const current = snapshot.data()?.balance || 0;

    await updateDoc(userRef, { balance: current + num });
    setBalance(current + num);
    setAmount('');
    Alert.alert('Top-Up Successful', `$${num} has been added to your balance`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Deposit Center</Text>
      <Text style={styles.balance}>Current Balance: ${balance.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount to deposit"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.button} onPress={handleDeposit}>
        <Text style={styles.buttonText}>TOP UP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    padding: 25,
    justifyContent: 'center',
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
    marginBottom: 20,
    color: '#4682B4',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginBottom: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#7f8c8d',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
