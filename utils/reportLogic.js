/**
 * Pure consensus rules for community shop reports.
 *
 * A shop's displayed data (brand, upcharge) is treated as a claim that the
 * community continuously confirms or disputes. The rules are deliberately
 * simple and explainable:
 *
 * - A confirmation refreshes the shop's freshness clock.
 * - An ON-SITE confirmation (made within ONSITE_RADIUS_METERS of the shop)
 *   is the strongest signal: it also clears standing disputes.
 * - A shop becomes "disputed" after DISPUTE_THRESHOLD disputes, or a single
 *   on-site dispute.
 * - Data older than FRESHNESS_WINDOW_DAYS without confirmation is "stale".
 *
 * Everything here is pure (no Firestore imports) so it can be unit-tested;
 * services/reportService.js applies these rules to the database.
 */

import {getDistanceMeters} from './GeoUtils';

export const ONSITE_RADIUS_METERS = 150;
export const FRESHNESS_WINDOW_DAYS = 90;
export const DISPUTE_THRESHOLD = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Converts the timestamp shapes that appear in this codebase to epoch
 * millis: Firestore Timestamp, Date, number, ISO string.
 * @returns {number|null} Epoch millis, or null if unusable
 */
export const toMillis = (value) => {
    if (value == null) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (value instanceof Date) return value.getTime();
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.seconds === 'number') return value.seconds * 1000;
    if (typeof value === 'string') {
        const t = Date.parse(value);
        return Number.isNaN(t) ? null : t;
    }
    return null;
};

/**
 * Whether the user is physically at the shop (within ONSITE_RADIUS_METERS).
 */
export const isOnSite = (userLocation, shopLocation) => {
    if (!userLocation || !shopLocation) return false;
    const distance = getDistanceMeters(userLocation, shopLocation);
    return Number.isFinite(distance) && distance <= ONSITE_RADIUS_METERS;
};

/**
 * Derives a shop's trust status from its materialized report counters.
 * @returns {'disputed'|'fresh'|'stale'|'unverified'}
 */
export const deriveDataStatus = (shop, now = Date.now()) => {
    if (!shop) return 'unverified';

    const disputes = shop.disputeCount || 0;
    if (disputes >= DISPUTE_THRESHOLD || (disputes >= 1 && shop.lastDisputeOnSite)) {
        return 'disputed';
    }

    const reference = toMillis(shop.lastConfirmedAt) ?? toMillis(shop.createdAt);
    if (reference == null) return 'unverified';

    return now - reference <= FRESHNESS_WINDOW_DAYS * DAY_MS ? 'fresh' : 'stale';
};

/**
 * Compact "how long ago" formatting for freshness display.
 * @returns {string|null} e.g. 'today', '3d ago', '2w ago', '4mo ago'
 */
export const formatTimeAgo = (value, now = Date.now()) => {
    const t = toMillis(value);
    if (t == null) return null;

    const days = Math.floor(Math.max(0, now - t) / DAY_MS);
    if (days < 1) return 'today';
    if (days < 14) return `${days}d ago`;
    if (days < 60) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
};

/**
 * Human-readable status line for the shop detail view, so the app can show
 * WHY data is trusted rather than just a checkmark.
 * @returns {{status: string, label: string}}
 */
export const describeDataStatus = (shop, now = Date.now()) => {
    const status = deriveDataStatus(shop, now);

    if (status === 'disputed') {
        return {status, label: '⚠ Recent reports say this info may have changed'};
    }
    if (status === 'fresh') {
        const ago = formatTimeAgo(toMillis(shop.lastConfirmedAt) ?? toMillis(shop.createdAt), now);
        const count = shop.confirmCount || 0;
        const suffix = count > 1 ? ` · ${count} confirmations` : '';
        return shop.lastConfirmedAt
            ? {status, label: `✓ Confirmed ${ago}${suffix}`}
            : {status, label: `Added ${ago} — not yet confirmed`};
    }
    if (status === 'stale') {
        const ago = formatTimeAgo(toMillis(shop.lastConfirmedAt) ?? toMillis(shop.createdAt), now);
        return shop.lastConfirmedAt
            ? {status, label: `⏳ Last confirmed ${ago} — still accurate?`}
            : {status, label: `⏳ Added ${ago} — never confirmed`};
    }
    return {status, label: 'Not yet confirmed by the community'};
};

/**
 * Computes the materialized counter updates a report applies to its shop
 * document. Timestamps are returned as epoch millis; the service layer
 * converts them to Dates for Firestore.
 *
 * Because a user's report doc is keyed by uid, submitting again OVERWRITES
 * their previous report — so `previousType` is used to reconcile the old
 * contribution out of the counters first. Counters therefore track live
 * reports (one per user), not submission events: a lone user re-disputing
 * can never push disputeCount to the disputed threshold by themselves.
 *
 * Must be called with fresh shop data (the service runs it inside a
 * Firestore transaction) so concurrent reports can't clobber each other.
 *
 * @param {Object} shop - Current shop document data
 * @param {Object} report - {type, onSite, now?, previousType?} where
 *   previousType is the user's overwritten report type, if any
 * @returns {Object} Field updates for the shop document
 */
export const computeShopUpdateForReport = (
    shop,
    {type, onSite = false, now = Date.now(), previousType = null}
) => {
    const confirmCount = (shop && shop.confirmCount) || 0;
    const disputeCount = (shop && shop.disputeCount) || 0;
    const hadOnSiteDispute = Boolean(shop && shop.lastDisputeOnSite);

    if (type === 'confirm') {
        // Replacing our own dispute removes it; an on-site confirmation
        // clears all disputes — being at the counter outweighs remote reports
        let newDisputeCount = previousType === 'dispute'
            ? Math.max(0, disputeCount - 1)
            : disputeCount;
        if (onSite) newDisputeCount = 0;

        return {
            lastConfirmedAt: now,
            // Replacing our own confirmation refreshes the clock without
            // inflating the count
            confirmCount: confirmCount + (previousType === 'confirm' ? 0 : 1),
            disputeCount: newDisputeCount,
            lastDisputeOnSite: newDisputeCount === 0 ? false : hadOnSiteDispute,
            ...(onSite ? {lastOnSiteConfirmedAt: now} : {}),
        };
    }

    if (type === 'dispute') {
        const newDisputeCount = disputeCount + (previousType === 'dispute' ? 0 : 1);
        return {
            disputeCount: newDisputeCount,
            lastDisputedAt: now,
            // The sticky on-site flag only survives if disputes other than
            // this user's replaced one could have set it
            lastDisputeOnSite: onSite || (newDisputeCount > 1 && hadOnSiteDispute),
            ...(previousType === 'confirm'
                ? {confirmCount: Math.max(0, confirmCount - 1)}
                : {}),
        };
    }

    throw new Error(`Unknown report type: ${type}`);
};
