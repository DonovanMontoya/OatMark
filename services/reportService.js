/**
 * Community report writes: one-tap confirmations and "this changed"
 * disputes against a shop's displayed data.
 *
 * Data model: coffee_shops/{shopId}/reports/{userId} — one live report per
 * user per shop (re-reporting overwrites), which naturally bounds report
 * volume and makes the per-user rate limit enforceable in security rules.
 * The consensus counters the report implies are materialized onto the shop
 * document in the same batch so reads stay a single doc.
 *
 * Consensus rules live in utils/reportLogic.js (pure, unit-tested).
 */

import {doc, getDoc, writeBatch} from 'firebase/firestore';
import {db} from './firebase';
import {computeShopUpdateForReport, isOnSite, toMillis} from '../utils/reportLogic';

// A user's repeat report of the same type within this window is ignored
const REPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const TIMESTAMP_FIELDS = ['lastConfirmedAt', 'lastDisputedAt', 'lastOnSiteConfirmedAt'];

/**
 * Records a community report for a shop and updates its consensus counters.
 *
 * @param {Object} params
 * @param {Object} params.shop - Shop object (needs id, location, oatMilk, upCharge)
 * @param {'confirm'|'dispute'} params.type - Report type
 * @param {string} params.userId - Authenticated user's uid
 * @param {Object|null} params.userLocation - Current user location, for on-site weighting
 * @param {string|null} params.suggestedBrand - For disputes: what the brand actually is
 * @param {string|null} params.suggestedUpCharge - For disputes: what the upcharge actually is
 * @returns {Promise<{written: boolean, onSite: boolean, reason?: string}>}
 */
export const submitShopReport = async ({
    shop,
    type,
    userId,
    userLocation = null,
    suggestedBrand = null,
    suggestedUpCharge = null,
}) => {
    if (!shop || !shop.id) {
        throw new Error('A shop with an id is required');
    }
    if (!userId) {
        throw new Error('You must be logged in to report');
    }
    if (type !== 'confirm' && type !== 'dispute') {
        throw new Error(`Unknown report type: ${type}`);
    }

    const now = Date.now();
    const onSite = isOnSite(userLocation, shop.location);
    const reportRef = doc(db, 'coffee_shops', shop.id, 'reports', userId);

    // Ignore repeat reports of the same type within the cooldown window
    const existing = await getDoc(reportRef);
    if (existing.exists()) {
        const previous = existing.data();
        const previousAt = toMillis(previous.createdAt);
        if (
            previous.type === type &&
            previousAt != null &&
            now - previousAt < REPORT_COOLDOWN_MS
        ) {
            return {written: false, onSite, reason: 'cooldown'};
        }
    }

    const report = {
        type,
        onSite,
        userId,
        createdAt: new Date(now),
        // Snapshot what the user saw, so disputes stay meaningful after edits
        brandAtReport: shop.oatMilk ?? null,
        upChargeAtReport: shop.upCharge ?? null,
    };
    if (type === 'dispute') {
        report.suggestedBrand = suggestedBrand;
        report.suggestedUpCharge = suggestedUpCharge;
    }

    const shopUpdate = computeShopUpdateForReport(shop, {type, onSite, now});
    for (const field of TIMESTAMP_FIELDS) {
        if (field in shopUpdate) {
            shopUpdate[field] = new Date(shopUpdate[field]);
        }
    }

    const batch = writeBatch(db);
    batch.set(reportRef, report);
    batch.update(doc(db, 'coffee_shops', shop.id), shopUpdate);
    await batch.commit();

    return {written: true, onSite};
};
