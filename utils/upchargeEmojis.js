/**
 * Utility functions for determining emojis based on upcharge values
 *
 * Examples:
 * - "Free" → 🆓 Free
 * - "$0.00" → 🆓 +$0.00
 * - "$0.25" → 🤑 +$0.25
 * - "$0.75" → 😊 +$0.75
 * - "$1.50" → 💸 +$1.50
 * - "$2.50" → 😱 +$2.50
 */

/**
 * Normalizes an upcharge value to a display string.
 * Firestore data may contain numbers (legacy docs) or other types; only
 * strings and numbers are meaningful here.
 * @param {*} upcharge - The raw upcharge value
 * @returns {string} Normalized string, or '' if the value is unusable
 */
const normalizeUpcharge = (upcharge) => {
    if (typeof upcharge === 'string') return upcharge;
    if (typeof upcharge === 'number' && Number.isFinite(upcharge)) return String(upcharge);
    return '';
};

/**
 * Get emoji based on upcharge value
 * @param {string|number} upcharge - The upcharge value (e.g., "Free", "$0.50", 1.25)
 * @returns {string} - Appropriate emoji
 */
export const getUpchargeEmoji = (upcharge) => {
    const str = normalizeUpcharge(upcharge);
    if (!str) return "💰";

    // Handle "Free" case
    if (str.toLowerCase() === "free") {
        return "🆓";
    }

    // Extract numeric value from string like "$1.50"
    const numericValue = parseFloat(str.replace(/[^0-9.]/g, ""));

    if (isNaN(numericValue)) return "💰";

    if (numericValue === 0) return "🆓";
    if (numericValue < 0.5) return "🤑";
    if (numericValue < 1.0) return "😊";
    if (numericValue < 2.0) return "💸";
    return "😱";
};

/**
 * Get formatted upcharge text with emoji
 * @param {string|number} upcharge - The upcharge value
 * @returns {string} - Formatted text with emoji
 */
export const getFormattedUpcharge = (upcharge) => {
    const emoji = getUpchargeEmoji(upcharge);
    const str = normalizeUpcharge(upcharge);

    if (!str) return emoji;

    if (str.toLowerCase() === "free") {
        return `${emoji} Free`;
    }

    return `${emoji} +${str}`;
};

/**
 * Get upcharge color based on value
 * @param {string|number} upcharge - The upcharge value
 * @returns {string} - Color hex code
 */
export const getUpchargeColor = (upcharge) => {
    const str = normalizeUpcharge(upcharge);
    if (!str) return "#666";

    if (str.toLowerCase() === "free") {
        return "#4CAF50"; // Green for free
    }

    const numericValue = parseFloat(str.replace(/[^0-9.]/g, ""));

    if (isNaN(numericValue)) return "#666";

    if (numericValue === 0) return "#4CAF50"; // Green
    if (numericValue < 0.5) return "#2196F3"; // Blue - good deal
    if (numericValue < 1.0) return "#FF9800"; // Orange - reasonable
    if (numericValue < 2.0) return "#FF5722"; // Red-orange - expensive
    return "#F44336"; // Red - very expensive
};
