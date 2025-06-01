import React, {useEffect, useState} from 'react';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';

const mockShops = [
    {
        id: 1,
        name: "Bean Flicker",
        oatMilk: "Califia",
        latitude: 37.78825,
        longitude: -122.4324,
        image: "https://example.com/image1.jpg",
    },
    {
        id: 2,
        name: "Bean Enthusiast",
        oatMilk: "Califia",
        latitude: 37.78825,
        longitude: -122.4324,
        image: "https://example.com/image1.jpg",
    },
];

export default function App() {
    const [location, setLocation] = useState(null);

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

    return (
        <View style={styles.container}>
            {location ? (
                <MapView
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
                    {/* 🔹 Show mock coffee shop markers */}
                    {mockShops.map(shop => (
                        <Marker
                            key={shop.id}
                            coordinate={{latitude: shop.latitude, longitude: shop.longitude}}
                            title={shop.name}
                            description={`Oat Milk: ${shop.oatMilk}`}
                        />
                    ))}
                </MapView>
            ) : (
                <Text style={styles.label}>Fetching location...</Text>
            )}
            <Text style={styles.label}>Welcome to OatMark</Text>

            {/* Show Mock Shot list*/}
            <FlatList
                data={mockShops}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.cardText}>
                            <Text style={styles.shopName}>{item.name}</Text>
                            <Text style={styles.oatMilk}>{item.oatMilk}</Text>
                        </View>
                    </View>
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
    oatMilk: {
        fontSize: 14,
        color: '#555',
    },
});