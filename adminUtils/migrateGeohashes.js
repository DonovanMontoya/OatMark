/**
 * Migration script to add geohash field to existing coffee shops
 *
 * Run this once to update all existing shops in Firestore with geohash values
 *
 * Usage:
 *   node adminUtils/migrateGeohashes.js
 *
 * This script:
 * 1. Fetches all documents from coffee_shops collection
 * 2. Calculates geohash for each shop's location
 * 3. Updates each document with the geohash field
 * 4. Reports progress and results
 */

const admin = require('firebase-admin');
const { geohashForLocation } = require('geofire-common');
const path = require('path');

// Load service account from parent directory
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccount.json');
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateGeohashes() {
  console.log('🚀 Starting geohash migration...\n');

  try {
    // Fetch all coffee shops
    console.log('📥 Fetching all coffee shops...');
    const shopsSnapshot = await db.collection('coffee_shops').get();
    const totalShops = shopsSnapshot.size;
    console.log(`✓ Found ${totalShops} shops to migrate\n`);

    if (totalShops === 0) {
      console.log('ℹ️  No shops to migrate');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Process each shop
    for (const shopDoc of shopsSnapshot.docs) {
      const shopData = shopDoc.data();
      const shopId = shopDoc.id;

      // Check if shop already has geohash
      if (shopData.geohash) {
        console.log(`⏭️  Skipping ${shopData.name || shopId} (already has geohash)`);
        skippedCount++;
        continue;
      }

      // Validate location data
      if (!shopData.location?.latitude || !shopData.location?.longitude) {
        console.error(`❌ ${shopData.name || shopId}: Missing location data`);
        errors.push({ id: shopId, name: shopData.name, error: 'Missing location' });
        errorCount++;
        continue;
      }

      try {
        // Calculate geohash
        const geohash = geohashForLocation([
          shopData.location.latitude,
          shopData.location.longitude
        ]);

        // Update document
        await db.collection('coffee_shops').doc(shopId).update({
          geohash: geohash
        });

        console.log(`✅ Updated ${shopData.name || shopId} (geohash: ${geohash})`);
        successCount++;

      } catch (error) {
        console.error(`❌ ${shopData.name || shopId}: ${error.message}`);
        errors.push({ id: shopId, name: shopData.name, error: error.message });
        errorCount++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total shops:     ${totalShops}`);
    console.log(`✅ Successful:   ${successCount}`);
    console.log(`⏭️  Skipped:      ${skippedCount}`);
    console.log(`❌ Errors:       ${errorCount}`);
    console.log('='.repeat(60));

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(err => {
        console.log(`  - ${err.name || err.id}: ${err.error}`);
      });
    }

    if (successCount > 0) {
      console.log('\n✨ Migration completed successfully!');
      console.log('ℹ️  Next steps:');
      console.log('   1. Create composite index in Firebase Console:');
      console.log('      Collection: coffee_shops');
      console.log('      Fields: geohash (Ascending), createdAt (Descending)');
      console.log('   2. Deploy updated app code');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateGeohashes()
  .then(() => {
    console.log('\n✓ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
