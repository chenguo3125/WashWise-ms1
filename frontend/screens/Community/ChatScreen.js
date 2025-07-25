import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import pfp0 from '../../assets/pfp/pfp0.png';
import pfp1 from '../../assets/pfp/pfp1.png';
import pfp2 from '../../assets/pfp/pfp2.png';
import pfp3 from '../../assets/pfp/pfp3.png';
import pfp4 from '../../assets/pfp/pfp4.png';
import pfp5 from '../../assets/pfp/pfp5.png';
import pfp6 from '../../assets/pfp/pfp6.png';
import pfp7 from '../../assets/pfp/pfp7.png';
import { db } from '../../config/firebaseConfig';

const samplePfps = [pfp0, pfp1, pfp2, pfp3, pfp4, pfp5, pfp6, pfp7];


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

    const unsubscribe = onSnapshot(q, async snapshot => {
      const enriched = await Promise.all(
        snapshot.docs.map(async docSnap => {
          const msg = docSnap.data();
          let userData = { name: 'Anonymous', pfpIndex: 0 };

          if (msg.userId) {
            const userRef = collection(db, 'users');
            const userDoc = await getDoc(doc(db, 'users', msg.userId));
            if (userDoc.exists()) {
              userData = userDoc.data();
            }
          }

          return {
            id: docSnap.id,
            ...msg,
            user: userData,
          };
        })
      );

      setMessages(enriched);
    });

    return unsubscribe;
  }, []);


  const formatTime = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => {
    const user = item.user || {};
    const pfp = samplePfps[user.pfpIndex || 0];

    return (
      <View style={styles.messageContainer}>
        <View style={styles.messageHeader}>
          <Image source={pfp} style={styles.pfp} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.sender}>{user.name || user.email || 'Anonymous'}</Text>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
      </View>
    );
  };


  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={80} // adjust if needed
  >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chat}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
          <Image source={require('../../assets/pic.png')} style={styles.iconimg} />
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
    </KeyboardAvoidingView>
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
  pfp: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  timestamp: {
    fontSize: 10,
    color: 'gray',
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
    width: 33,
    height: 33,
    // borderRadius: 3,
    // justifyContent: 'center',
    // paddingVertical: 8,
    tintColor: '#4682B4'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
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
    backgroundColor: '#4682B4',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 7,
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
