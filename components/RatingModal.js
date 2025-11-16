import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useTheme } from '../contexts/ThemeContext';
import BeanRating from './BeanRating';
import { calculateDistance } from '../utils/GeoUtils';
import { handleError, showSuccess } from '../utils/ErrorUtils';

const RatingModal = ({ visible, onClose, shop, userLocation }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    if (visible && shop) {
      loadExistingRating();
    }
  }, [visible, shop]);

  const loadExistingRating = async () => {
    if (!auth.currentUser || !shop) return;

    try {
      const shopRef = doc(db, 'coffee_shops', shop.id);
      const shopDoc = await getDoc(shopRef);

      if (shopDoc.exists()) {
        const data = shopDoc.data();
        const userRating = data.ratings?.[auth.currentUser.uid];

        if (userRating) {
          setExistingRating(userRating);
          setRating(userRating.score);
          setComment(userRating.comment || '');
        } else {
          setExistingRating(null);
          setRating(0);
          setComment('');
        }
      }
    } catch (error) {
      console.error('Error loading existing rating:', error);
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      Alert.alert('Not Logged In', 'You must be logged in to rate coffee shops.');
      return;
    }

    if (rating === 0) {
      Alert.alert('No Rating', 'Please select a rating before submitting.');
      return;
    }

    if (!shop) return;

    // Check 5-mile distance restriction
    if (userLocation && shop.location) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        shop.location.latitude,
        shop.location.longitude
      );

      if (distance > 5) {
        Alert.alert(
          'Too Far Away',
          'You can only rate coffee shops within 5 miles of your current location.',
          [{ text: 'OK' }]
        );
        return;
      }
    } else {
      Alert.alert(
        'Location Required',
        'Your location is needed to verify you are within 5 miles of this coffee shop.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const shopRef = doc(db, 'coffee_shops', shop.id);
      const shopDoc = await getDoc(shopRef);

      if (!shopDoc.exists()) {
        throw new Error('Shop not found');
      }

      const shopData = shopDoc.data();
      const ratings = shopData.ratings || {};

      // Add or update user's rating
      ratings[auth.currentUser.uid] = {
        score: rating,
        comment: comment.trim(),
        timestamp: new Date(),
        userId: auth.currentUser.uid,
      };

      // Calculate new average rating
      const ratingValues = Object.values(ratings).map(r => r.score);
      const averageRating = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length;
      const ratingCount = ratingValues.length;

      // Update shop document
      await updateDoc(shopRef, {
        ratings,
        averageRating,
        ratingCount,
        updatedAt: new Date(),
      });

      showSuccess(
        'Rating Submitted!',
        existingRating ? 'Your rating has been updated.' : 'Thanks for rating this coffee shop!'
      );

      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      handleError(error, 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {existingRating ? 'Update Your Rating' : 'Rate This Coffee Shop'}
            </Text>

            {shop && (
              <Text style={[styles.shopName, { color: theme.colors.text }]}>
                {shop.emoji} {shop.name}
              </Text>
            )}

            <View style={styles.ratingSection}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Your Rating
              </Text>
              <BeanRating
                rating={rating}
                onRate={setRating}
                interactive={true}
                size={40}
              />
            </View>

            <View style={styles.commentSection}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Comment (Optional)
              </Text>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
                ]}
                placeholder="Share your thoughts about this coffee shop..."
                placeholderTextColor={theme.colors.textSecondary}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
                {comment.length}/500
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  { backgroundColor: theme.colors.primary },
                  (isSubmitting || rating === 0) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {existingRating ? 'Update Rating' : 'Submit Rating'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  shopName: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    // backgroundColor set via theme
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RatingModal;
