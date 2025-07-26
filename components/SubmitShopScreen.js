import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

const SubmitShopScreen = ({ onClose }) => {
  const [shopName, setShopName] = useState('');
  const [oatMilk, setOatMilk] = useState('');
  const [upCharge, setUpCharge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!shopName.trim() || !oatMilk.trim() || !upCharge.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location
      let locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status !== 'granted') {
        Alert.alert('Error', 'Location permission is required to submit a shop');
        setIsSubmitting(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      // Add shop to Firestore
      await addDoc(collection(db, 'coffee_shops'), {
        name: shopName.trim(),
        oatMilk: oatMilk.trim(),
        upCharge: upCharge.trim(),
        image: imageUrl.trim() || 'https://via.placeholder.com/60x60?text=Coffee',
        location: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        createdAt: new Date(),
      });

      Alert.alert(
        'Success!',
        'Coffee shop submitted successfully!',
        [{ text: 'OK', onPress: onClose }]
      );

      // Reset form
      setShopName('');
      setOatMilk('');
      setUpCharge('');
      setImageUrl('');
    } catch (error) {
      console.error('Error submitting shop:', error);
      Alert.alert('Error', 'Failed to submit coffee shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6 name="xmark" size={20} color="#333" iconStyle="solid" />
        </TouchableOpacity>
        <Text style={styles.title}>Submit Coffee Shop</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Name *</Text>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
            placeholder="Enter coffee shop name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Oat Milk Brand/Type *</Text>
          <TextInput
            style={styles.input}
            value={oatMilk}
            onChangeText={setOatMilk}
            placeholder="e.g., Oatly, Minor Figures, House-made"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upcharge *</Text>
          <TextInput
            style={styles.input}
            value={upCharge}
            onChangeText={setUpCharge}
            placeholder="e.g., $0.50, $0.75, Free"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor="#999"
            keyboardType="url"
          />
        </View>

        <Text style={styles.note}>
          * Location will be automatically set to your current position
        </Text>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Shop'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 5,
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginVertical: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default SubmitShopScreen;
