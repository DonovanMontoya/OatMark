import React, {useState} from 'react';
import {Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {auth} from './services/firebase';
import {createUserWithEmailAndPassword, signInWithEmailAndPassword,} from 'firebase/auth';
import {useTheme} from './contexts/ThemeContext';
import {createLoginPageStyles} from './styles/ThemeStyles';
import {isValidEmail, validatePassword} from './utils/ValidationUtils';
import {handleAuthError} from './utils/ErrorUtils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [error, setError] = useState('');

    // Get theme context
    const {colors} = useTheme();

    // Create theme-aware styles
    const styles = createLoginPageStyles(colors);

    const handleSignUp = async () => {
        // Clear any previous errors
        setError('');

        // Validate inputs
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!password.trim()) {
            setError('Please enter a password.');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.messages.join(' '));
            return;
        }

        setIsSigningUp(true);
        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (err) {
            handleAuthError(err, 'signup');
        } finally {
            setIsSigningUp(false);
        }
    };

    const handleLogin = async () => {
        // Clear any previous errors
        setError('');

        // Validate inputs
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!password.trim()) {
            setError('Please enter your password.');
            return;
        }

        setIsLoggingIn(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (err) {
            handleAuthError(err, 'login');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const isAnyLoading = isLoggingIn || isSigningUp;

    return (
        <View style={styles.authContainer}>
            <Image source={require('./assets/icon.png')} style={styles.authLogo}/>
            <Text style={styles.authTitle}>Welcome to OatMark</Text>
            <Text style={styles.authSubtitle}>Please sign in to use OatMark</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                }}
                editable={!isAnyLoading}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                }}
                editable={!isAnyLoading}
            />

            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <TouchableOpacity
                style={[styles.authButton, isAnyLoading && styles.authButtonDisabled]}
                onPress={handleLogin}
                disabled={isAnyLoading}
            >
                <Text style={styles.authButtonText}>
                    {isLoggingIn ? 'Logging In...' : 'Log In'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.authButtonSecondary, isAnyLoading && styles.authButtonDisabled]}
                onPress={handleSignUp}
                disabled={isAnyLoading}
            >
                <Text style={styles.authButtonText}>
                    {isSigningUp ? 'Creating Account...' : 'Sign Up'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
