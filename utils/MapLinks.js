import { Linking, Platform } from 'react-native';

/**
 * Opens the device's map application with the shop's location
 * @param {Object} shop - The shop object containing location and name
 */
export const openInMaps = (shop) => {
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

/**
 * Opens Yelp to search for the shop name near its location
 * @param {Object} shop - The shop object containing location and name
 */
export const searchYelp = (shop) => {
  if (!shop || !shop.location) return;
  
  const { latitude, longitude } = shop.location;
  const query = encodeURIComponent(shop.name);
  const yelpUrl = `https://www.yelp.com/search?find_desc=${query}&find_loc=${latitude},${longitude}`;
  
  Linking.canOpenURL(yelpUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(yelpUrl);
      }
    })
    .catch((err) => console.error('An error occurred', err));
};

/**
 * Alias for openInMaps for backward compatibility
 * @param {Object} shop - The shop object containing location and name
 */
export const getDirections = openInMaps;