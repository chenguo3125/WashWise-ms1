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
import { db } from '../../config/firebaseConfig';

/*const mockPosts = [
  { id: '1', title: 'Laundry Tips', image: '' },
  { id: '2', title: 'Best Detergents', image: '' },
  { id: '3', title: 'Campus Hacks', image: '' },
  { id: '4', title: 'Fold Like a Pro', image: '' },
  { id: '5', title: 'Eco-friendly Tips', image: '' },
];*/
const categories = ['Laundry Tips', 'Seek Help', 'Reminders', 'Others'];
const categoryColors = {
  'Laundry Tips': '#90EE90',     // light green
  'Seek Help': '#FF6B6B',    // red
  'Reminders': '#FFD700',        // yellow
  'Others': '#555555',           // dark grey
};


export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
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
    <TouchableOpacity onPress = { () => router.push(`/post/${item.id}`)}>
    <View style={styles.card}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, { backgroundColor: '#d0d0d0' }]}>
          <Text style={styles.imagePlaceholder}>🖼</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <View style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: categoryColors[item.category] || '#999',
          marginRight: 6,
        }} />
        <Text style={styles.title}>{item.title}</Text>
      </View>

    </View>

    </TouchableOpacity>
  );

  const filteredPosts =
    categoryFilter === 'All'
      ? posts
      : posts.filter(post => post.category === categoryFilter);


  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {['All', ...categories].map((cat) => {
          const bgColor =
            cat === 'All'
              ? (categoryFilter === 'All' ? '#007AFF' : '#ccc')
              : (categoryFilter === cat ? categoryColors[cat] : '#ccc');

          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoryFilter(cat)}
              style={{
                backgroundColor: bgColor,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 16,
                margin: 4,
              }}
            >
              <Text style={{ color: 'white' }}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <MasonryList
          data={filteredPosts}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity onPress={() => router.push('/newPost')} style={styles.postButton}>
        <Text style={styles.buttonText}>Add New Post</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/chat')} style={styles.button}>
        <Text style={styles.buttonText}>Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 25 },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  list: { paddingHorizontal: 0, marginBottom: 20, backgroundColor: 'rgba(70, 130, 180, 0.2)', borderColor: '#4682B4', borderWidth: 2, borderRadius: 10 },
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
  postButton: {
    marginTop: 10,
    backgroundColor: '#4682B4',
    padding: 15,
    borderRadius: 12,
    marginVertical: 0,
    elevation: 2,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#4682B4',
    padding: 15,
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
});
