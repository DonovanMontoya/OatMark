/**
 * Utility functions for geographical calculations
 */

// Earth radius in meters
const EARTH_RADIUS = 6371000;

// Approximate meters per degree of latitude (this varies slightly with latitude)
const METERS_PER_DEGREE_LATITUDE = 111320;

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Converts radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
const toDegrees = (radians) => (radians * 180) / Math.PI;

/**
 * Calculates meters per degree of longitude at a given latitude
 * @param {number} latitude - Latitude in degrees
 * @returns {number} Meters per degree of longitude
 */
const metersPerDegreeLongitude = (latitude) => {
  return Math.cos(toRadians(latitude)) * METERS_PER_DEGREE_LATITUDE;
};

/**
 * Calculates the distance in meters between two geographical points
 * @param {Object} a - First point with latitude and longitude properties
 * @param {Object} b - Second point with latitude and longitude properties
 * @returns {number} Distance in meters
 */
export function getDistanceMeters(a, b) {
  // Convert latitude and longitude to radians
  const lat1 = toRadians(a.latitude);
  const lon1 = toRadians(a.longitude);
  const lat2 = toRadians(b.latitude);
  const lon2 = toRadians(b.longitude);
  
  // Calculate differences
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  
  // Haversine formula
  const a_val = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a_val), Math.sqrt(1-a_val));
  return EARTH_RADIUS * c;
}

/**
 * Calculates a destination point given a starting point, distance, and bearing
 * @param {Object} start - Starting point with latitude and longitude properties
 * @param {number} distance - Distance in meters
 * @param {number} bearing - Bearing in degrees (0 = north, 90 = east, etc.)
 * @returns {Object} Destination point with latitude and longitude properties
 */
export function getDestinationPoint(start, distance, bearing) {
  // Input validation
  if (!start || typeof start.latitude !== 'number' || typeof start.longitude !== 'number') {
    console.error('Invalid starting point:', start);
    return start; // Return the original point to avoid crashes
  }
  
  if (typeof distance !== 'number' || distance < 0) {
    console.error('Invalid distance:', distance);
    return start; // Return the original point to avoid crashes
  }
  
  if (typeof bearing !== 'number') {
    console.error('Invalid bearing:', bearing);
    return start; // Return the original point to avoid crashes
  }
  
  const lat1 = toRadians(start.latitude);
  const lon1 = toRadians(start.longitude);
  const bearingRad = toRadians(bearing);
  
  // Angular distance in radians
  const angularDistance = distance / EARTH_RADIUS;
  
  // Calculate destination point
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    latitude: toDegrees(lat2),
    longitude: toDegrees(lon2)
  };
}

/**
 * Calculates the four corners of a square centered at a point
 * @param {Object} center - Center point with latitude and longitude properties
 * @param {number} distanceMeters - Half the side length of the square in meters
 * @returns {Array} Array of four corner points, each with latitude and longitude properties
 */
export function calculateSquareCorners(center, distanceMeters) {
  // Input validation
  if (!center || typeof center.latitude !== 'number' || typeof center.longitude !== 'number') {
    console.error('Invalid center point:', center);
    return [center, center, center, center]; // Return four copies of the center to avoid crashes
  }
  
  if (typeof distanceMeters !== 'number' || distanceMeters < 0) {
    console.error('Invalid distance:', distanceMeters);
    return [center, center, center, center]; // Return four copies of the center to avoid crashes
  }
  
  // Calculate the offsets in degrees
  const latOffset = distanceMeters / METERS_PER_DEGREE_LATITUDE;
  const lngOffset = distanceMeters / metersPerDegreeLongitude(center.latitude);
  
  // Calculate the four corners (NW, NE, SE, SW)
  return [
    { latitude: center.latitude + latOffset, longitude: center.longitude - lngOffset }, // NW
    { latitude: center.latitude + latOffset, longitude: center.longitude + lngOffset }, // NE
    { latitude: center.latitude - latOffset, longitude: center.longitude + lngOffset }, // SE
    { latitude: center.latitude - latOffset, longitude: center.longitude - lngOffset }  // SW
  ];
}

/**
 * Checks if a point is within a square boundary
 * @param {Object} point - Point to check with latitude and longitude properties
 * @param {Object} center - Center of the square with latitude and longitude properties
 * @param {number} distanceMeters - Half the side length of the square in meters
 * @returns {boolean} True if the point is within the square, false otherwise
 */
export function isPointInSquare(point, center, distanceMeters) {
  // Input validation
  if (!point || !center || typeof point.latitude !== 'number' || typeof point.longitude !== 'number' ||
      typeof center.latitude !== 'number' || typeof center.longitude !== 'number' || 
      typeof distanceMeters !== 'number') {
    console.error('Invalid parameters:', { point, center, distanceMeters });
    return false;
  }
  
  // Calculate the offsets in degrees
  const latOffset = distanceMeters / METERS_PER_DEGREE_LATITUDE;
  const lngOffset = distanceMeters / metersPerDegreeLongitude(center.latitude);
  
  // Check if the point is within the square boundary
  return (
    point.latitude >= center.latitude - latOffset &&
    point.latitude <= center.latitude + latOffset &&
    point.longitude >= center.longitude - lngOffset &&
    point.longitude <= center.longitude + lngOffset
  );
}

/**
 * Finds the nearest point on the square boundary when a point is outside
 * @param {Object} point - Point to check with latitude and longitude properties
 * @param {Object} center - Center of the square with latitude and longitude properties
 * @param {number} distanceMeters - Half the side length of the square in meters
 * @returns {Object} Nearest point on the square boundary with latitude and longitude properties
 */
export function getNearestPointOnSquare(point, center, distanceMeters) {
  // Input validation
  if (!point || !center || typeof point.latitude !== 'number' || typeof point.longitude !== 'number' ||
      typeof center.latitude !== 'number' || typeof center.longitude !== 'number' || 
      typeof distanceMeters !== 'number') {
    console.error('Invalid parameters:', { point, center, distanceMeters });
    return center; // Return the center to avoid crashes
  }
  
  // If the point is already within the square, return it as is
  if (isPointInSquare(point, center, distanceMeters)) {
    return point;
  }
  
  // Calculate the offsets in degrees
  const latOffset = distanceMeters / METERS_PER_DEGREE_LATITUDE;
  const lngOffset = distanceMeters / metersPerDegreeLongitude(center.latitude);
  
  // Calculate the min/max boundaries of the square
  const minLat = center.latitude - latOffset;
  const maxLat = center.latitude + latOffset;
  const minLng = center.longitude - lngOffset;
  const maxLng = center.longitude + lngOffset;
  
  // Clamp the point to the square boundary
  return {
    latitude: Math.max(minLat, Math.min(maxLat, point.latitude)),
    longitude: Math.max(minLng, Math.min(maxLng, point.longitude))
  };
}