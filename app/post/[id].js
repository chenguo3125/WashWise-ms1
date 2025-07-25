import { useLocalSearchParams } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Button, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../../frontend/config/firebaseConfig';

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', id)
    );
    const querySnapshot = await getDocs(q);
    setComments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchPost = async () => {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setPost({ id: docSnap.id, ...docSnap.data() });
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment = {
      postId: id,
      text: newComment,
      createdAt: serverTimestamp(),
    };
    try {
    await addDoc(collection(db, 'comments'), comment);
    setNewComment('');
    fetchComments();
    } catch (err) {
      console.error('fail to comment:', err);
    }
  };

  if (!post) return <Text>Loading post...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.image} />
      ) : null}
      <Text style={styles.category}>{post.category}</Text>

      <View style={styles.commentSection}>
        <Text style={styles.commentTitle}>Comments</Text>
        {comments.map(comment => (
          <View key={comment.id} style={styles.comment}>
            <Text>{comment.text}</Text>
          </View>
        ))}
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          style={styles.input}
        />
        <Button title="Post Comment" onPress={handleAddComment} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  image: { width: '100%', height: 200, marginTop: 10, borderRadius: 8 },
  category: { marginTop: 10, color: 'gray' },
  content: { marginTop: 10 },
  commentSection: { marginTop: 20 },
  commentTitle: { fontWeight: 'bold', marginBottom: 8 },
  comment: { paddingVertical: 4, borderBottomWidth: 1, borderColor: '#ddd' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
});
