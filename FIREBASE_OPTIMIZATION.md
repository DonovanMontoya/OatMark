# Firebase Cost Optimization Report

**Date**: 2025-11-29
**Status**: ✅ Full optimizations implemented (including geohash)
**Estimated Cost Reduction**: ~85-95% for typical usage patterns

---

## 📊 Executive Summary

This document outlines Firebase read/write inefficiencies identified in OatMark and the optimizations implemented to reduce costs while maintaining app functionality.

### Before Optimization
- **Estimated monthly reads**: ~1,950,000 (with 50 daily active users)
- **Free tier limit**: 50,000 reads/day
- **Cost**: Exceeds free tier within hours

### After Optimization (with Geohash)
- **Estimated monthly reads**: ~120,000 (94% reduction)
- **Free tier status**: Within limits for up to ~400 daily users
- **Cost**: Stays free for significant growth

---

## 🔴 Critical Issues Fixed

### 1. ✅ Duplicate Brand Aggregation Queries

**Problem**:
- `SubmitShopScreen.js` and `EditShopDetailsModal.js` both fetched ALL coffee shops
- Identical code duplicated across files
- No caching - fetched on every screen open
- **Cost**: 100 reads × screen opens per day = thousands of unnecessary reads

**Solution Implemented**:
- Created centralized `services/brandCache.js` utility
- 24-hour cache using AsyncStorage
- Single code path shared between screens
- Cache invalidation when admin approves new shops

**Files Modified**:
- ✅ Created: `/services/brandCache.js`
- ✅ Updated: `/components/SubmitShopScreen.js` (lines 14-16, 95-102)
- ✅ Updated: `/components/EditShopDetailsModal.js` (lines 3-5, 35-43)
- ✅ Updated: `/components/AdminScreen.js` (added cache invalidation)

**Cost Savings**:
```
Before: 100 reads × 10 screen opens/day = 1,000 reads/day
After:  100 reads × 1 cache refresh/day = 100 reads/day
Savings: 90% reduction
```

---

### 2. ✅ Geohash-Based Location Queries

**Problem**:
- `HomeScreen.js` used `onSnapshot(collection(db, "coffee_shops"))` with NO limits
- Fetched all shops regardless of user location
- After adding limit(100), old shops would disappear (P1 bug!)
- Every shop update triggered re-read of entire collection
- **Cost scaling**: 10 online users × 100 shops × 1 update = 1,000 reads per update

**Solution Implemented**:
- Implemented geohash-based location queries using `geofire-common`
- Only fetches shops within 50km radius of user
- Shows ALL nearby shops regardless of creation date (fixes P1 bug)
- Switched from real-time listener to periodic refresh (30s interval)
- Client-side distance sorting for accurate results

**Files Created**:
- ✅ Created: `/utils/GeoHashUtils.js` - Geohash utility functions
- ✅ Created: `/scripts/migrateGeohashes.js` - Migration script
- ✅ Created: `/GEOHASH_MIGRATION.md` - Migration guide

**Files Modified**:
- ✅ Updated: `/HomeScreen.js` - Geohash queries with 50km radius
- ✅ Updated: `/components/SubmitShopScreen.js` - Add geohash on creation
- ✅ Updated: `/components/AdminScreen.js` - Add geohash on approval
- ✅ Updated: `/components/AdjustPinModal.js` - Update geohash when location changes

**Cost Savings**:
```
Before: 100 shops globally = 100 reads per user (or worse with onSnapshot)
After:  ~15-30 nearby shops = 20 reads avg per user
Savings: 80% reduction in reads
```

**Migration Required**: Run `node scripts/migrateGeohashes.js` to add geohash to existing shops.

---

## ⚠️ Current Query Patterns (Optimized)

### Read Operations Summary

| Screen | Collection | Type | Frequency | Reads/Load | Cost Impact |
|--------|-----------|------|-----------|------------|-------------|
| HomeScreen | `coffee_shops` | Geohash query | On mount + 30s refresh | ~20 (nearby only) | ✅ Low |
| HomeScreen | `users/{uid}` | Real-time | On mount | 1 | Very Low |
| AdminScreen | `pendingShops` | Real-time | On mount | Variable (~5-20) | Low |
| PendingShopsScreen | `pendingShops` | Real-time | On mount | Variable (~1-5) | Very Low |
| SubmitScreen | Brand cache | Cached | On mount | 0 (cached) | ✅ None |
| EditModal | Brand cache | Cached | On mount | 0 (cached) | ✅ None |

### Write Operations Summary

| Action | Type | Collections | Reads | Writes | Notes |
|--------|------|------------|-------|--------|-------|
| Submit Shop | `addDoc` | `pendingShops` | 0 | 1 | Efficient |
| Approve Shop | `transaction` | `pendingShops` → `coffee_shops` | 2 | 2 | Atomic, good |
| Reject Shop | `deleteDoc` | `pendingShops` | 0 | 1 | Efficient |
| Toggle Favorite | `updateDoc` | `users` | 0 | 1 | Efficient |
| Edit Shop Details | `updateDoc` | `coffee_shops` or `pendingShops` | 0 | 1 | Efficient |

---

## 💰 Cost Projection (After Optimization)

### Scenario: 50 Daily Active Users

**Assumptions**:
- Each user opens app 2 times/day
- 3 screen views per session
- 10 shop submissions/day
- 5 favorites toggled/day
- 100 total coffee shops in database

**Daily Reads** (with Geohash):
```
Home Screen loads:     50 users × 2 sessions × 20 reads  = 2,000
Home Screen refreshes: 50 users × 2 sessions × 20 reads  = 2,000 (30s intervals)
User favorites loads:  50 users × 2 sessions × 1 read    = 100
Admin reviews:         2 admins × 20 reads               = 40
Brand cache refresh:   1 refresh × 100 reads             = 100
Other queries:                                             200
─────────────────────────────────────────────────────────
Total:                                                   4,440 reads/day
```

**Monthly**: 4,440 × 30 = ~133,000 reads

**Firestore Pricing** (as of 2025):
- Free tier: 50,000 reads/day (1.5M/month)
- ✅ **Status**: WELL WITHIN FREE TIER

### Scenario: 200 Daily Active Users

```
Home Screen: 200 × 2 sessions × 40 reads (load + refresh) = 16,000
Other operations:                                             800
─────────────────────────────────────────────────────────────
Daily reads: ~16,800
Monthly: ~504,000 reads
Status: ✅ WITHIN FREE TIER
```

### Scenario: 500 Daily Active Users (Future Growth)

```
Home Screen: 500 × 2 sessions × 40 reads = 40,000
Other operations:                            2,000
───────────────────────────────────────────────
Daily reads: ~42,000
Monthly: ~1,260,000 reads
Status: ✅ WITHIN FREE TIER
Cost: $0 (well under 1.5M/month limit)
```

---

## 🎯 Future Optimizations

### Priority 1: Pagination for Admin Screen

**Current**:
- Loads all pending shops at once

**Recommendation**:
- Add pagination with `limit(20)` and "Load More" button
- Only load next page when requested

**Implementation**:
```javascript
const firstPage = query(
  collection(db, "pendingShops"),
  orderBy("createdAt", "desc"),
  limit(20)
);

// For next page:
const next = query(
  collection(db, "pendingShops"),
  orderBy("createdAt", "desc"),
  startAfter(lastDoc),
  limit(20)
);
```

**Cost Impact**: Minimal (pending shops usually small volume)

---

### Priority 2: Selective Field Fetching

**Current**:
- Fetches entire shop documents

**Recommendation**:
- For list views, use Firestore's `select()` to fetch only needed fields
- Only fetch full documents when viewing details

**Example**:
```javascript
// List view - only name, location, oatMilk, upCharge
const listQuery = query(
  collection(db, "coffee_shops"),
  select("name", "location", "oatMilk", "upCharge", "emoji")
);
```

**Cost Impact**: Read counts stay same, but reduces bandwidth

---

### Priority 3: Batched Writes for Bulk Operations

**Current**: Individual writes (already efficient)

**Future Consideration**:
- If implementing bulk admin actions, use `writeBatch()`

---

### Priority 4: Dynamic Search Radius

**Current**: Fixed 50km radius for all users

**Recommendation**:
- Urban areas (high shop density): 10-20km radius
- Suburban areas: 30-50km radius
- Rural areas: 100km+ radius
- Detect density and adjust dynamically

**Cost Impact**: Further 20-40% reduction in urban areas

---

## 📋 Required Firebase Indexes

To support the optimizations, ensure these indexes exist:

### Required Indexes

```json
{
  "indexes": [
    {
      "collectionGroup": "coffee_shops",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "geohash", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "pendingShops",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Critical**: The `geohash` index is **REQUIRED** for the app to work with geohash queries.

**How to add**:
1. Run app and trigger queries
2. Check Firebase console logs for index creation links
3. Or manually add via Firebase Console → Firestore → Indexes

---

## 🔧 Monitoring & Best Practices

### Monitor These Metrics

1. **Firebase Console → Usage Tab**:
   - Document reads/day
   - Document writes/day
   - Cost trends

2. **Set Budget Alerts**:
   - Navigate to Firebase → Settings → Usage and billing
   - Set alerts at 50%, 80%, 100% of free tier

3. **App Logs**:
   - Brand cache hit rate (should be >95%)
   - Query latencies
   - Error rates

### Code Best Practices

✅ **Good Patterns** (Already Implemented):
- Real-time listeners properly unsubscribed on unmount
- Optimistic updates for better UX
- Transactions for atomic multi-step operations
- Offline caching with AsyncStorage
- Comprehensive validation before writes
- Array operations (`arrayUnion`, `arrayRemove`) for favorites

❌ **Anti-patterns to Avoid**:
- Listening to entire collections without limits
- Fetching all documents for aggregation without caching
- Real-time listeners that never unsubscribe
- Writes without validation
- No error handling

---

## 📝 Implementation Checklist

### ✅ Completed (2025-11-29)
- [x] Create centralized brand cache utility
- [x] Update SubmitShopScreen to use cache
- [x] Update EditShopDetailsModal to use cache
- [x] Add cache invalidation to AdminScreen
- [x] **Implement geohash location queries (P1 fix)**
- [x] Create geohash utility functions
- [x] Update all shop creation/edit to include geohash
- [x] Create migration script for existing shops
- [x] Update HomeScreen to use geohash queries (50km radius)
- [x] Switch to periodic refresh (30s) instead of real-time listener
- [x] Document all optimizations

### 🔜 Recommended Next Steps
- [ ] **Run migration script**: `node scripts/migrateGeohashes.js`
- [ ] **Create Firebase geohash index** (will be prompted automatically)
- [ ] Monitor usage for 1 week to validate savings
- [ ] Test with real-world data and various locations
- [ ] Set up Firebase budget alerts
- [ ] Consider implementing analytics to track query patterns

### 🎯 Future Considerations
- [ ] Add pagination to admin screens
- [ ] Consider selective field fetching
- [ ] Implement dynamic search radius based on density
- [ ] Explore Firestore bundle downloads for static data

---

## 🧪 Testing Recommendations

1. **Cache Testing**:
   ```bash
   # Test brand cache works
   - Open SubmitScreen → Check logs for "Using cached brands"
   - Wait 24h → Check logs for "Fetching brands from Firebase"
   - Approve new shop → Check "Brand cache invalidated"
   ```

2. **Geohash Query Testing**:
   ```bash
   # Verify geohash queries work
   - Run migration: node scripts/migrateGeohashes.js
   - Create Firebase geohash index
   - Load HomeScreen in different locations
   - Verify only nearby shops appear (within 50km)
   - Check logs: "Loaded X shops within 50km"
   - Verify old shops appear if they're nearby
   ```

3. **Cost Monitoring**:
   ```bash
   # Firebase Console
   - Before optimization snapshot
   - 1 week after snapshot
   - Compare read counts
   - Validate 70-85% reduction
   ```

---

## 📞 Support & Questions

**Optimization by**: Claude (AI Assistant)
**Date**: 2025-11-29

**Questions or Issues?**:
- Check Firebase Console for actual usage metrics
- Review logs for cache hit rates
- Test with realistic user volumes
- Consider implementing analytics for query patterns

**Future Assistance**:
- Geohash implementation guide available on request
- Firebase budget setup assistance
- Query optimization for specific screens

---

## 📚 Additional Resources

- [Firestore Pricing](https://firebase.google.com/pricing)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Geofire for Firestore](https://github.com/firebase/geofire-js)
- [Firestore Query Optimization](https://firebase.google.com/docs/firestore/query-data/queries)
- [AsyncStorage Best Practices](https://react-native-async-storage.github.io/async-storage/docs/usage/)

---

**Last Updated**: 2025-11-29
