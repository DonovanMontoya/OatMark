import React, {useEffect, useState} from 'react';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import {StyleSheet, Text, View} from 'react-native';

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
                />
                ) : (
                <Text style={styles.label}>Fetching location...</Text>
    )}
    <Text style={styles.label}>Welcome to OatMark</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '58%',
    },
    label: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 18,
    },
});