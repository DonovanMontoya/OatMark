import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { getFormattedUpcharge, getUpchargeColor } from '../utils/upchargeEmojis';
import { getDistanceMeters } from '../utils/GeoUtils';
import { deriveDataStatus, formatTimeAgo } from '../utils/reportLogic';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Compact freshness badge content for a shop card.
 *
 * Positive-only: cards show ✓ when confirmed and ⚠ when disputed, and
 * nothing otherwise. With a small user base almost nothing gets confirmed,
 * so a stale badge would wallpaper the map with "abandoned" signals the
 * data can't earn its way out of. The detail view still nudges for
 * re-confirmation of stale shops.
 * @returns {{text: string, colorKey: string}|null} null when there's nothing useful to show
 */
const getFreshnessBadge = (shop) => {
  const status = deriveDataStatus(shop);
  if (status === 'disputed') {
    return { text: '⚠ disputed', colorKey: 'danger' };
  }
  if (status === 'fresh' && shop.lastConfirmedAt) {
    return { text: `✓ ${formatTimeAgo(shop.lastConfirmedAt)}`, colorKey: 'success' };
  }
  return null;
};

const ShopCard = ({
  item,
  location,
  onPress,
  isFavorite = false,
  styles
}) => {
  const { colors } = useTheme();
  // Create animated value with useRef to prevent recreation on each render
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const freshness = getFreshnessBadge(item);

  // NaN when either location is missing or malformed
  const distanceMeters = location && item.location
    ? getDistanceMeters(location, item.location)
    : NaN;

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
                size={13}
                color={colors.onAccent}
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
                  color={colors.tertiaryText}
                  iconStyle="solid"
                />
                <Text style={styles.distanceText}>
                  {Number.isFinite(distanceMeters)
                    ? `${(distanceMeters / 1000).toFixed(1)}km away`
                    : "Location unavailable"}
                </Text>
                {freshness && (
                  <Text style={[styles.freshnessBadge, { color: colors[freshness.colorKey] }]}>
                    {freshness.text}
                  </Text>
                )}
                {isFavorite && (
                  <FontAwesome6
                    name="heart"
                    size={12}
                    color={colors.favorite}
                    iconStyle="solid"
                    style={{ marginLeft: "auto" }}
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