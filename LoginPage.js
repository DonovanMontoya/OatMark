import React, {useState} from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {auth} from './services/firebase';
import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import {useTheme} from './contexts/ThemeContext';
import {createLoginPageStyles} from './styles/ThemeStyles';
import {isValidEmail, validatePassword} from './utils/ValidationUtils';
import {getFirebaseErrorMessage} from './utils/ErrorUtils';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [error, setError] = useState('');

    // Get theme context
    const {colors} = useTheme();

    // Create theme-aware styles
    const styles = createLoginPageStyles(colors);

    const validateEmailInput = () => {
        if (!email.trim()) {
            setError('Please enter your email address.');
            return false;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return false;
        }
        return true;
    };

    const handleSignUp = async () => {
        setError('');
        if (!validateEmailInput()) return;

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
            console.error('Signup error:', err);
            setError(getFirebaseErrorMessage(err?.code));
        } finally {
            setIsSigningUp(false);
        }
    };

    const handleLogin = async () => {
        setError('');
        if (!validateEmailInput()) return;

        if (!password.trim()) {
            setError('Please enter your password.');
            return;
        }

        setIsLoggingIn(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (err) {
            console.error('Login error:', err);
            setError(getFirebaseErrorMessage(err?.code));
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleForgotPassword = async () => {
        setError('');
        if (!validateEmailInput()) return;

        setIsResetting(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            Alert.alert(
                'Check your email',
                `A password reset link was sent to ${email.trim()}.`,
            );
        } catch (err) {
            console.error('Password reset error:', err);
            setError(getFirebaseErrorMessage(err?.code));
        } finally {
            setIsResetting(false);
        }
    };

    const isAnyLoading = isLoggingIn || isSigningUp || isResetting;

    return (
        <KeyboardAvoidingView
            style={styles.authContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Image source={require('./assets/icon.png')} style={styles.authLogo}/>
            <Text style={styles.authTitle}>Welcome to OatMark</Text>
            <Text style={styles.authSubtitle}>Please sign in to use OatMark</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.tertiaryText}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                }}
                editable={!isAnyLoading}
            />
            <TouchableOpacity activeOpacity={1} style={styles.passwordRow}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor={colors.tertiaryText}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setError('');
                    }}
                    editable={!isAnyLoading}
                />
                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                    <FontAwesome6
                        name={showPassword ? 'eye-slash' : 'eye'}
                        size={16}
                        color={colors.tertiaryText}
                        iconStyle="solid"
                    />
                </TouchableOpacity>
            </TouchableOpacity>

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
                <Text style={styles.authButtonSecondaryText}>
                    {isSigningUp ? 'Creating Account...' : 'Sign Up'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.forgotLink}
                onPress={handleForgotPassword}
                disabled={isAnyLoading}
            >
                <Text style={styles.forgotLinkText}>
                    {isResetting ? 'Sending reset email…' : 'Forgot password?'}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}
