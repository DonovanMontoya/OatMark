import React, {useEffect, useRef, useState} from "react";
import {Alert, Animated, Easing, FlatList, Image, Modal, Platform, Share, Text, TouchableOpacity, View,} from "react-native";
import MapView, {Marker} from "react-native-maps";
import FreeMapView from "./components/FreeMapView";
import * as Location from "expo-location";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import NetInfo from "@react-native-community/netinfo";
import {auth, db} from "./services/firebase";
import {arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, setDoc, updateDoc,} from "firebase/firestore";
import {getIdTokenResult} from "firebase/auth";
import HamburgerMenu from "./components/HamburgerMenu";
import SubmitShopScreen from "./components/SubmitShopScreen";
import SettingsScreen from "./components/SettingsScreen";
import PendingShopsScreen from "./components/PendingShopsScreen";
import AdminScreen from "./components/AdminScreen";
import AdjustPinModal from "./components/AdjustPinModal";
import ManageShopModal from "./components/ManageShopModal";
import ShopCard from "./components/ShopCard";
import {getFormattedUpcharge, getUpchargeColor} from "./utils/upchargeEmojis";
import {getDirections} from "./utils/MapLinks";
import {getDistanceMeters} from "./utils/GeoUtils";
import {useTheme} from "./contexts/ThemeContext";
import {createHomeScreenStyles} from "./styles/ThemeStyles";
import {isValidLocation} from "./utils/ValidationUtils";
import {handleError, handleLocationError} from "./utils/ErrorUtils";
import {loadShopsFromCache, saveShopsToCache, loadFavoritesFromCache, saveFavoritesToCache} from "./services/ShopCache";

export default function HomeScreen() {
  // Get theme context
  const { isDark, colors } = useTheme();

  // Create theme-aware styles
  const styles = createHomeScreenStyles(colors);

  // Dark mode map style
  const darkMapStyle = [
    {
      elementType: "geometry",
      stylers: [
        {
          color: "#1d2c4d",
        },
      ],
    },
    {
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#8ec3b9",
        },
      ],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#1a3646",
        },
      ],
    },
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#4b6878",
        },
      ],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#64779e",
        },
      ],
    },
    {
      featureType: "administrative.province",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#4b6878",
        },
      ],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#334e87",
        },
      ],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [
        {
          color: "#023e58",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [
        {
          color: "#283d6a",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#6f9ba5",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#1d2c4d",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#023e58",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#3C7680",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        {
          color: "#304a7d",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#98a5be",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#1d2c4d",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [
        {
          color: "#2c6675",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#255763",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#b0d5ce",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#023e58",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#98a5be",
        },
      ],
    },
    {
      featureType: "transit",
      elementType: "labels.text.stroke",
      stylers: [
        {
          color: "#1d2c4d",
        },
      ],
    },
    {
      featureType: "transit.line",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#283d6a",
        },
      ],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [
        {
          color: "#3a4762",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#0e1626",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [
        {
          color: "#4e6d70",
        },
      ],
    },
  ];

  const [location, setLocation] = useState(null);
  const [shops, setShops] = useState([]);
  const mapRef = useRef(null);
  const overlayMapRef = useRef(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [showSubmitShop, setShowSubmitShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPendingShops, setShowPendingShops] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdjustPinModal, setShowAdjustPinModal] = useState(false);
  const [showManageShopModal, setShowManageShopModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(true);

  // Animation values
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(100)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const adminButtonScale = useRef(new Animated.Value(1)).current;
  
  // Store animation references for cleanup
  const animationRefs = useRef([]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      // Stop all running animations
      animationRefs.current.forEach(animation => {
        if (animation && typeof animation.stop === 'function') {
          animation.stop();
        }
      });
      animationRefs.current = [];
    };
  }, []);

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

  const handleShare = async () => {
    if (!selectedShop) return;

    try {
      const shareContent = {
        title: `Check out ${selectedShop.name}!`,
        message: `I found this great coffee shop: ${selectedShop.name} ${selectedShop.emoji || "☕"}\n\n${selectedShop.upCharge ? `Oat milk upcharge: ${getFormattedUpcharge(selectedShop.upCharge)}` : "No oat milk upcharge info available"}\n\nFound on OatMark - the app for oat milk lovers!`,
        url: selectedShop.location ? `https://maps.google.com/?q=${selectedShop.location.latitude},${selectedShop.location.longitude}` : undefined,
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        console.log("Content shared successfully");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("Error", "Failed to share. Please try again.");
    }
  };

  const handleManageShop = () => {
    if (!selectedShop || !isAdmin) return;
    setShowManageShopModal(true);
  };

  const handleShopUpdated = (updatedShop) => {
    // Update the shop in the local state
    const updatedShops = shops.map((shop) =>
      shop.id === updatedShop.id ? updatedShop : shop,
    );
    setShops(updatedShops);

    // Update the selected shop if it's the one being edited
    if (selectedShop && selectedShop.id === updatedShop.id) {
      setSelectedShop(updatedShop);
    }
  };

  // Animation functions
  const animateCardIn = (shop) => {
    // Reset animation values
    cardOpacity.setValue(0);
    cardTranslateY.setValue(100);
    cardScale.setValue(0.9);

    // Animate main map to zoom into the selected shop with smoother transition
    if (mapRef.current && shop) {
      mapRef.current.animateToRegion(
        {
          latitude: shop.location.latitude,
          longitude: shop.location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500, // Increased duration for smoother map animation
      );
    }

    // Create a staggered animation sequence for a more polished feel
    const animation = Animated.sequence([
      // Short delay before starting animations
      Animated.delay(50),

      // Run animations in parallel with improved timing and easing
      Animated.parallel([
        // Fade in animation
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400, // Increased duration
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Cubic bezier for smoother fade
        }),

        // Slide up animation with bounce effect
        Animated.timing(cardTranslateY, {
          toValue: 0,
          duration: 500, // Increased duration
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.7)), // Enhanced bounce effect
        }),

        // Scale animation
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 450, // Increased duration
          useNativeDriver: true,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), // Custom easing for pop effect
        }),
      ]),
    ]);

    // Store animation reference for cleanup
    animationRefs.current.push(animation);
    
    animation.start(() => {
      // Remove from refs when complete
      const index = animationRefs.current.indexOf(animation);
      if (index > -1) {
        animationRefs.current.splice(index, 1);
      }
      // Start the button pulse animation after the card appears
      startButtonPulse();
    });
  };

  const animateCardOut = (callback) => {
    // Animate main map back to normal view with smoother transition
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        450, // Increased duration for smoother map transition
      );
    }

    // Create a more sophisticated exit animation sequence
    Animated.sequence([
      // First animate scale and opacity slightly to signal the exit is starting
      Animated.parallel([
        Animated.timing(cardScale, {
          toValue: 0.98,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(cardOpacity, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
      ]),

      // Then complete the exit animation
      Animated.parallel([
        // Fade out animation
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300, // Increased duration
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design standard easing
        }),

        // Slide down animation
        Animated.timing(cardTranslateY, {
          toValue: 60, // Increased distance
          duration: 350, // Increased duration
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design standard easing
        }),

        // Scale animation
        Animated.timing(cardScale, {
          toValue: 0.92, // Slightly more scale down
          duration: 350, // Increased duration
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material Design standard easing
        }),
      ]),
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
        { iterations: 3 }, // Limit to 3 pulses
      ),
    ]).start();
  };

  // Pulse animation for admin button
  const startAdminButtonPulse = () => {
    if (!isAdmin) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(adminButtonScale, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(adminButtonScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          handleLocationError(
            { code: 1 }, // Permission denied code
            "requesting location permission"
          );
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
        });
        
        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        // Validate the location before setting it
        if (isValidLocation(coords)) {
          setLocation(coords);
        } else {
          handleLocationError(
            { code: 2 }, // Position unavailable code
            "validating location coordinates"
          );
        }
      } catch (error) {
        handleLocationError(error, "getting current location");
      }
    })();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  // Load shops from cache on mount
  useEffect(() => {
    const loadCachedShops = async () => {
      try {
        const cachedShops = await loadShopsFromCache();
        if (cachedShops && cachedShops.length > 0) {
          console.log('Loaded shops from cache for offline access');
          setShops(cachedShops);
          setIsLoadingFromCache(true);
        }
      } catch (error) {
        console.error('Error loading cached shops:', error);
      }
    };

    loadCachedShops();
  }, []);

  // Load shops from Firestore with caching
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "coffee_shops"),
      (querySnapshot) => {
        const shopsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const geo = data.location;

          // Validate location data from Firebase
          const location = {
            latitude: geo?.latitude,
            longitude: geo?.longitude
          };

          if (!isValidLocation(location)) {
            console.warn(`Invalid location data for shop ${doc.id}:`, location);
            return null; // Filter out invalid shops
          }

          return {
            id: doc.id,
            ...data,
            location,
          };
        }).filter(Boolean); // Remove null entries

        if (location) {
          shopsData.sort(
            (a, b) =>
              getDistanceMeters(location, a.location) -
              getDistanceMeters(location, b.location),
          );
        }

        setShops(shopsData);
        setIsLoadingFromCache(false);

        // Save to cache for offline access
        saveShopsToCache(shopsData).catch(err =>
          console.error('Failed to cache shops:', err)
        );
      },
      (error) => {
        console.error('Error loading shops from Firestore:', error);
        // Keep using cached data if Firestore fails
      }
    );

    return unsubscribe;
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

  // Start admin button pulse when admin status changes
  useEffect(() => {
    if (isAdmin && selectedShop) {
      startAdminButtonPulse();
    }
  }, [isAdmin, selectedShop]);

  // Handle shop location update
  const handleShopLocationUpdate = (updatedShop) => {
    // Update the shop in the local state
    const updatedShops = shops.map((shop) =>
      shop.id === updatedShop.id ? updatedShop : shop,
    );
    setShops(updatedShops);

    // Update the selected shop if it's the one being edited
    if (selectedShop && selectedShop.id === updatedShop.id) {
      setSelectedShop(updatedShop);
    }
  };

  // Create user document if it doesn't exist
  const createUserDocument = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          favorites: [],
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  };

  // Load user favorites from cache first, then sync with Firestore
  useEffect(() => {
    if (!auth.currentUser) {
      setFavorites([]);
      return;
    }

    // Load from cache immediately for offline access
    loadFavoritesFromCache().then(cachedFavorites => {
      if (cachedFavorites.length > 0) {
        console.log('Loaded favorites from cache');
        setFavorites(cachedFavorites);
      }
    });

    // Create the user document if needed
    createUserDocument(auth.currentUser.uid);

    // Subscribe to Firestore updates
    return onSnapshot(
        doc(db, "users", auth.currentUser.uid),
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const newFavorites = userData.favorites || [];
            setFavorites(newFavorites);

            // Cache favorites for offline access
            saveFavoritesToCache(newFavorites).catch(err =>
              console.error('Failed to cache favorites:', err)
            );
          } else {
            setFavorites([]);
          }
        },
        (error) => {
          console.error("Error loading favorites:", error);
          // Keep using cached data if Firestore fails
        },
    );
  }, [auth.currentUser]);

  // Toggle favorite status
  const toggleFavorite = async (shopId) => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to save favorites");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const isFavorite = favorites.includes(shopId);

      // Optimistic update for immediate feedback
      if (isFavorite) {
        setFavorites((prev) => prev.filter((id) => id !== shopId));
        await updateDoc(userRef, {
          favorites: arrayRemove(shopId),
        });
      } else {
        setFavorites((prev) => [...prev, shopId]);
        await updateDoc(userRef, {
          favorites: arrayUnion(shopId),
        });
      }

      // Add haptic feedback (if available)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      // Revert optimistic update on error
      if (isFavorite) {
        setFavorites((prev) => [...prev, shopId]);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== shopId));
      }
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  // Check if a shop is favorited
  const isFavorite = (shopId) => {
    return favorites.includes(shopId);
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
        <View style={styles.mapWrapper}>
          {Platform.OS === "android" ? (
            // Use FreeMapView for Android - completely free, no API key needed
            <FreeMapView
              ref={mapRef}
              style={styles.map}
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
              showsUserLocation
              isDark={isDark}
              markers={shops.map((shop) => ({
                key: shop.id,
                coordinate: {
                  latitude: shop.location.latitude,
                  longitude: shop.location.longitude,
                },
                title: shop.name,
                description: `Oat Milk: ${shop.oatMilk}`,
              }))}
            />
          ) : (
            // Use react-native-maps for iOS with Apple Maps
            <MapView
              showsPointsOfInterest
              ref={mapRef}
              style={styles.map}
              mapType="standard"
              showsUserLocation
              userInterfaceStyle={isDark ? "dark" : "light"}
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
          )}

          {/* Location button positioned absolutely outside MapView */}
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
        </View>
      ) : (
        <Text style={styles.label}>Fetching location...</Text>
      )}
      <Text style={styles.label}>Welcome to OatMark</Text>

      {/* Offline indicator banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <FontAwesome6
            name="wifi"
            size={14}
            color="#FFFFFF"
            iconStyle="solid"
            style={styles.offlineIcon}
          />
          <Text style={styles.offlineBannerText}>
            {isLoadingFromCache
              ? "Offline - Showing cached shops"
              : "Offline - Limited functionality"}
          </Text>
        </View>
      )}

      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        renderItem={({ item }) => (
          <ShopCard
            item={item}
            location={location}
            isFavorite={isFavorite(item.id)}
            styles={styles}
            onPress={(shop) => {
              // Set the selected shop
              setSelectedShop(shop);

              // Start entrance animation
              animateCardIn(shop);

              // First animate to normal view, then the overlay will zoom in
              if (mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: shop.location.latitude,
                    longitude: shop.location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  300,
                );
              }
            }}
          />
        )}
      />
      {selectedShop && (
        <Animated.View
          style={[
            styles.selectedShopOverlay,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            },
          ]}
        >
          {/* Background Map View */}
          <View style={styles.overlayMapContainer}>
            {Platform.OS === "android" ? (
              <FreeMapView
                ref={overlayMapRef}
                style={styles.overlayMap}
                region={{
                  latitude: selectedShop.location.latitude,
                  longitude: selectedShop.location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={true}
                pitchEnabled={true}
                showsUserLocation
                isDark={isDark}
                markers={[
                  {
                    key: selectedShop.id,
                    coordinate: {
                      latitude: selectedShop.location.latitude,
                      longitude: selectedShop.location.longitude,
                    },
                    title: selectedShop.name,
                    description: `Oat Milk: ${selectedShop.oatMilk}`,
                  },
                ]}
              />
            ) : (
              <MapView
                ref={overlayMapRef}
                style={styles.overlayMap}
                showsUserLocation
                userInterfaceStyle={isDark ? "dark" : "light"}
                region={{
                  latitude: selectedShop.location.latitude,
                  longitude: selectedShop.location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={true}
                pitchEnabled={true}
              >
                <Marker
                  coordinate={{
                    latitude: selectedShop.location.latitude,
                    longitude: selectedShop.location.longitude,
                  }}
                  title={selectedShop.name}
                  description={`Oat Milk: ${selectedShop.oatMilk}`}
                />
              </MapView>
            )}

            {/* Map Border Overlay */}
            <View style={styles.mapBorderOverlay} />

            {/* Map Gradient Overlay */}
            <Animated.View
              style={[
                styles.mapOverlayGradient,
                {
                  opacity: cardOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            />
          </View>

          {/* Close Button - Top Right */}
          <TouchableOpacity
            style={styles.closeButtonTop}
            onPress={() => {
              animateCardOut(() => setSelectedShop(null));
            }}
            activeOpacity={0.8}
          >
            <View style={styles.closeButtonBackground}>
              <FontAwesome6
                name="xmark"
                size={16}
                color={colors.text}
                iconStyle="solid"
              />
            </View>
          </TouchableOpacity>

          {/* Admin Adjust Pin Button - Top Left */}
          {isAdmin && (
            <Animated.View
              style={[
                styles.adminFloatingButton,
                {
                  transform: [{ scale: adminButtonScale }],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setShowAdjustPinModal(true)}
                activeOpacity={0.8}
                style={styles.adminFloatingBackground}
              >
                <FontAwesome6
                  name="location-crosshairs"
                  size={16}
                  color="#FF9500"
                  iconStyle="solid"
                />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Bottom Card with Shop Info and Actions */}
          <Animated.View
            style={[
              styles.bottomSection,
              {
                transform: [
                  {
                    translateY: cardTranslateY.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, 100],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.bottomContent}>
              {/* Shop Name and Info */}
              <View style={styles.shopNameSection}>
                <Animated.View
                  style={[
                    styles.bottomEmojiContainer,
                    {
                      transform: [
                        {
                          rotate: cardScale.interpolate({
                            inputRange: [0.9, 1],
                            outputRange: ["-5deg", "0deg"],
                          }),
                        },
                        {
                          scale: cardScale.interpolate({
                            inputRange: [0.9, 1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.bottomEmoji}>
                    {selectedShop.emoji || "☕"}
                  </Text>
                </Animated.View>

                <View style={styles.shopNameTextContainer}>
                  <Text style={styles.bottomShopName}>{selectedShop.name}</Text>
                  <Text style={styles.bottomSubtitle}>Coffee Shop</Text>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Image
                    source={require("./assets/splash-icon.png")}
                    style={styles.statIcon}
                  />
                  <Text style={styles.statLabel}>Oat Milk</Text>
                  <Text style={styles.statValue}>{selectedShop.oatMilk}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <FontAwesome6
                    name="money-bill"
                    size={16}
                    color={getUpchargeColor(selectedShop.upCharge)}
                    iconStyle="solid"
                  />
                  <Text style={styles.statLabel}>Upcharge</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: getUpchargeColor(selectedShop.upCharge) },
                    ]}
                  >
                    {getFormattedUpcharge(selectedShop.upCharge)}
                  </Text>
                </View>

                {location && (
                  <>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <FontAwesome6
                        name="location-dot"
                        size={16}
                        color="#FF9500"
                        iconStyle="solid"
                      />
                      <Text style={styles.statLabel}>Distance</Text>
                      <Text style={styles.statValue}>
                        {(
                          getDistanceMeters(location, selectedShop.location) /
                          1000
                        ).toFixed(1)}
                        km
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => getDirections(selectedShop)}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: [{ scale: buttonScale }],
                    }}
                  >
                    <FontAwesome6
                      name="route"
                      size={16}
                      color="#FFFFFF"
                      iconStyle="solid"
                    />
                    <Text style={styles.primaryButtonText}>Get Directions</Text>
                    <FontAwesome6
                      name="arrow-right"
                      size={12}
                      color="#FFFFFF"
                      iconStyle="solid"
                      style={{ marginLeft: 8 }}
                    />
                  </Animated.View>
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={[
                      styles.secondaryActionButton,
                      isFavorite(selectedShop.id) && styles.favoriteActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => toggleFavorite(selectedShop.id)}
                  >
                    <FontAwesome6
                      name="heart"
                      size={14}
                      color={
                        isFavorite(selectedShop.id)
                          ? "#FF6B6B"
                          : colors.secondaryText
                      }
                      iconStyle={
                        isFavorite(selectedShop.id) ? "solid" : "regular"
                      }
                    />
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        isFavorite(selectedShop.id) && { color: "#FF6B6B" },
                      ]}
                    >
                      {isFavorite(selectedShop.id) ? "Saved" : "Save"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryActionButton}
                    activeOpacity={0.8}
                    onPress={handleShare}
                  >
                    <FontAwesome6
                      name="share"
                      size={14}
                      color={colors.secondaryText}
                      iconStyle="solid"
                    />
                    <Text style={styles.secondaryButtonText}>Share</Text>
                  </TouchableOpacity>

                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.secondaryActionButton}
                      activeOpacity={0.8}
                      onPress={handleManageShop}
                    >
                      <FontAwesome6
                        name="gear"
                        size={14}
                        color={colors.secondaryText}
                        iconStyle="solid"
                      />
                      <Text style={styles.secondaryButtonText}>Manage</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
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

      <Modal
        animationType="slide"
        transparent={false}
        visible={showPendingShops}
        onRequestClose={() => setShowPendingShops(false)}
      >
        <PendingShopsScreen onClose={() => setShowPendingShops(false)} />
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showAdminPanel}
        onRequestClose={() => setShowAdminPanel(false)}
      >
        <AdminScreen onClose={() => setShowAdminPanel(false)} />
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

      <Modal
        animationType="slide"
        transparent={false}
        visible={showManageShopModal}
        onRequestClose={() => setShowManageShopModal(false)}
      >
        {selectedShop && (
          <ManageShopModal
            shop={selectedShop}
            visible={showManageShopModal}
            onClose={() => setShowManageShopModal(false)}
            onShopUpdated={handleShopUpdated}
          />
        )}
      </Modal>
    </View>
  );
}
