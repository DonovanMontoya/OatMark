import React, {useEffect, useRef, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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
                                    1000
                                );
                            }
                        }}
                    >
                        <View style={styles.card}>
                            <Image source={{uri: item.image}} style={styles.image}/>
                            <View style={styles.cardText}>
                                <Text style={styles.shopName}>{item.name}</Text>
                                <Text style={styles.oatMilk}>{item.oatMilk}</Text>
                                <Text style={styles.upCharge}>Upcharge for Alternative Milk: {item.upCharge}</Text>
                                <Text style={styles.location}>
                                    {`${item.location.latitude.toFixed(6)}, ${item.location.longitude.toFixed(6)}`}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '50%',
    },
    label: {
        textAlign: 'center',
        marginVertical: 5,
        fontSize: 18,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    cardText: {
        marginLeft: 10,
    },
    shopName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
    upCharge: {
        fontSize: 15,
        color: '#666',
    },
    oatMilk: {
        fontSize: 14,
        color: '#555',
    },
});
