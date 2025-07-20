import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebaseConfig';

export default function NewPost() {
    const [title, setTitle] = useState('');
    const router = useRouter();
    const user = getAuth().currentUser;
    const categories = ['Laundry Tips', 'Report Issues', 'Reminders', 'Others'];
    const categoryColors = {
        'Laundry Tips': '#90EE90',     // light green
        'Report Issues': '#FF6B6B',    // red
        'Reminders': '#FFD700',        // yellow
        'Others': '#555555',           // dark grey
    };
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [imageUri, setImageUri] = useState(null);

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
            setImageUri(result.assets[0].uri);
        }
    };
    // i wanna kill myself

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

        return data.secure_url; // use this url in Firestore
    };



    const handleSubmit = async () => {
        try {
            if (!title.trim()) {
                Alert.alert('Error', 'Please enter a title.');
                return;
            }
            if (!selectedCategory) {
                Alert.alert('Please select a category before submitting.');
                return;
            }

            console.log('[handleSubmit] Starting upload');
            let imageUrl = '';
            if (imageUri) {
                console.log('[handleSubmit] Uploading to Cloudinary...');
                imageUrl = await uploadToCloudinary(imageUri);
                console.log('[handleSubmit] Uploaded to:', imageUrl);
            }

            console.log('[handleSubmit] Saving post to Firestore...');
            await addDoc(collection(db, 'posts'), {
                title,
                image: imageUrl,
                userId: user?.uid,
                userEmail: user?.email,
                createdAt: serverTimestamp(),
                category: selectedCategory
            });

            console.log('[handleSubmit] Post added');
            Alert.alert('Posted!', 'Your post has been shared.');
            router.replace('/community');
        } catch (err) {
            console.error('[handleSubmit] Error during submit:', err);
            Alert.alert('Failed to post', err.message || 'Unknown error occurred');
        }
    };


    return (
        <SafeAreaView style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, marginBottom: 20, fontWeight: 'bold', textAlign: 'center', color: '#333', }}>New Community Post</Text>
            <TextInput
                placeholder="What's your tip or question?"
                value={title}
                onChangeText={setTitle}
                style={{
                    borderColor: '#4682B4',
                    borderWidth: 2,
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 20,
                }}
            />

            <TouchableOpacity
                onPress={pickImage}
                style={{
                    backgroundColor: '#4682B4',
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 15,
                    alignItems: 'center',
                }}
            >
                <Text style={{color: 'white'}}>Select an Image 📸</Text>
            </TouchableOpacity>

            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 20 }}
                />
            )}

            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Select Category:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, borderColor: '#4682B4', borderWidth: 2, padding: 10, borderRadius: 10 }}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={{
                            backgroundColor: selectedCategory === cat ? categoryColors[cat] : '#ccc',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 20,
                            margin: 4,
                        }}
                    >
                        <Text style={{ color: 'white' }}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                onPress={handleSubmit}
                style={{
                    backgroundColor: '#4682B4',
                    padding: 15,
                    borderRadius: 12,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, }}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Back to Home</Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#7f8c8d',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
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