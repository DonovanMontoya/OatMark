/**
 * ShopCache - AsyncStorage-based caching for coffee shop data
 * Enables offline access to favorite shops and recently viewed locations
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  SHOPS: 'oatmark_shops_cache',
  CACHE_TIMESTAMP: 'oatmark_shops_cache_timestamp',
  USER_FAVORITES: 'oatmark_user_favorites_cache',
};

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

/**
 * Save shops to cache
 * @param {Array} shops - Array of shop objects to cache
 * @returns {Promise<boolean>} Success status
 */
export const saveShopsToCache = async (shops) => {
  try {
    if (!Array.isArray(shops)) {
      console.warn('saveShopsToCache: shops must be an array');
      return false;
    }

    const cacheData = {
      shops,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(CACHE_KEYS.SHOPS, JSON.stringify(cacheData));
    await AsyncStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());

    console.log(`Cached ${shops.length} shops successfully`);
    return true;
  } catch (error) {
    console.error('Error saving shops to cache:', error);
    return false;
  }
};

/**
 * Load shops from cache
 * @returns {Promise<Array|null>} Cached shops array or null if cache is invalid/expired
 */
export const loadShopsFromCache = async () => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.SHOPS);

    if (!cachedData) {
      console.log('No cached shops found');
      return null;
    }

    const { shops, timestamp } = JSON.parse(cachedData);

    // Corrupt cache data must count as expired: a non-numeric timestamp
    // makes cacheAge NaN, and NaN > CACHE_EXPIRATION_TIME is false, which
    // would make the cache immortal
    if (!Array.isArray(shops) || !Number.isFinite(timestamp)) {
      console.warn('Cached shop data is malformed, ignoring cache');
      return null;
    }

    const now = Date.now();
    const cacheAge = now - timestamp;

    // Check if cache is expired
    if (cacheAge > CACHE_EXPIRATION_TIME) {
      console.log(`Cache expired (${Math.round(cacheAge / 1000 / 60 / 60)} hours old)`);
      return null;
    }

    console.log(`Loaded ${shops.length} shops from cache (${Math.round(cacheAge / 1000 / 60)} minutes old)`);
    return shops;
  } catch (error) {
    console.error('Error loading shops from cache:', error);
    return null;
  }
};

/**
 * Get cache age in milliseconds
 * @returns {Promise<number|null>} Cache age or null if no cache exists
 */
export const getCacheAge = async () => {
  try {
    const timestampStr = await AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    if (!timestampStr) return null;

    const timestamp = parseInt(timestampStr, 10);
    if (!Number.isFinite(timestamp)) return null;

    return Date.now() - timestamp;
  } catch (error) {
    console.error('Error getting cache age:', error);
    return null;
  }
};

/**
 * Check if cache is valid (exists and not expired)
 * @returns {Promise<boolean>}
 */
export const isCacheValid = async () => {
  try {
    const cacheAge = await getCacheAge();
    if (cacheAge === null) return false;

    return cacheAge < CACHE_EXPIRATION_TIME;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

/**
 * Clear all shop cache data
 * @returns {Promise<boolean>} Success status
 */
export const clearShopCache = async () => {
  try {
    await AsyncStorage.multiRemove([
      CACHE_KEYS.SHOPS,
      CACHE_KEYS.CACHE_TIMESTAMP,
    ]);
    console.log('Shop cache cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing shop cache:', error);
    return false;
  }
};

/**
 * Save user favorites to cache (for offline access)
 * @param {Array} favorites - Array of favorite shop IDs
 * @returns {Promise<boolean>} Success status
 */
export const saveFavoritesToCache = async (favorites) => {
  try {
    if (!Array.isArray(favorites)) {
      console.warn('saveFavoritesToCache: favorites must be an array');
      return false;
    }

    await AsyncStorage.setItem(CACHE_KEYS.USER_FAVORITES, JSON.stringify(favorites));
    console.log(`Cached ${favorites.length} favorites successfully`);
    return true;
  } catch (error) {
    console.error('Error saving favorites to cache:', error);
    return false;
  }
};

/**
 * Load user favorites from cache
 * @returns {Promise<Array>} Array of favorite shop IDs (empty array if none)
 */
export const loadFavoritesFromCache = async () => {
  try {
    const cachedFavorites = await AsyncStorage.getItem(CACHE_KEYS.USER_FAVORITES);

    if (!cachedFavorites) {
      return [];
    }

    const favorites = JSON.parse(cachedFavorites);
    if (!Array.isArray(favorites)) {
      console.warn('Cached favorites are malformed, ignoring cache');
      return [];
    }

    console.log(`Loaded ${favorites.length} favorites from cache`);
    return favorites;
  } catch (error) {
    console.error('Error loading favorites from cache:', error);
    return [];
  }
};

/**
 * Get cache statistics for debugging
 * @returns {Promise<Object>} Cache stats object
 */
export const getCacheStats = async () => {
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEYS.SHOPS);
    const cachedFavorites = await AsyncStorage.getItem(CACHE_KEYS.USER_FAVORITES);
    const cacheAge = await getCacheAge();
    const isValid = await isCacheValid();

    return {
      hasShops: !!cachedData,
      shopCount: cachedData ? JSON.parse(cachedData).shops.length : 0,
      favoriteCount: cachedFavorites ? JSON.parse(cachedFavorites).length : 0,
      cacheAge,
      cacheAgeMinutes: cacheAge ? Math.round(cacheAge / 1000 / 60) : null,
      isValid,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      hasShops: false,
      shopCount: 0,
      favoriteCount: 0,
      cacheAge: null,
      cacheAgeMinutes: null,
      isValid: false,
    };
  }
};
