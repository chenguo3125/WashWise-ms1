import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DepositScreen() {
  const router = useRouter();
  const [balance, setBalance] = useState(100);
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid deposit amount');
      return;
    }
    setBalance(prev => prev + num);
    setAmount('');
    Alert.alert('Top-Up Successful', `$${num} has been added to your balance`);
  };

  const handlePayment = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid deposit amount');
      return;
    }
    if (num > balance) {
      Alert.alert('Insufficient balance', 'Please top up first');
      return;
    }
    setBalance(prev => prev - num);
    setAmount('');
    Alert.alert('Payment Successful', `You have paid $${num}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Deposit Center</Text>
      <Text style={styles.balance}>Current Balance: ${balance.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter amount to deposit/pay"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.button} onPress={handleDeposit}>
        <Text style={styles.buttonText}>TOP UP</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.payButton]} onPress={handlePayment}>
        <Text style={styles.buttonText}>PAY</Text>
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
    fontSize: 20,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
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
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  payButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
