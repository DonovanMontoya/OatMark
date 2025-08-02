import React, {useEffect, useRef, useState} from "react";
import {Animated, Easing, FlatList, Image, Modal, Platform, Text, TouchableOpacity, View,} from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import * as Location from "expo-location";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import {auth, db} from "./services/firebase";
import {collection, doc, onSnapshot, updateDoc} from "firebase/firestore";
import {getIdTokenResult} from "firebase/auth";
import HamburgerMenu from "./components/HamburgerMenu";
import SubmitShopScreen from "./components/SubmitShopScreen";
import SettingsScreen from "./components/SettingsScreen";
import PendingShopsScreen from "./components/PendingShopsScreen";
import AdminScreen from "./components/AdminScreen";
import AdjustPinModal from "./components/AdjustPinModal";
import {getFormattedUpcharge, getUpchargeColor} from "./utils/upchargeEmojis";
import {getDirections} from "./utils/MapLinks";
import {getDistanceMeters} from "./utils/GeoUtils";
import {useTheme} from "./contexts/ThemeContext";
import {createHomeScreenStyles} from "./styles/ThemeStyles";

export default function HomeScreen() {
    // Get theme context
    const {isDark, colors} = useTheme();

    // Create theme-aware styles
    const styles = createHomeScreenStyles(colors);

    // Dark mode map style
    const darkMapStyle = [
        {
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#8ec3b9"
                }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1a3646"
                }
            ]
        },
        {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#4b6878"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#64779e"
                }
            ]
        },
        {
            "featureType": "administrative.province",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#4b6878"
                }
            ]
        },
        {
            "featureType": "landscape.man_made",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#334e87"
                }
            ]
        },
        {
            "featureType": "landscape.natural",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#023e58"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#283d6a"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#6f9ba5"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#023e58"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#3C7680"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#304a7d"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#98a5be"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#2c6675"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
                {
                    "color": "#255763"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#b0d5ce"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#023e58"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#98a5be"
                }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#1d2c4d"
                }
            ]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#283d6a"
                }
            ]
        },
        {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#3a4762"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#0e1626"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#4e6d70"
                }
            ]
        }
    ];

    const [location, setLocation] = useState(null);
    const [shops, setShops] = useState([]);
    const mapRef = useRef(null);
    const [selectedShop, setSelectedShop] = useState(null);
    const [showSubmitShop, setShowSubmitShop] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPendingShops, setShowPendingShops] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdjustPinModal, setShowAdjustPinModal] = useState(false);

    // Animation values
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslateY = useRef(new Animated.Value(100)).current;
    const cardScale = useRef(new Animated.Value(0.9)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handleSubmitShop = () => {
        setShowSubmitShop(true);
    };

    const handleSettings = () => {
        setShowSettings(true);
    };

    const handlePendingShops = () => {
        setShowPendingShops(true);
    };

    const handleAdminPanel = () => {
        setShowAdminPanel(true);
    };


    // Animation functions
    const animateCardIn = () => {
        // Reset animation values
        cardOpacity.setValue(0);
        cardTranslateY.setValue(100);
        cardScale.setValue(0.9);

        // Run animations in parallel
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(cardTranslateY, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1.5)),
            }),
            Animated.timing(cardScale, {
                toValue: 1,
                duration: 350,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
        ]).start(() => {
            // Start the button pulse animation after the card appears
            startButtonPulse();
        });
    };

    const animateCardOut = (callback) => {
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
                easing: Easing.in(Easing.ease),
            }),
            Animated.timing(cardTranslateY, {
                toValue: 50,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.in(Easing.ease),
            }),
            Animated.timing(cardScale, {
                toValue: 0.95,
                duration: 250,
                useNativeDriver: true,
                easing: Easing.in(Easing.ease),
            }),
        ]).start(callback);
    };

    // Pulse animation for the 'directions' button
    const startButtonPulse = () => {
        // Reset to initial value
        buttonScale.setValue(1);

        // Create a sequence of animations
        Animated.sequence([
            // Wait a moment before starting
            Animated.delay(1000),
            // Create a loop
            Animated.loop(
                // Define the sequence for one pulse
                Animated.sequence([
                    // Scale up
                    Animated.timing(buttonScale, {
                        toValue: 1.08,
                        duration: 800,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.ease),
                    }),
                    // Scale back down
                    Animated.timing(buttonScale, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                        easing: Easing.in(Easing.ease),
                    }),
                    // Pause before the next pulse
                    Animated.delay(1000),
                ]),
                {iterations: 3} // Limit to 3 pulses
            ),
        ]).start();
    };


    useEffect(() => {
        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.error("Permission to access location was denied");
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation.coords);
        })();
    }, []);

    useEffect(() => {
        return onSnapshot(collection(db, "coffee_shops"), (querySnapshot) => {
            const shopsData = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                const geo = data.location;
                return {
                    id: doc.id,
                    ...data,
                    location: {latitude: geo.latitude, longitude: geo.longitude},
                };
            });

            if (location) {
                shopsData.sort(
                    (a, b) =>
                        getDistanceMeters(location, a.location) -
                        getDistanceMeters(location, b.location),
                );
            }

            setShops(shopsData);
        });
    }, [location]);

    // Check if the current user is an admin
    useEffect(() => {
        if (!auth.currentUser) {
            setIsAdmin(false);
            return;
        }

        const checkAdminStatus = async () => {
            try {
                const tokenResult = await getIdTokenResult(auth.currentUser);
                const adminStatus = !!tokenResult.claims.admin;
                setIsAdmin(adminStatus);
            } catch (error) {
                console.error("Failed to fetch admin status:", error);
                setIsAdmin(false);
            }
        };

        checkAdminStatus();
    }, []);

    // Handle shop location update
    const handleShopLocationUpdate = (updatedShop) => {
        // Update the shop in the local state
        const updatedShops = shops.map(shop => 
            shop.id === updatedShop.id ? updatedShop : shop
        );
        setShops(updatedShops);
        
        // Update the selected shop if it's the one being edited
        if (selectedShop && selectedShop.id === updatedShop.id) {
            setSelectedShop(updatedShop);
        }
    };

    return (
        <View style={styles.container}>
            <HamburgerMenu
                onSubmitShop={handleSubmitShop}
                onSettings={handleSettings}
                onPendingShops={handlePendingShops}
                onAdminPanel={handleAdminPanel}
            />

            {location ? (
                <MapView
                    showsPointsOfInterest
                    ref={mapRef}
                    style={styles.map}
                    showsUserLocation
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                    customMapStyle={
                        Platform.OS === 'android' && isDark ? darkMapStyle : []
                    }
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    onPress={(e) => {
                        const tapped = e.nativeEvent.coordinate;
                        const nearby = shops.find((shop) => {
                            const distance = getDistanceMeters(tapped, shop.location);
                            return distance < 100;
                        });
                        setSelectedShop(nearby || null);
                    }}
                >
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion(
                                    {
                                        latitude: location.latitude,
                                        longitude: location.longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    },
                                    500,
                                );
                            }
                        }}
                    >
                        <FontAwesome6
                            name="location-arrow"
                            size={20}
                            color={colors.locationButtonText}
                            iconStyle="solid"
                        />
                    </TouchableOpacity>
                    {shops.map((shop) => (
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
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContainer}
                renderItem={({item}) => {
                    const scaleAnim = new Animated.Value(1);

                    const handlePressIn = () => {
                        Animated.spring(scaleAnim, {
                            toValue: 0.96,
                            useNativeDriver: true,
                        }).start();
                    };

                    const handlePressOut = () => {
                        Animated.spring(scaleAnim, {
                            toValue: 1,
                            useNativeDriver: true,
                        }).start();
                    };

                    return (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            onPress={() => {
                                // Set the selected shop
                                setSelectedShop(item);

                                // Start entrance animation
                                animateCardIn();

                                // Animate map to the shop's location
                                if (mapRef.current) {
                                    mapRef.current.animateToRegion(
                                        {
                                            latitude: item.location.latitude,
                                            longitude: item.location.longitude,
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        },
                                        500,
                                    );
                                }
                            }}
                        >
                            <Animated.View style={[{transform: [{scale: scaleAnim}]}]}>
                                <View style={styles.card}>
                                    <View style={styles.cardImageContainer}>
                                        <View style={styles.emojiContainer}>
                                            <Text style={styles.emojiText}>{item.emoji || "☕"}</Text>
                                        </View>
                                        <View style={styles.imageOverlay}>
                                            <FontAwesome6
                                                name="store"
                                                size={16}
                                                color="white"
                                                iconStyle="solid"
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.shopName} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <View style={styles.upchargeContainer}>
                                                <Text
                                                    style={[
                                                        styles.upchargeEmojiText,
                                                        {color: getUpchargeColor(item.upCharge)},
                                                    ]}
                                                >
                                                    {getFormattedUpcharge(item.upCharge)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.cardDetails}>
                                            <View style={styles.oatMilkRow}>
                                                {/*<FontAwesome6*/}
                                                {/*  name="seedling"*/}
                                                {/*  size={12}*/}
                                                {/*  color="#4CAF50"*/}
                                                {/*  iconStyle="solid"*/}
                                                {/*/>*/}
                                                <Image source={require('./assets/splash-icon.png')}
                                                       style={{width: 30, height: 30}}/>

                                                <Text style={styles.oatMilk} numberOfLines={1}>
                                                    {item.oatMilk}
                                                </Text>
                                            </View>
                                            <View style={styles.locationRow}>
                                                <FontAwesome6
                                                    name="location-dot"
                                                    size={12}
                                                    color="#666"
                                                    iconStyle="solid"
                                                />
                                                <Text style={styles.distanceText}>
                                                    {location
                                                        ? `${(
                                                            getDistanceMeters(location, item.location) /
                                                            1000
                                                        ).toFixed(1)}km away`
                                                        : "Location unavailable"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                }}
            />
            {selectedShop && (
                <Animated.View
                    style={[
                        styles.selectedShopOverlay,
                        {
                            opacity: cardOpacity,
                            transform: [
                                {translateY: cardTranslateY},
                                {scale: cardScale}
                            ]
                        }
                    ]}
                >
                    {/* Header with shop name and close button */}
                    <View style={styles.iosCardHeader}>
                        <View style={styles.shopIconContainer}>
                            <FontAwesome6
                                name="store"
                                size={20}
                                color="#007AFF"
                                iconStyle="solid"
                            />
                        </View>
                        <Text style={styles.iosShopName}>{selectedShop.name}</Text>
                        <TouchableOpacity
                            style={styles.iosCloseButton}
                            onPress={() => {
                                // Run exit animation and then set selectedShop to null
                                animateCardOut(() => setSelectedShop(null));
                            }}
                        >
                            <FontAwesome6
                                name="xmark"
                                size={16}
                                color="#8E8E93"
                                iconStyle="solid"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.iosDivider}/>

                    {/* Shop details */}
                    <View style={styles.iosCardContent}>
                        {/* Oat Milk Row */}
                        <View style={styles.iosDetailRow}>
                            {/*<FontAwesome6*/}
                            {/*  name="seedling"*/}
                            {/*  size={16}*/}
                            {/*  color="#4CAF50"*/}
                            {/*  iconStyle="solid"*/}
                            {/*/>*/}
                            <Image source={require('./assets/splash-icon.png')}
                                   style={{width: 30, height: 30, marginLeft: -5, marginRight: -6}}/>
                            <Text style={styles.iosDetailText}>
                                <Text style={styles.iosDetailLabel}>Oat Milk: </Text>
                                {selectedShop.oatMilk}
                            </Text>
                        </View>

                        {/* Upcharge Row */}
                        <View style={styles.iosDetailRow}>
                            <FontAwesome6
                                name="money-bill"
                                size={16}
                                color="#8E8E93"
                                iconStyle="solid"
                            />
                            <Text style={styles.iosDetailText}>
                                <Text style={styles.iosDetailLabel}>Upcharge: </Text>
                                <Text style={{color: getUpchargeColor(selectedShop.upCharge)}}>
                                    {getFormattedUpcharge(selectedShop.upCharge)}
                                </Text>
                            </Text>
                        </View>

                        {/* Distance Row */}
                        {location && (
                            <View style={styles.iosDetailRow}>
                                <FontAwesome6
                                    name="location-dot"
                                    size={16}
                                    color="#FF9500"
                                    iconStyle="solid"
                                />
                                <Text style={styles.iosDetailText}>
                                    <Text style={styles.iosDetailLabel}>Distance: </Text>
                                    {(getDistanceMeters(location, selectedShop.location) / 1000).toFixed(1)}km away
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Directions Button */}
                    <TouchableOpacity
                        style={styles.iosDirectionsButton}
                        onPress={() => getDirections(selectedShop)}
                        activeOpacity={0.7}
                    >
                        <Animated.View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                transform: [{scale: buttonScale}]
                            }}
                        >
                            <FontAwesome6
                                name="route"
                                size={16}
                                color="#FFFFFF"
                                iconStyle="solid"
                                style={styles.iosButtonIcon}
                            />
                            <Text style={styles.iosDirectionsButtonText}>Get Directions</Text>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Adjust Pin Button (Admin Only) */}
                    {isAdmin && (
                        <TouchableOpacity
                            style={[styles.iosDirectionsButton, { marginTop: 10, backgroundColor: '#FF9500' }]}
                            onPress={() => {
                                setShowAdjustPinModal(true);
                            }}
                            activeOpacity={0.7}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <FontAwesome6
                                    name="location-crosshairs"
                                    size={16}
                                    color="#FFFFFF"
                                    iconStyle="solid"
                                    style={styles.iosButtonIcon}
                                />
                                <Text style={styles.iosDirectionsButtonText}>Adjust Pin Location</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            )}

            <Modal
                animationType="slide"
                transparent={false}
                visible={showSubmitShop}
                onRequestClose={() => setShowSubmitShop(false)}
            >
                <SubmitShopScreen onClose={() => setShowSubmitShop(false)}/>
            </Modal>

            <Modal
                animationType="slide"
                transparent={false}
                visible={showSettings}
                onRequestClose={() => setShowSettings(false)}
            >
                <SettingsScreen onClose={() => setShowSettings(false)}/>
            </Modal>

            <Modal
                animationType="slide"
                transparent={false}
                visible={showPendingShops}
                onRequestClose={() => setShowPendingShops(false)}
            >
                <PendingShopsScreen onClose={() => setShowPendingShops(false)}/>
            </Modal>

            <Modal
                animationType="slide"
                transparent={false}
                visible={showAdminPanel}
                onRequestClose={() => setShowAdminPanel(false)}
            >
                <AdminScreen onClose={() => setShowAdminPanel(false)}/>
            </Modal>

            <Modal
                animationType="slide"
                transparent={false}
                visible={showAdjustPinModal}
                onRequestClose={() => setShowAdjustPinModal(false)}
            >
                {selectedShop && (
                    <AdjustPinModal
                        shop={selectedShop}
                        collection="coffee_shops"
                        onClose={() => setShowAdjustPinModal(false)}
                        onSave={handleShopLocationUpdate}
                    />
                )}
            </Modal>
        </View>
    );
}
