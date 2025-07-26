import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {auth} from './services/firebase';
import {onAuthStateChanged} from 'firebase/auth';
import LoginPage from './LoginPage';
import HomeScreen from './HomeScreen';

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    if (!user) {
        return <LoginPage />;
    }
    return <HomeScreen />;
}
