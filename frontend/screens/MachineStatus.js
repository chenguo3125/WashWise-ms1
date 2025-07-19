import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../config/firebaseConfig';

export default function MachineStatus() {
  const [machines, setMachines] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'machines'));
        const machineList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort available machines first
        machineList.sort((a, b) => Number(b.availability) - Number(a.availability));
        machineList.sort((a, b) => {
          if (a.availability !== b.availability) {
            return a.availability ? -1 : 1;
          }
          if (a.type < b.type) return 1;
          if (a.type > b.type) return -1;
          return a.index - b.index;
        });
        setMachines(machineList);
      } catch (error) {
        console.error('Error fetching machines:', error);
      }
    };

    fetchMachines();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Machine Status</Text>

      {machines.map(machine => (
        <View key={machine.id} style={machine.availability ? styles.machineCard1 : styles.machineCard2}>
          <Text style={styles.machineTitle}>{machine.type} No.{machine.index}</Text>
          <Text style={[styles.machineStatus, { color: machine.availability ? 'green' : 'red' }]}>
            Status: {machine.availability ? 'Available' : 'In Use'}
          </Text>
          <Text>Location: {machine.location}</Text>
        </View>
      ))}

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    // backgroundColor: '#f4f7fc',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  machineCard1: {
    backgroundColor: '#A6DCC1',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  machineCard2: {
    backgroundColor: '#fbc9c9',
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
  machineStatus: {
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#7f8c8d',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
