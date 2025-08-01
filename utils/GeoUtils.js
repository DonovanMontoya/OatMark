/**
 * Utility functions for geographical calculations
 */

/**
 * Calculates the distance in meters between two geographical points
 * @param {Object} a - First point with latitude and longitude properties
 * @param {Object} b - Second point with latitude and longitude properties
 * @returns {number} Distance in meters
 */
export function getDistanceMeters(a, b) {
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