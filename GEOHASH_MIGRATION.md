# Geohash Migration Guide

This guide explains how to migrate existing coffee shops to include geohash fields for location-based queries.

## Why Geohash?

The app now uses geohash-based location queries to:
- ✅ Show ALL nearby shops regardless of creation date
- ✅ Only fetch shops within 50km radius (cost optimization)
- ✅ Scale properly as database grows
- ✅ Fix the bug where old shops disappear after 100 shops exist

## Prerequisites

Before running the migration:

1. **Backup your Firestore data** (Firebase Console → Firestore → Import/Export)
2. **Install dependencies**: `npm install` (geofire-common is already in package.json)
3. **Set Firebase credentials** as environment variables (optional, or edit the script)

## Migration Script

The migration script is located at: `scripts/migrateGeohashes.js`

### Configuration

Edit `scripts/migrateGeohashes.js` and update the Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Or set environment variables:
```bash
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-auth-domain"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_STORAGE_BUCKET="your-storage-bucket"
export FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
export FIREBASE_APP_ID="your-app-id"
```

### Running the Migration

```bash
node scripts/migrateGeohashes.js
```

### What the Script Does

1. Fetches all documents from `coffee_shops` collection
2. For each shop:
   - Checks if it already has a `geohash` field (skips if yes)
   - Validates location data exists
   - Calculates geohash from latitude/longitude
   - Updates document with geohash field
3. Reports progress and results

### Expected Output

```
🚀 Starting geohash migration...

📥 Fetching all coffee shops...
✓ Found 87 shops to migrate

✅ Updated Blue Bottle Coffee (geohash: 9q8yyk)
✅ Updated Philz Coffee (geohash: 9q8yvx)
✅ Updated Sightglass Coffee (geohash: 9q8yvv)
...

============================================================
📊 Migration Summary:
============================================================
Total shops:     87
✅ Successful:   87
⏭️  Skipped:      0
❌ Errors:       0
============================================================

✨ Migration completed successfully!
ℹ️  Next steps:
   1. Create composite index in Firebase Console:
      Collection: coffee_shops
      Fields: geohash (Ascending), createdAt (Descending)
   2. Deploy updated app code
```

## Creating Required Indexes

After migration, you MUST create composite indexes in Firebase:

### Method 1: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID**: `coffee_shops`
   - **Fields to index**:
     - `geohash` - Ascending
     - `createdAt` - Descending (optional, for future queries)
   - **Query scope**: Collection
6. Click **Create**

### Method 2: Automatic (Recommended)

The first time you run the app after migration, Firestore will detect the missing index and provide a direct link in the console logs:

```
Error: The query requires an index. You can create it here:
https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes?create_composite=...
```

Click the link to auto-create the index.

### Method 3: Firebase CLI

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "coffee_shops",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "geohash", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy:
```bash
firebase deploy --only firestore:indexes
```

## Verification

After migration and index creation:

1. **Test the app**: Open HomeScreen and verify shops load
2. **Check logs**: Look for "Loaded X shops within 50km"
3. **Verify geohash**: In Firestore Console, check a few shops have `geohash` field
4. **Test with distance**: Move location and verify nearby shops change

## Troubleshooting

### Error: "Missing location data"

Some shops don't have valid latitude/longitude. Fix manually in Firestore Console.

### Error: "The query requires an index"

You need to create the composite index (see above).

### Shops not appearing

1. Check if you're within 50km of any shop (default radius)
2. Verify geohash field exists on shops
3. Check console logs for error messages
4. Verify composite index is "Enabled" in Firebase Console

### Migration script fails

1. Check Firebase credentials are correct
2. Ensure you have write permissions
3. Check internet connection
4. Verify Firestore rules allow admin access

## Rolling Back

If you need to rollback:

1. The migration only ADDS the `geohash` field, it doesn't modify existing data
2. Remove geohash fields:
   ```bash
   # In Firebase Console, or write a script to remove the field
   ```
3. Revert code changes (git checkout previous commit)

## Performance Impact

**Before Geohash**:
- User in NYC loads ALL shops (100+ shops globally) = 100+ reads
- Old shops disappear after 100 total shops

**After Geohash**:
- User in NYC loads only NYC shops (~20 shops) = 20 reads
- ALL nearby shops appear regardless of age
- 80% reduction in reads for typical use cases

## Cost Impact

**Example: 500 total shops globally**

Before:
- Each user loads 100 most recent shops = 100 reads
- 50 users = 5,000 reads

After:
- Each user loads ~15-30 nearby shops = 20 reads avg
- 50 users = 1,000 reads
- **80% cost reduction**

Plus 30-second refresh:
- 1,000 reads × 2 refreshes/min = 2,000 reads/min
- Still much better than real-time listener (continuous reads)

## Future Optimizations

1. **Dynamic radius**: Adjust 50km based on urban vs rural
2. **Smart refresh**: Only refresh when location changes significantly
3. **Real-time for nearby shops**: Hybrid approach with geohash + onSnapshot
4. **Pagination**: Load closest 20, then expand radius if needed

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all shops have valid location data
3. Ensure composite indexes are created and enabled
4. Check Firestore rules allow necessary operations
