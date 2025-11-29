import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common';

/**
 * Default search radius in kilometers
 * Can be adjusted based on urban vs rural areas
 */
export const DEFAULT_SEARCH_RADIUS_KM = 50;

/**
 * Generates a geohash for a given location
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string} geohash string
 */
export const generateGeohash = (latitude, longitude) => {
  return geohashForLocation([latitude, longitude]);
};

/**
 * Gets query bounds for searching within a radius
 * Returns array of [start, end] bound pairs for querying
 *
 * @param {number} latitude - Center point latitude
 * @param {number} longitude - Center point longitude
 * @param {number} radiusInKm - Search radius in kilometers
 * @returns {Array<[string, string]>} Array of [start, end] geohash bounds
 */
export const getGeohashQueryBounds = (latitude, longitude, radiusInKm = DEFAULT_SEARCH_RADIUS_KM) => {
  const center = [latitude, longitude];
  const radiusInM = radiusInKm * 1000;

  return geohashQueryBounds(center, radiusInM);
};

/**
 * Filters results by actual distance (geohash queries return approximate results)
 * Use this to filter results after querying by geohash bounds
 *
 * @param {Array} shops - Array of shop objects with location {latitude, longitude}
 * @param {number} centerLat - Center point latitude
 * @param {number} centerLng - Center point longitude
 * @param {number} radiusInKm - Maximum distance in kilometers
 * @returns {Array} Filtered shops within actual radius
 */
export const filterByActualDistance = (shops, centerLat, centerLng, radiusInKm = DEFAULT_SEARCH_RADIUS_KM) => {
  const center = [centerLat, centerLng];
  const radiusInM = radiusInKm * 1000;

  return shops.filter((shop) => {
    if (!shop.location?.latitude || !shop.location?.longitude) {
      return false;
    }

    const shopLocation = [shop.location.latitude, shop.location.longitude];
    const distanceInM = distanceBetween(center, shopLocation) * 1000;

    return distanceInM <= radiusInM;
  });
};

/**
 * Calculates distance between two points in kilometers
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  return distanceBetween([lat1, lng1], [lat2, lng2]);
};
