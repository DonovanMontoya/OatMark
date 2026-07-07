/**
 * Distance display formatting with unit support.
 */

export const METERS_PER_MILE = 1609.344;

/**
 * Formats a distance in meters for display.
 * @param {number} meters - Distance in meters
 * @param {'km'|'mi'} unit - Display unit
 * @returns {string|null} e.g. "1.2km" or "0.7mi", null when unusable
 */
export const formatDistance = (meters, unit = 'km') => {
    if (!Number.isFinite(meters) || meters < 0) return null;
    return unit === 'mi'
        ? `${(meters / METERS_PER_MILE).toFixed(1)}mi`
        : `${(meters / 1000).toFixed(1)}km`;
};
