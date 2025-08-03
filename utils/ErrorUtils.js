/**
 * Centralized error handling utilities
 * Provides consistent error messaging and reporting across the app
 */

import { Alert } from 'react-native';

/**
 * Maps Firebase error codes to user-friendly messages
 */
const FIREBASE_ERROR_MESSAGES = {
  // Authentication errors
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'auth/invalid-credential': 'Invalid login credentials. Please check your email and password.',
  
  // Firestore errors
  'firestore/permission-denied': 'You don\'t have permission to perform this action.',
  'firestore/unavailable': 'Service temporarily unavailable. Please try again.',
  'firestore/deadline-exceeded': 'Request timed out. Please try again.',
  'firestore/resource-exhausted': 'Too many requests. Please try again later.',
  'firestore/unauthenticated': 'Please log in to continue.',
  
  // Location errors
  'location/permission-denied': 'Location permission is required to use this feature.',
  'location/position-unavailable': 'Unable to determine your location. Please try again.',
  'location/timeout': 'Location request timed out. Please try again.',
  
  // Network errors
  'network/offline': 'You appear to be offline. Please check your internet connection.',
  'network/timeout': 'Request timed out. Please try again.',
  
  // Default fallback
  'unknown': 'An unexpected error occurred. Please try again.'
};

/**
 * Gets a user-friendly error message from a Firebase error code
 * @param {string} errorCode - Firebase error code (e.g., 'auth/user-not-found')
 * @returns {string} User-friendly error message
 */
export const getFirebaseErrorMessage = (errorCode) => {
  if (!errorCode || typeof errorCode !== 'string') {
    return FIREBASE_ERROR_MESSAGES.unknown;
  }
  
  return FIREBASE_ERROR_MESSAGES[errorCode] || FIREBASE_ERROR_MESSAGES.unknown;
};

/**
 * Handles errors with consistent logging and user feedback
 * @param {Error|string} error - Error object or error message
 * @param {string} userMessage - Optional user-friendly message
 * @param {boolean} showAlert - Whether to show alert to user (default: true)
 * @param {object} context - Additional context for logging
 */
export const handleError = (error, userMessage = null, showAlert = true, context = {}) => {
  // Log the error with context for debugging
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: error?.message || error,
    code: error?.code,
    context,
    stack: error?.stack
  };
  
  console.error('Application Error:', errorInfo);
  
  // Determine the message to show to the user
  let displayMessage = userMessage;
  
  if (!displayMessage) {
    if (error?.code) {
      displayMessage = getFirebaseErrorMessage(error.code);
    } else {
      displayMessage = FIREBASE_ERROR_MESSAGES.unknown;
    }
  }
  
  // Show alert to user if requested
  if (showAlert) {
    Alert.alert('Error', displayMessage, [
      { text: 'OK', style: 'default' }
    ]);
  }
  
  // In production, you would send this to a crash reporting service like Crashlytics
  // For now, we'll just log it
  
  return displayMessage;
};

/**
 * Handles authentication errors specifically
 * @param {Error} error - Firebase auth error
 * @param {string} action - Action being performed (login, signup, etc.)
 */
export const handleAuthError = (error, action = 'authenticate') => {
  const context = { action, errorCode: error?.code };
  const userMessage = getFirebaseErrorMessage(error?.code);
  
  handleError(error, userMessage, true, context);
};

/**
 * Handles location errors specifically
 * @param {Error} error - Location error
 * @param {string} action - Action being performed
 */
export const handleLocationError = (error, action = 'get location') => {
  let errorCode = 'unknown';
  
  if (error?.code === 1) {
    errorCode = 'location/permission-denied';
  } else if (error?.code === 2) {
    errorCode = 'location/position-unavailable';
  } else if (error?.code === 3) {
    errorCode = 'location/timeout';
  }
  
  const context = { action, errorCode, nativeError: error };
  const userMessage = getFirebaseErrorMessage(errorCode);
  
  handleError(error, userMessage, true, context);
};

/**
 * Handles network errors specifically
 * @param {Error} error - Network error
 * @param {string} action - Action being performed
 */
export const handleNetworkError = (error, action = 'network request') => {
  const isOffline = !navigator?.onLine;
  const errorCode = isOffline ? 'network/offline' : 'network/timeout';
  
  const context = { action, errorCode, isOffline };
  const userMessage = getFirebaseErrorMessage(errorCode);
  
  handleError(error, userMessage, true, context);
};

/**
 * Shows a success message to the user
 * @param {string} title - Success title
 * @param {string} message - Success message
 * @param {function} onPress - Optional callback when OK is pressed
 */
export const showSuccess = (title, message, onPress = null) => {
  Alert.alert(title, message, [
    { 
      text: 'OK', 
      style: 'default',
      onPress: onPress 
    }
  ]);
};

/**
 * Shows a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Optional callback when cancelled
 * @param {string} confirmText - Text for confirm button (default: 'OK')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 */
export const showConfirmation = (
  title, 
  message, 
  onConfirm, 
  onCancel = null,
  confirmText = 'OK',
  cancelText = 'Cancel'
) => {
  Alert.alert(title, message, [
    {
      text: cancelText,
      style: 'cancel',
      onPress: onCancel
    },
    {
      text: confirmText,
      style: 'default',
      onPress: onConfirm
    }
  ]);
};

/**
 * Shows a destructive confirmation dialog (for delete actions, etc.)
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Optional callback when cancelled
 * @param {string} confirmText - Text for confirm button (default: 'Delete')
 */
export const showDestructiveConfirmation = (
  title,
  message,
  onConfirm,
  onCancel = null,
  confirmText = 'Delete'
) => {
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel
    },
    {
      text: confirmText,
      style: 'destructive',
      onPress: onConfirm
    }
  ]);
};