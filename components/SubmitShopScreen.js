import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import EmojiSelector from "./EmojiSelector";
import MapView, { Circle, Polygon } from "react-native-maps";
import { 
  getDistanceMeters, 
  calculateSquareCorners,
  isPointInSquare, 
  getNearestPointOnSquare 
} from "../utils/GeoUtils";

const SubmitShopScreen = ({ onClose }) => {
  const [shopName, setShopName] = useState("");
  const [oatMilk, setOatMilk] = useState("");
  const [upCharge, setUpCharge] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("☕");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Location state variables
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [distanceFromUser, setDistanceFromUser] = useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isMapDragging, setIsMapDragging] = useState(false);
  
  // Constants
  const MAX_DISTANCE_FEET = 200;
  const MAX_DISTANCE_METERS = MAX_DISTANCE_FEET * 0.3048; // Convert feet to meters
  
  // Map reference
  const mapRef = useRef(null);
  
  // Fetch user location when component mounts
  useEffect(() => {
    const getUserLocation = async () => {
      setIsLoadingLocation(true);
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocationPermissionGranted(false);
          Alert.alert(
            "Permission Denied",
            "Location permission is required to submit a shop."
          );
          setIsLoadingLocation(false);
          return;
        }
        
        setLocationPermissionGranted(true);
        
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        });
        
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setUserLocation(userCoords);
        setMapCenter(userCoords); // Initialize map center at user's location
        setIsLoadingLocation(false);
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert(
          "Error",
          "Failed to get your location. Please try again."
        );
        setIsLoadingLocation(false);
      }
    };
    
    getUserLocation();
  }, []);
  
  // Handle map region change start
  const onRegionChangeStart = () => {
    setIsMapDragging(true);
  };
  
  // Handle map region change complete
  const onRegionChangeComplete = (region) => {
    setIsMapDragging(false);
    
    // Get the center of the map
    const newCenter = {
      latitude: region.latitude,
      longitude: region.longitude
    };
    
    if (userLocation) {
      // Check if the new center is within the square boundary
      const isWithinBoundary = isPointInSquare(newCenter, userLocation, MAX_DISTANCE_METERS);
      
      // Calculate distance from user location to map center (for display purposes)
      const distance = getDistanceMeters(userLocation, newCenter);
      setDistanceFromUser(distance);
      
      // If outside the square boundary, reset map to the nearest point on the boundary
      if (!isWithinBoundary) {
        // Get the nearest point on the square boundary
        const boundaryPoint = getNearestPointOnSquare(newCenter, userLocation, MAX_DISTANCE_METERS);
        
        // Create the region object for animation
        const boundaryLocation = {
          latitude: boundaryPoint.latitude,
          longitude: boundaryPoint.longitude,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta
        };
        
        // Animate map to boundary with a longer duration for smoother transition
        mapRef.current.animateToRegion(boundaryLocation, 800);
        
        // Update map center
        setMapCenter(boundaryPoint);
        
        // Recalculate distance for the boundary point
        const boundaryDistance = getDistanceMeters(userLocation, boundaryPoint);
        setDistanceFromUser(boundaryDistance);
      } else {
        // Update map center
        setMapCenter(newCenter);
      }
    }
  };

  const handleUpChargeChange = (value) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return; // Don't update if more than one decimal point
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setUpCharge(numericValue);
  };

  const getWhimsicalUpchargeText = () => {
    if (isFree) return "🎉 FREE oat milk? You're living the dream! 🌟";
    if (!upCharge) return "💰 What's the damage for that creamy oat goodness?";

    const price = parseFloat(upCharge);
    if (price === 0) return "🆓 Zero dollars? That's music to my ears! 🎵";
    if (price < 0.5) return "🤑 That's a steal! Your wallet will thank you! 💚";
    if (price < 1.0) return "😊 Not too shabby for some oat-y goodness! ✨";
    if (price < 2.0)
      return "💸 Getting a bit pricey, but worth it for the oats! 🌾";
    return "😱 Whoa there! That's some premium oat milk! 🥛👑";
  };

  const handleSubmit = async () => {
    if (!shopName.trim() || !oatMilk.trim() || (!isFree && !upCharge.trim())) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Check if user is authenticated
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to submit a shop");
      return;
    }
    
    // Check if we have location data
    if (!userLocation || !mapCenter) {
      Alert.alert("Error", "Location data is required to submit a shop");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add shop to Firestore pendingShops collection
      const finalUpcharge = isFree
        ? "Free"
        : `$${parseFloat(upCharge).toFixed(2)}`;

      await addDoc(collection(db, "pendingShops"), {
        name: shopName.trim(),
        oatMilk: oatMilk.trim(),
        upCharge: finalUpcharge,
        emoji: selectedEmoji,
        location: {
          latitude: mapCenter.latitude,
          longitude: mapCenter.longitude,
        },
        userLocation: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        locationAdjusted: distanceFromUser > 0,
        distanceFromUser: distanceFromUser,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
        status: "pending"
      });

      Alert.alert("Success!", "Coffee shop submitted for review!", [
        { text: "OK", onPress: onClose },
      ]);

      // Reset form
      setShopName("");
      setOatMilk("");
      setUpCharge("");
      setSelectedEmoji("☕");
      setIsFree(false);
    } catch (error) {
      console.error("Error submitting shop:", error);
      Alert.alert("Error", "Failed to submit coffee shop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6 name="xmark" size={20} color="#333" iconStyle="solid" />
        </TouchableOpacity>
        <Text style={styles.title}>Submit Coffee Shop</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Name *</Text>
          <TextInput
            style={styles.input}
            value={shopName}
            onChangeText={setShopName}
            placeholder="Enter coffee shop name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Oat Milk Brand/Type *</Text>
          <TextInput
            style={styles.input}
            value={oatMilk}
            onChangeText={setOatMilk}
            placeholder="e.g., Oatly, Minor Figures, House-made"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upcharge * 🥛</Text>

          <View style={styles.upchargeContainer}>
            <TouchableOpacity
              style={[styles.freeButton, isFree && styles.freeButtonActive]}
              onPress={() => {
                setIsFree(!isFree);
                setUpCharge("");
              }}
            >
              <Text
                style={[
                  styles.freeButtonText,
                  isFree && styles.freeButtonTextActive,
                ]}
              >
                🎉 It's FREE!
              </Text>
            </TouchableOpacity>

            {!isFree && (
              <View style={styles.priceInputContainer}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={upCharge}
                  onChangeText={handleUpChargeChange}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  maxLength={6}
                />
              </View>
            )}
          </View>

          <Text style={styles.whimsicalText}>{getWhimsicalUpchargeText()}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Shop Emoji</Text>
          <EmojiSelector
            selectedEmoji={selectedEmoji}
            onSelectEmoji={setSelectedEmoji}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.mapInstructions}>
            Drag the map to position the pin at the shop location (within a 200-foot square around your position)
          </Text>
          
          {isLoadingLocation ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          ) : !locationPermissionGranted ? (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.errorText}>Location permission required</Text>
            </View>
          ) : userLocation && mapCenter ? (
            <View style={styles.mapContainer}>
              <View style={styles.fixedPinContainer}>
                <FontAwesome6 
                  name="map-pin" 
                  size={36} 
                  color="#FF3B30" 
                  iconStyle="solid"
                  style={styles.fixedPin} 
                />
              </View>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }}
                onRegionChangeComplete={onRegionChangeComplete}
                onRegionChange={onRegionChangeStart}
              >
                {/* User's position marker as a dot with higher z-index */}
                <Circle
                  center={userLocation}
                  radius={10}
                  strokeWidth={3}
                  strokeColor="white"
                  fillColor="#4285F4"
                  zIndex={20}
                />
                
                {/* Square showing the 200-foot boundary */}
                <Polygon
                  coordinates={calculateSquareCorners(userLocation, MAX_DISTANCE_METERS)}
                  strokeWidth={2}
                  strokeColor="rgba(66, 133, 244, 0.7)"
                  fillColor="rgba(66, 133, 244, 0.1)"
                  zIndex={5}
                />
              </MapView>
              
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceText}>
                  {isMapDragging ? "Dragging map..." : 
                    distanceFromUser > 0 
                      ? `Distance: ${Math.round(distanceFromUser * 3.28084)} feet from your location (square boundary)` 
                      : "Pin is at your current location"}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.errorText}>Failed to load map</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Submitting..." : "Submit Shop"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    padding: 5,
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  note: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginVertical: 10,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  upchargeContainer: {
    marginBottom: 10,
  },
  freeButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  freeButtonActive: {
    backgroundColor: "#e8f5e8",
    borderColor: "#4CAF50",
  },
  freeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  freeButtonTextActive: {
    color: "#4CAF50",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4285F4",
    marginRight: 5,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  whimsicalText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  // Map styles
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
  },
  mapInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  // Fixed pin styles
  fixedPinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15, // Lower than user location dot (20) but higher than other map elements
    pointerEvents: 'none', // Allow touches to pass through to the map
  },
  fixedPin: {
    marginBottom: 36, // Offset to account for the pin's anchor point
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    zIndex: 5,
  },
  distanceText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default SubmitShopScreen;
