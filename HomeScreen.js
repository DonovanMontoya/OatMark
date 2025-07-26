import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Modal,
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

  const handleSubmitShop = () => {
    setShowSubmitShop(true);
  };

  const handleSettings = () => {
    setShowSettings(true);
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
          followsUserLocation
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
        renderItem={({ item }) => (
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
                  500,
                );
              }
            }}
          >
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.cardText}>
                <View style={styles.cardInfo}>
                  <Text style={styles.shopName}>{item.name}</Text>
                  <Text style={styles.oatMilk}>{item.oatMilk}</Text>
                  <Text style={styles.location}>
                    {`${item.location.latitude.toFixed(
                      6,
                    )}, ${item.location.longitude.toFixed(6)}`}
                  </Text>
                </View>
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
          </TouchableOpacity>
        )}
      />
      {selectedShop && (
        <View style={styles.selectedShopOverlay}>
          <Text style={styles.shopName}>{selectedShop.name}</Text>
          <Text style={styles.oatMilk}>Oat Milk: {selectedShop.oatMilk}</Text>
          <Text
            style={[
              styles.overlayUpchargeEmoji,
              { color: getUpchargeColor(selectedShop.upCharge) },
            ]}
          >
            {getFormattedUpcharge(selectedShop.upCharge)}
          </Text>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => setSelectedShop(null)}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
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
