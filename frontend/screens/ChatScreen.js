import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../config/firebaseConfig';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const user = getAuth().currentUser;

  const chatRoomId = 'main';

  const sendMessage = async () => {
    if (!message && !image) return;

    await addDoc(collection(db, 'chats', chatRoomId, 'messages'), {
      text: message,
      image: image || null,
      createdAt: serverTimestamp(),
      userId: user?.uid,
      email: user?.email,
    });

    setMessage('');
    setImage(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatRoomId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });

    return unsubscribe;
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.sender}>{item.email || 'Anonymous'}</Text>
      {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chat}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
          <Text style={styles.attachText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f4f8' },
  chat: { padding: 10 },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  sender: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  image: {
    marginTop: 6,
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 6,
  },
  attachButton: {
    paddingHorizontal: 8,
  },
  attachText: {
    fontSize: 22,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
