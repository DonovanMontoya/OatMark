import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { getFormattedUpcharge, getUpchargeColor } from '../utils/upchargeEmojis';
import { getDistanceMeters } from '../utils/GeoUtils';

const ShopCard = ({ 
  item, 
  location, 
  onPress, 
  isFavorite = false, 
  styles 
}) => {
  // Create animated value with useRef to prevent recreation on each render
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
      onPress={() => onPress(item)}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
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
                    { color: getUpchargeColor(item.upCharge) },
                  ]}
                >
                  {getFormattedUpcharge(item.upCharge)}
                </Text>
              </View>
            </View>
            <View style={styles.cardDetails}>
              <View style={styles.oatMilkRow}>
                <Image
                  source={require('../assets/splash-icon.png')}
                  style={{ width: 30, height: 30 }}
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
                        getDistanceMeters(location, item.location) / 1000
                      ).toFixed(1)}km away`
                    : "Location unavailable"}
                </Text>
                {isFavorite && (
                  <FontAwesome6
                    name="heart"
                    size={12}
                    color="#FF6B6B"
                    iconStyle="solid"
                    style={{ marginLeft: "auto", opacity: 0.8 }}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default React.memo(ShopCard);