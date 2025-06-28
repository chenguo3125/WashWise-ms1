import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, SafeAreaView, Text, TextInput, TouchableOpacity } from 'react-native';
import { db } from '../config/firebaseConfig';

export default function NewPost() {
    const [title, setTitle] = useState('');
    const router = useRouter();
    const user = getAuth().currentUser;
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
            <Text style={{ fontSize: 24, marginBottom: 12 }}>New Community Post</Text>
            <TextInput
                placeholder="What's your tip or question?"
                value={title}
                onChangeText={setTitle}
                style={{
                    borderColor: '#ccc',
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 20,
                }}
            />

            <TouchableOpacity
                onPress={pickImage}
                style={{
                    backgroundColor: '#eee',
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 15,
                    alignItems: 'center',
                }}
            >
                <Text>Select an Image 📸</Text>
            </TouchableOpacity>

            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 20 }}
                />
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                style={{
                    backgroundColor: '#007AFF',
                    padding: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                }}
            >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
