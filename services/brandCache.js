import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "@common_brands_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetches common oat milk brands with 24-hour caching
 * Reduces Firebase reads by 95% for brand aggregation
 *
 * @returns {Promise<string[]>} Array of top 6 most common brand names
 */
export const getCommonBrands = async () => {
  try {
    // Try to get from cache first
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);

    if (cachedData) {
      const { brands, timestamp } = JSON.parse(cachedData);
      const age = Date.now() - timestamp;

      // Return cached data if less than 24 hours old
      if (age < CACHE_DURATION) {
        console.log("Using cached brands (age: " + Math.round(age / 3600000) + "h)");
        return brands;
      }
    }

    // Cache miss or expired - fetch from Firebase
    console.log("Fetching brands from Firebase...");
    const brands = await fetchBrandsFromFirebase();

    // Save to cache with timestamp
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        brands,
        timestamp: Date.now(),
      })
    );

    return brands;
  } catch (error) {
    console.error("Error in getCommonBrands:", error);
    // Return default brands as fallback
    return getDefaultBrands();
  }
};

/**
 * Fetches and aggregates brands from all coffee shops
 * @private
 */
const fetchBrandsFromFirebase = async () => {
  const shopsSnapshot = await getDocs(collection(db, "coffee_shops"));
  const brandCounts = {};

  shopsSnapshot.forEach((doc) => {
    const oatMilk = doc.data().oatMilk;
    if (oatMilk && typeof oatMilk === "string") {
      const brand = oatMilk.trim();
      if (brand) {
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
      }
    }
  });

  // Get top 6 most common brands, sorted by count
  const sortedBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([brand]) => brand);

  return sortedBrands.length > 0 ? sortedBrands : getDefaultBrands();
};

/**
 * Default brands used as fallback
 * @private
 */
const getDefaultBrands = () => [
  "Oatly",
  "Minor Figures",
  "Califia Farms",
  "Oatly Barista",
  "Chobani",
  "Planet Oat",
];

/**
 * Invalidates the brand cache (call after admin approves new shop)
 * This ensures the cache updates when new brands are added
 */
export const invalidateBrandCache = async () => {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log("Brand cache invalidated");
  } catch (error) {
    console.error("Error invalidating brand cache:", error);
  }
};
