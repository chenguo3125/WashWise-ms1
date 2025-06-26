import MasonryList from '@react-native-seoul/masonry-list';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const mockPosts = [
  { id: '1', title: 'Laundry Tips', image: '' },
  { id: '2', title: 'Best Detergents', image: '' },
  { id: '3', title: 'Campus Hacks', image: '' },
  { id: '4', title: 'Fold Like a Pro', image: '' },
  { id: '5', title: 'Eco-friendly Tips', image: '' },
];

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.image, { backgroundColor: '#d0d0d0' }]}>
        <Text style={styles.imagePlaceholder}>🖼</Text>
      </View>
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
    marginBottom: 16,
    color: '#333',
  },
  list: { paddingHorizontal: 4 },
  card: {
    backgroundColor: '#f9f9f9',
    margin: 6,
    borderRadius: 10,
    overflow: 'hidden',
    padding: 10,
  },
  image: {
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 30,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
