import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Image, Text, TextInput, TouchableOpacity, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import styles from './styles';
import {auth, db} from './services/firebase';
import {collection, onSnapshot} from 'firebase/firestore';

import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut,} from 'firebase/auth';

export default function App() {
    const [location, setLocation] = useState(null);
    const [shops, setShops] = useState([]);
    const mapRef = useRef(null);
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("User registered!");
        } catch (err) {
            console.error("Sign-up error", err);
        }
    };

    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in!");
        } catch (err) {
            console.error("Login error", err);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('Logged out!');
        } catch (err) {
            console.error('Logout error', err);
        }
    };

    useEffect(() => {
        return onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
    }, []);

    useEffect(() => {
        (async () => {
            // Request permission to access location
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            // Get the current location
            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
        })();
    }, []);

    useEffect(() => {
        return onSnapshot(collection(db, 'coffee_shops'), (querySnapshot) => {
            const shopsData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const geo = data.location; // Firestore GeoPoint
                return {
                    id: doc.id,
                    ...data,
                    location: { latitude: geo.latitude, longitude: geo.longitude },
                };
            });
            setShops(shopsData);
        });
    }, []);

    if (!user) {
        return (
            <View style={styles.authContainer}>
                <Image
                    source={require('./assets/icon.png')}
                    style={styles.authLogo}
                />
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

                <TouchableOpacity style={styles.authButton} onPress={() => handleLogin(email, password)}>
                    <Text style={styles.authButtonText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.authButtonSecondary} onPress={() => handleSignUp(email, password)}>
                    <Text style={styles.authButtonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            {location ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    showsUserLocation={true}
                    followsUserLocation={true}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                >
                <TouchableOpacity style={styles.locationButton} onPress={() => {
                    if (mapRef.current) {
                        mapRef.current.animateToRegion(
                            {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            },
                            500
                        );
                    }
                }}>
                    <FontAwesome6 name="location-arrow" size={20} color="white" iconStyle='solid' />
                </TouchableOpacity>
                    {shops.map(shop => (
                        <Marker
                            key={shop.id}
                            coordinate={{
                                latitude: shop.location.latitude,
                                longitude: shop.location.longitude,
                            }}
                            title={shop.name}
                            description={`Oat Milk: ${shop.oatMilk}`}
                        />
                    ))}
                </MapView>
            ) : (
                <Text style={styles.label}>Fetching location...</Text>
            )}
            <Text style={styles.label}>Welcome to OatMark</Text>

            <FlatList
                data={shops}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                    <TouchableOpacity
                        onPress={() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion(
                                    {
                                        latitude: item.location.latitude,
                                        longitude: item.location.longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    },
                                    500
                                );
                            }
                        }}
                    >
                        <View style={styles.card}>
                            <Image source={{uri: item.image}} style={styles.image}/>
                            <View style={styles.cardText}>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.shopName}>{item.name}</Text>
                                    <Text style={styles.oatMilk}>{item.oatMilk}</Text>
                                    <Text style={styles.location}>
                                        {`${item.location.latitude.toFixed(6)}, ${item.location.longitude.toFixed(6)}`}
                                    </Text>
                                </View>
                                <Text style={styles.upCharge}>{`+${item.upCharge}`}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
