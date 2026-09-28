import React, {useRef, useState} from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
    const insets = useSafeAreaInsets();
    const passwordRef = useRef(null);
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
            style={{flex: 1, backgroundColor: colors.background}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={[styles.authContainer, {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24}]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            >
                <View style={styles.authForm}>
                    <Image source={require('./assets/icon.png')} style={styles.authLogo}/>
                    <Text style={styles.authTitle}>Welcome to OatMark</Text>
                    <Text style={styles.authSubtitle}>Find your next oat milk coffee.</Text>

                    <TextInput
                        style={styles.input}
                        accessibilityLabel="Email"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
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
                    <View style={styles.passwordRow}>
                        <TextInput
                            ref={passwordRef}
                            accessibilityLabel="Password"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="go"
                            onSubmitEditing={() => { if (!isAnyLoading) handleLogin(); }}
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
                    </View>

                    {error ? (
                        <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text>
                    ) : null}

                    <TouchableOpacity
                        accessibilityRole="button"
                        style={[styles.authButton, isAnyLoading && styles.authButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isAnyLoading}
                    >
                        <Text style={styles.authButtonText}>
                            {isLoggingIn ? 'Logging In...' : 'Log In'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityRole="button"
                        style={[styles.authButtonSecondary, isAnyLoading && styles.authButtonDisabled]}
                        onPress={handleSignUp}
                        disabled={isAnyLoading}
                    >
                        <Text style={styles.authButtonSecondaryText}>
                            {isSigningUp ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        accessibilityRole="button"
                        style={styles.forgotLink}
                        onPress={handleForgotPassword}
                        disabled={isAnyLoading}
                    >
                        <Text style={styles.forgotLinkText}>
                            {isResetting ? 'Sending reset email…' : 'Forgot password?'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
