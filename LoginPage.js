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
    const [isLoading, setIsLoading] = useState(false);

    // Get theme context
    const {colors} = useTheme();

    // Create theme-aware styles
    const styles = createLoginPageStyles(colors);

    const handleSignUp = async () => {
        // Validate inputs
        if (!isValidEmail(email)) {
            handleAuthError({ code: 'auth/invalid-email' }, 'signup');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            handleAuthError({ 
                code: 'auth/weak-password',
                message: passwordValidation.messages.join(', ')
            }, 'signup');
            return;
        }

        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (err) {
            handleAuthError(err, 'signup');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        // Validate inputs
        if (!isValidEmail(email)) {
            handleAuthError({ code: 'auth/invalid-email' }, 'login');
            return;
        }

        if (!password.trim()) {
            handleAuthError({ code: 'auth/wrong-password' }, 'login');
            return;
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (err) {
            handleAuthError(err, 'login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.authContainer}>
            <Image source={require('./assets/icon.png')} style={styles.authLogo}/>
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

            <TouchableOpacity 
                style={[styles.authButton, isLoading && styles.authButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.authButtonText}>
                    {isLoading ? 'Logging In...' : 'Log In'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.authButtonSecondary, isLoading && styles.authButtonDisabled]} 
                onPress={handleSignUp}
                disabled={isLoading}
            >
                <Text style={styles.authButtonText}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
