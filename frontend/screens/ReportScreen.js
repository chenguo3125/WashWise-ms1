import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ActivityIndicator
} from 'react-native';
import { db } from '../config/firebaseConfig';

export default function ReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    machineId: '',
    issueType: '',
    description: '',
    image: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [showInfoCard, setShowInfoCard] = useState(true);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
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

  const handleSubmit = async () => {
    if (!formData.machineId || !formData.issueType || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const user = getAuth().currentUser;
      if (!user) {
        Alert.alert('Not logged in');
        return;
      }

      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      await addDoc(collection(db, 'maintenanceReports'), {
        machineId: formData.machineId,
        issueType: formData.issueType,
        description: formData.description,
        imageUrl: imageUrl || null,
        userId: user.uid,
        email: user.email,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      // Reset form
      setFormData({
        machineId: '',
        issueType: '',
        description: '',
        image: null
      });

      Alert.alert('Report Submitted', 'Your maintenance report has been submitted successfully. Our team will address it shortly.');
      } catch (error) {
        console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Machine Maintenance</Text>
        <Text style={styles.subtitle}>Report any issues with laundry machines</Text>

        {showInfoCard && (
        <View style={styles.infoCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowInfoCard(false)}>
                <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.infoTitle}>How to Report Issues:</Text>
            <View style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>Locate the machine ID on the front of the machine</Text>
            </View>
            <View style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>Be specific about the issue you&#39;re experiencing</Text>
            </View>
            <View style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>Add a photo to help us identify the problem</Text>
            </View>
        </View>
        )}

        <View style={styles.formContainer}>
            <Text style={styles.label}>Machine ID *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.machineId}
                    onValueChange={(itemValue) => handleInputChange('machineId', itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItemText}
                >
                    <Picker.Item label="Select machine ID..." value="" enabled={false} />
                    <Picker.Item label="LH-W-1" value="LH-W-1" />
                    <Picker.Item label="LH-W-2" value="LH-W-2" />
                    <Picker.Item label="SH-W-3" value="SH-W-3" />
                    <Picker.Item label="LH-D-1" value="LH-D-1" />
                    <Picker.Item label="LH-D-2" value="LH-D-2" />
                    <Picker.Item label="SH-D-3" value="SH-D-3" />
                </Picker>
            </View>

            <Text style={styles.label}>Issue Type *</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.issueType}
                    onValueChange={(itemValue) => handleInputChange('issueType', itemValue)}
                    style={styles.picker}
                    itemStyle={styles.pickerItemText}
                >
                    <Picker.Item label="Select issue type..." value="" enabled={false} />
                    <Picker.Item label="Not starting" value="Not starting" />
                    <Picker.Item label="Leaking" value="Leaking" />
                    <Picker.Item label="Noisy" value="Noisy" />
                    <Picker.Item label="Other" value="Other" />
                </Picker>
            </View>

            <Text style={styles.label}>Description *</Text>
            <TextInput
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                placeholderTextColor="#999"
            />

            <Text style={styles.label}>Add Photo (Optional)</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                <Text style={styles.imageButtonText}>
                    {formData.image ? 'Change Photo' : 'Upload Photo'}
                </Text>
            </TouchableOpacity>
            
            {formData.image && (<Image source={{ uri: formData.image }} style={styles.imagePreview} />)}

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
                {loading ? (<ActivityIndicator color="#fff" />) : (<Text style={styles.submitText}>Submit Report</Text>)}
            </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f4f8' },
    content: { padding: 20, paddingBottom: 40 },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2,
        color: '#333',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        color: '#7f8c8d',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginTop: 20,
        marginBottom: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    imageButton: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#bbdefb',
    },
    imageButtonText: {
        color: '#1976d2',
        fontWeight: '600',
        fontSize: 16,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    submitButton: {
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    infoCard: {
        backgroundColor: '#e8f5e9',
        padding: 14,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4caf50',
        marginTop: 8,
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#424242',
        lineHeight: 14,
    },
    backButton: {
        backgroundColor: '#7f8c8d',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
        padding: 15,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    closeText: {
        fontSize: 22,
        fontWeight: '300',
        color: '#666',
        lineHeight: 22,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 5,
        overflow: 'hidden',
    },
    picker: {
        height: 55,
        color: '#000',
    },
    pickerItemText: {
        fontSize: 10,
        fontWeight: '100',
        color: '#333',
},
});