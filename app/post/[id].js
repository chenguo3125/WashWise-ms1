import { useLocalSearchParams } from 'expo-router';
import {
  addDoc, collection, doc, getDoc, getDocs, query,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Button, Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, View
} from 'react-native';
import { auth, db } from '../../frontend/config/firebaseConfig';

import pfp0 from '../../frontend/assets/pfp/pfp0.png';
import pfp1 from '../../frontend/assets/pfp/pfp1.png';
import pfp2 from '../../frontend/assets/pfp/pfp2.png';
import pfp3 from '../../frontend/assets/pfp/pfp3.png';
import pfp4 from '../../frontend/assets/pfp/pfp4.png';
import pfp5 from '../../frontend/assets/pfp/pfp5.png';
import pfp6 from '../../frontend/assets/pfp/pfp6.png';
import pfp7 from '../../frontend/assets/pfp/pfp7.png';

const samplePfps = [pfp0, pfp1, pfp2, pfp3, pfp4, pfp5, pfp6, pfp7];

export default function PostDetail() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchPost = async () => {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const postData = { id: docSnap.id, ...docSnap.data() };
      setPost(postData);

      const userSnap = await getDoc(doc(db, 'users', postData.userId));
      if (userSnap.exists()) {
        setAuthor({ id: userSnap.id, ...userSnap.data() });
      }
    }
  };

  const fetchComments = async () => {
    const q = query(collection(db, 'comments'), where('postId', '==', id));
    const querySnapshot = await getDocs(q);

    const enrichedComments = await Promise.all(
      querySnapshot.docs.map(async docSnap => {
        const data = docSnap.data();
        const userSnap = await getDoc(doc(db, 'users', data.userId));

        return {
          id: docSnap.id,
          ...data,
          user: userSnap.exists() ? userSnap.data() : null,
        };
      })
    );
    setComments(enrichedComments);
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const handleAddComment = async () => {
    const user = auth.currentUser;
    if (!user || !newComment.trim()) return;

    const comment = {
      postId: id,
      userId: user.uid,
      text: newComment.trim(),
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

  const formatDate = timestamp => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  if (!post) return <Text>Loading post...</Text>;

  const authorPfp = author?.pfpIndex != null ? samplePfps[author.pfpIndex] : samplePfps[0];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <View style={styles.postHeader}>
            <Image source={authorPfp} style={styles.pfp} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.username}>{author?.name || author?.email || 'Unknown User'}</Text>
              <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
            </View>
          </View>

          <Text style={styles.title}>{post.title}</Text>

          {post.image && (
            <Image
              source={{ uri: post.image }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}

          <Text style={styles.category}>#{post.category}</Text>

          <View style={styles.commentSection}>
            <Text style={styles.commentTitle}>Comments</Text>
            {comments.map(comment => {
              const user = comment.user;
              const userPfp = user?.pfpIndex != null ? samplePfps[user.pfpIndex] : samplePfps[0];
              return (
                <View key={comment.id} style={styles.comment}>
                  <Image source={userPfp} style={styles.pfpSmall} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={styles.commentUser}>{user?.name || user?.email || 'Unknown User'}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Write a comment..."
            style={styles.input}
          />
          <Button title="Post" style={styles.sendButton} onPress={handleAddComment} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pfp: { width: 40, height: 40, borderRadius: 20 },
  username: { fontWeight: 'bold', fontSize: 16 },
  timestamp: { color: 'gray', fontSize: 12 },
  title: { fontSize: 20, fontWeight: 'bold', marginVertical: 8 },
  sendButton: {
    backgroundColor: '#4682B4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 7,
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1.5, 
    marginBottom: 12,
  },
  category: { fontStyle: 'italic', color: '#555' },
  commentSection: { marginTop: 20, paddingBottom: 10 },
  commentTitle: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pfpSmall: { width: 30, height: 30, borderRadius: 15, marginTop: 2 },
  commentUser: { fontWeight: 'bold' },
  commentText: { marginVertical: 2 },
  commentTime: { fontSize: 10, color: 'gray' },
  inputBar: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
});
