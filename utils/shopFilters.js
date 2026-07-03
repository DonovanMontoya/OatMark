/**
 * Client-side shop filtering by oat milk brand and upcharge.
 *
 * Shops are already fully loaded into HomeScreen state via the Firestore
 * listener, so filtering (and deriving the brand chips) happens in memory —
 * no extra queries or schema changes.
 */

/**
 * Price filter definitions, keyed by id. `matches` receives the parsed
 * upcharge amount in dollars (never null).
 */
export const PRICE_FILTERS = [
    {id: 'free', label: '🆓 Free', matches: (amount) => amount === 0},
    {id: 'under1', label: '💸 Under $1', matches: (amount) => amount < 1},
];

/**
 * Parses a shop's upcharge into a dollar amount.
 * Handles every shape that exists in the data: "Free", "$1.50", "1.50",
 * ".5", legacy numeric values, and the shop-level isFree flag.
 * @param {*} upCharge - Raw upCharge value from the shop document
 * @param {boolean} isFreeFlag - The shop's isFree property, if present
 * @returns {number|null} Amount in dollars, or null if unparseable/missing
 */
export const parseUpchargeAmount = (upCharge, isFreeFlag = false) => {
    if (isFreeFlag) return 0;
    if (typeof upCharge === 'number' && Number.isFinite(upCharge) && upCharge >= 0) {
        return upCharge;
    }
    if (typeof upCharge !== 'string') return null;

    const str = upCharge.trim();
    if (!str) return null;
    if (str.toLowerCase() === 'free') return 0;

    const match = str.match(/^\$?(\d{1,3}(?:\.\d{0,2})?|\.\d{1,2})$/);
    return match ? parseFloat(match[1]) : null;
};

/**
 * Normalizes a brand name for comparison (matching is case-insensitive
 * but display keeps the stored casing).
 */
const normalizeBrand = (brand) =>
    typeof brand === 'string' ? brand.trim().toLowerCase() : '';

/**
 * Whether two brand names refer to the same brand (case/whitespace
 * insensitive). Both must be non-empty to match.
 */
export const isSameBrand = (a, b) => {
    const na = normalizeBrand(a);
    return na !== '' && na === normalizeBrand(b);
};

/**
 * Filters shops by brand and/or price.
 * Shops whose upcharge can't be parsed are excluded when a price filter is
 * active — an unverifiable "maybe free" result would defeat the filter.
 * @param {Array} shops - Shop objects
 * @param {Object} filters - {brand: string|null, priceId: string|null}
 * @returns {Array} Filtered shops (same array if no filters active)
 */
export const filterShops = (shops, {brand = null, priceId = null} = {}) => {
    if (!Array.isArray(shops)) return [];
    if (!brand && !priceId) return shops;

    const wantedBrand = normalizeBrand(brand);
    const priceFilter = priceId
        ? PRICE_FILTERS.find((f) => f.id === priceId)
        : null;

    return shops.filter((shop) => {
        if (wantedBrand && normalizeBrand(shop.oatMilk) !== wantedBrand) {
            return false;
        }
        if (priceFilter) {
            const amount = parseUpchargeAmount(shop.upCharge, shop.isFree);
            if (amount === null || !priceFilter.matches(amount)) {
                return false;
            }
        }
        return true;
    });
};

/**
 * Ensures the selected brand always has a chip to represent it, even when
 * a real-time shop update pushes it out of the top-brands list. Without
 * this, the list/map stay filtered by a brand with no visible, clearable
 * chip.
 * @param {Array<string>} brands - Brand names for the chip row
 * @param {string|null} selectedBrand - Currently active brand filter
 * @returns {Array<string>} Brands with the selected brand guaranteed present
 */
export const ensureBrandIncluded = (brands, selectedBrand) => {
    const list = Array.isArray(brands) ? brands : [];
    if (!selectedBrand) return list;

    const wanted = normalizeBrand(selectedBrand);
    return list.some((brand) => normalizeBrand(brand) === wanted)
        ? list
        : [selectedBrand, ...list];
};

/**
 * Derives the most common oat milk brands from the loaded shops, for use
 * as filter chips. Groups case-insensitively, displays the most common
 * casing.
 * @param {Array} shops - Shop objects
 * @param {number} limit - Max number of brands to return
 * @returns {Array<string>} Brand names, most common first
 */
export const getTopBrands = (shops, limit = 6) => {
    if (!Array.isArray(shops)) return [];

    const counts = new Map(); // normalized -> {display: Map<casing, count>, total}
    for (const shop of shops) {
        if (typeof shop.oatMilk !== 'string') continue;
        const display = shop.oatMilk.trim();
        if (!display) continue;
        const key = display.toLowerCase();

        if (!counts.has(key)) {
            counts.set(key, {casings: new Map(), total: 0});
        }
        const entry = counts.get(key);
        entry.total += 1;
        entry.casings.set(display, (entry.casings.get(display) || 0) + 1);
    }

    return [...counts.values()]
        .sort((a, b) => b.total - a.total)
        .slice(0, limit)
        .map((entry) =>
            [...entry.casings.entries()].sort((a, b) => b[1] - a[1])[0][0]
        );
};
