import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {auth} from './services/firebase';
import {onAuthStateChanged} from 'firebase/auth';
import LoginPage from './LoginPage';
import HomeScreen from './HomeScreen';
import {ThemeProvider, useTheme} from './contexts/ThemeContext';
import {UnitsProvider} from './contexts/UnitsContext';
import {createThemeStyles} from './styles/ThemeStyles';
import {fontAssets, fonts} from './styles/tokens';
import {useFonts} from 'expo-font';
import {ActivityIndicator, StatusBar, Text, TextInput, View} from 'react-native';

// Best-effort global default body font. Stylesheets set fontFamily explicitly
// everywhere it matters; this is just a safety net for any stray <Text>.
try {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = [{fontFamily: fonts.body}, Text.defaultProps.style];
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.style = [{fontFamily: fonts.body}, TextInput.defaultProps.style];
} catch (e) {
    // Some RN/React versions freeze defaultProps — non-fatal, styles cover us.
}

// StatusBar manager component that uses theme context
const StatusBarManager = () => {
    const {isDark} = useTheme();
    return <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'}/>;
};

// Main app content that uses theme context
const AppContent = () => {
    const [user, setUser] = useState(null);
    const {colors} = useTheme();
    const styles = createThemeStyles(colors);

    const [fontsLoaded, fontError] = useFonts(fontAssets);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    // Hold on a warm cream/espresso splash until type is ready (or has failed).
    if (!fontsLoaded && !fontError) {
        return (
            <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
                <StatusBarManager/>
                <ActivityIndicator size="large" color={colors.accent}/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBarManager/>
            {!user ? <LoginPage/> : <HomeScreen/>}
        </View>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <UnitsProvider>
                <AppContent/>
            </UnitsProvider>
        </ThemeProvider>
    );
}
