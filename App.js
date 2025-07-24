import React, {useEffect, useRef, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import styles from './styles';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6'
import {db} from './services/firebase';
import {collection, onSnapshot} from 'firebase/firestore';


export default function App() {
    const [location, setLocation] = useState(null);
    const [shops, setShops] = useState([]);
    const mapRef = useRef(null);

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
