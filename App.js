import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {auth} from './services/firebase';
import {onAuthStateChanged} from 'firebase/auth';
import LoginPage from './LoginPage';
import HomeScreen from './HomeScreen';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { StatusBar, View } from 'react-native';

// StatusBar manager component that uses theme context
const StatusBarManager = () => {
    const { isDark } = useTheme();
    return <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />;
};

// Main app content that uses theme context
const AppContent = () => {
    const [user, setUser] = useState(null);
    
    useEffect(() => onAuthStateChanged(auth, setUser), []);
    
    return (
        <View style={{ flex: 1 }}>
            <StatusBarManager />
            {!user ? <LoginPage /> : <HomeScreen />}
        </View>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
