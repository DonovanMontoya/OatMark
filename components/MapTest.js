import React, {useRef, useState} from 'react';
import {Alert, Platform, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import FreeMapView from './FreeMapView';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

const MapTest = () => {
    const mapRef = useRef(null);
    const [isDark, setIsDark] = useState(false);
    const [userLocation, setUserLocation] = useState({
        latitude: 37.7749,
        longitude: -122.4194,
    });

    const testMarkers = [
        {
            key: 'test1',
            coordinate: {latitude: 37.7749, longitude: -122.4194},
            title: 'San Francisco',
            description: 'Test Marker 1',
        },
        {
            key: 'test2',
            coordinate: {latitude: 37.7849, longitude: -122.4094},
            title: 'Test Location 2',
            description: 'Another test marker',
        },
    ];

    const handleMapPress = (event) => {
        const coordinate = event.nativeEvent.coordinate;
        Alert.alert(
            'Map Pressed',
            `Latitude: ${coordinate.latitude.toFixed(4)}\nLongitude: ${coordinate.longitude.toFixed(4)}`
        );
    };

    const centerOnUser = () => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Free Map Test</Text>

            {/* Map Container with proper structure to avoid child parent error */}
            <View style={styles.mapWrapper}>
                <FreeMapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation
                    isDark={isDark}
                    markers={testMarkers}
                    onPress={handleMapPress}
                />

                {/* Controls positioned absolutely outside MapView */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.locationButton]}
                    onPress={centerOnUser}
                >
                    <FontAwesome6
                        name="location-arrow"
                        size={20}
                        color="#007AFF"
                        iconStyle="solid"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.themeButton]}
                    onPress={toggleTheme}
                >
                    <FontAwesome6
                        name={isDark ? "sun" : "moon"}
                        size={20}
                        color="#007AFF"
                        iconStyle="solid"
                    />
                </TouchableOpacity>
            </View>

            {/* Info Panel */}
            <View style={styles.infoPanel}>
                <Text style={styles.infoText}>
                    Platform: {Platform.OS}
                </Text>
                <Text style={styles.infoText}>
                    Theme: {isDark ? 'Dark' : 'Light'}
                </Text>
                <Text style={styles.infoText}>
                    Map Source: OpenStreetMap (Free)
                </Text>
                <Text style={styles.infoText}>
                    Markers: {testMarkers.length}
                </Text>
            </View>

            {/* Test Instructions */}
            <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>Test Instructions:</Text>
                <Text style={styles.instructionText}>
                    • Tap anywhere on map to see coordinates
                </Text>
                <Text style={styles.instructionText}>
                    • Use location button to center map
                </Text>
                <Text style={styles.instructionText}>
                    • Toggle theme to test dark/light tiles
                </Text>
                <Text style={styles.instructionText}>
                    • Pinch to zoom, drag to pan
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333',
    },
    mapWrapper: {
        height: 300,
        marginHorizontal: 20,
        marginBottom: 20,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    map: {
        flex: 1,
    },
    controlButton: {
        position: 'absolute',
        width: 50,
        height: 50,
        backgroundColor: 'white',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    locationButton: {
        bottom: 20,
        right: 20,
    },
    themeButton: {
        bottom: 20,
        right: 80,
    },
    infoPanel: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    infoText: {
        fontSize: 16,
        marginVertical: 2,
        color: '#666',
    },
    instructions: {
        backgroundColor: 'white',
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    instructionText: {
        fontSize: 14,
        marginVertical: 2,
        color: '#666',
    },
});

export default MapTest;
