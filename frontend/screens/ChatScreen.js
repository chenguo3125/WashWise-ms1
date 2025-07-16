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
  Alert,
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your photo library.');
      return;
    }

    console.log('Requesting picker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    console.log('Picker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const uploadedUrl = await uploadToCloudinary(result.assets[0].uri);
        setImage(uploadedUrl); // stores a sharable Cloudinary URL
      } catch (error) {
        console.error('Cloudinary upload failed:', error);
        Alert.alert('Image upload failed');
      }
    }
  };

  const uploadToCloudinary = async (localUri) => {
    const cloudName = 'dbce15oih';
    const uploadPreset = 'post-images1';

    const formData = new FormData();
    formData.append('file', {
      uri: localUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error('Image upload failed');
    }

    return data.secure_url;
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
          <Image source={require('../assets/pic.png')} style={styles.iconimg} />
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
  iconimg: {
    width: 44,
    height: 33,
    borderRadius: 3,
    // justifyContent: 'center',
    // paddingVertical: 8,
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
