import React, { useState } from 'react';
import { View, Image, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles';
import { auth } from './services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Sign-up error', err);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Login error', err);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Image source={require('./assets/icon.png')} style={styles.authLogo} />
      <Text style={styles.authTitle}>Welcome to OatMark</Text>
      <Text style={styles.authSubtitle}>Please sign in to use OatMark</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.authButton} onPress={handleLogin}>
        <Text style={styles.authButtonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.authButtonSecondary} onPress={handleSignUp}>
        <Text style={styles.authButtonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
