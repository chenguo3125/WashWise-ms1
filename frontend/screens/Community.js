import MasonryList from '@react-native-seoul/masonry-list';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../config/firebaseConfig';

/*const mockPosts = [
  { id: '1', title: 'Laundry Tips', image: '' },
  { id: '2', title: 'Best Detergents', image: '' },
  { id: '3', title: 'Campus Hacks', image: '' },
  { id: '4', title: 'Fold Like a Pro', image: '' },
  { id: '5', title: 'Eco-friendly Tips', image: '' },
];*/

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(list);
      setLoading(false);
    };

    fetchPosts();
  }, []);


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, { backgroundColor: '#d0d0d0' }]}>
          <Text style={styles.imagePlaceholder}>🖼</Text>
        </View>
      )}

      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Community</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <MasonryList
          data={posts}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity onPress={() => router.push('/newpost')} style={styles.button}>
        <Text style={styles.buttonText}>+ New Post</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/chat')} style={styles.button}>
        <Text style={styles.buttonText}>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  list: { paddingHorizontal: 4, marginBottom: 20, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#f9f9f9',
    margin: 6,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
  },
  image: {
    height: 130,
    borderRadius: 8,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 30,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
  },
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 2,
    backgroundColor: '#4682B4',
    padding: 10,
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
});
