import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  ActivityIndicator,
  Linking,
  Platform,
  Easing,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import styles from "./styles";
import { db } from "./services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import HamburgerMenu from "./components/HamburgerMenu";
import SubmitShopScreen from "./components/SubmitShopScreen";
import SettingsScreen from "./components/SettingsScreen";
import { getFormattedUpcharge, getUpchargeColor } from "./utils/upchargeEmojis";

export default function HomeScreen() {
  const [location, setLocation] = useState(null);
  const [shops, setShops] = useState([]);
  const mapRef = useRef(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showSubmitShop, setShowSubmitShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  
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

  const handleImageLoadStart = (shopId) => {
    setImageLoadingStates((prev) => ({ ...prev, [shopId]: true }));
  };

  const handleImageLoadEnd = (shopId) => {
    setImageLoadingStates((prev) => ({ ...prev, [shopId]: false }));
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
        { iterations: 3 } // Limit to 3 pulses
      ),
    ]).start();
  };
  
  const getDirections = (shop) => {
    if (!shop || !shop.location) return;
    
    const { latitude, longitude } = shop.location;
    const label = encodeURIComponent(shop.name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`,
    });
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const browserUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          return Linking.openURL(browserUrl);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  function getDistanceMeters(a, b) {
    const R = 6371000; // Radius of Earth in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.longitude);
    const aVal =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLat / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  }

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
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
          location: { latitude: geo.latitude, longitude: geo.longitude },
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

  return (
    <View style={styles.container}>
      <HamburgerMenu
        onSubmitShop={handleSubmitShop}
        onSettings={handleSettings}
      />

      {location ? (
        <MapView
          showsPointsOfInterest
          ref={mapRef}
          style={styles.map}
          showsUserLocation
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
              color="white"
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
        renderItem={({ item }) => {
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
              <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.card}>
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.image}
                      onLoadStart={() => handleImageLoadStart(item.id)}
                      onLoadEnd={() => handleImageLoadEnd(item.id)}
                      onError={() => handleImageLoadEnd(item.id)}
                    />
                    {imageLoadingStates[item.id] && (
                      <View style={styles.imageLoadingOverlay}>
                        <ActivityIndicator size="small" color="#666" />
                      </View>
                    )}
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
                            { color: getUpchargeColor(item.upCharge) },
                          ]}
                        >
                          {getFormattedUpcharge(item.upCharge)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cardDetails}>
                      <View style={styles.oatMilkRow}>
                        <FontAwesome6
                          name="seedling"
                          size={12}
                          color="#4CAF50"
                          iconStyle="solid"
                        />
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
                { translateY: cardTranslateY },
                { scale: cardScale }
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
          <View style={styles.iosDivider} />
          
          {/* Shop details */}
          <View style={styles.iosCardContent}>
            {/* Oat Milk Row */}
            <View style={styles.iosDetailRow}>
              <FontAwesome6
                name="seedling"
                size={16}
                color="#4CAF50"
                iconStyle="solid"
              />
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
                <Text style={{ color: getUpchargeColor(selectedShop.upCharge) }}>
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
                transform: [{ scale: buttonScale }]
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
        </Animated.View>
      )}

      <Modal
        animationType="slide"
        transparent={false}
        visible={showSubmitShop}
        onRequestClose={() => setShowSubmitShop(false)}
      >
        <SubmitShopScreen onClose={() => setShowSubmitShop(false)} />
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>
    </View>
  );
}
