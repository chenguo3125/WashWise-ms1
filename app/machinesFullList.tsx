import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../frontend/config/firebaseConfig';

type Machine = {
  id: string;
  type: string;
  availability: boolean;
  location: string;
};

export default function MachinesFullList() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'machines'));
        const machineList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Machine[];

        // Sort available machines first
        machineList.sort((a, b) => Number(b.availability) - Number(a.availability));

        setMachines(machineList);
      } catch (error) {
        console.error('Error fetching machines:', error);
      }
    };

    fetchMachines();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🧺 All Machines</Text>

      {machines.map(machine => (
        <View key={machine.id} style={styles.machineCard}>
          <Text style={styles.machineTitle}>Type: {machine.type}</Text>
          <Text>Status: {machine.availability ? '✅ Available' : '❌ In Use'}</Text>
          <Text>Location: {machine.location}</Text>
        </View>
      ))}

      <Text style={styles.backHint} onPress={() => router.back()}>
        ← Back to Home
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f7fc',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  machineCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  machineTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  backHint: {
    marginTop: 30,
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
  },
});