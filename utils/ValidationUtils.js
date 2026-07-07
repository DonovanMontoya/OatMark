/**
 * Input validation and sanitization utilities
 * Provides security-focused validation for user inputs
 */

/**
 * Validates and sanitizes text input
 * @param {string} input - The input string to validate
 * @param {number} maxLength - Maximum allowed length (default: 100)
 * @returns {string} Sanitized and validated input
 */
export const sanitizeTextInput = (input, maxLength = 100) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const cleaned = input
    // Remove HTML tags and potentially dangerous characters
    .replace(/[<>]/g, '')
    // Remove null bytes and other control characters (C0, DEL, C1)
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    // Remove invisible format characters: zero-width chars, bidi controls
    // (e.g. U+202E right-to-left override), BOM, soft hyphen
    .replace(/\p{Cf}/gu, '');

  // Truncate by code point so surrogate pairs (emoji) are never split in
  // half, and drop any unpaired surrogates that arrived in the input —
  // both produce invalid UTF-16 that renders as � and can break
  // serialization.
  return [...cleaned]
    .filter((c) => {
      const cp = c.codePointAt(0);
      return cp < 0xd800 || cp > 0xdfff;
    })
    .slice(0, maxLength)
    .join('')
    .trim();
};

/**
 * Validates email address format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) && trimmed.length <= 254;
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and messages
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    messages: []
  };

  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.messages.push('Password is required');
    return result;
  }

  if (password.length < 8) {
    result.isValid = false;
    result.messages.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    result.isValid = false;
    result.messages.push('Password is too long');
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.messages.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.messages.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    result.isValid = false;
    result.messages.push('Password must contain at least one number');
  }

  return result;
};

/**
 * Validates geographical coordinates
 * @param {object} location - Location object with latitude and longitude
 * @returns {boolean} True if valid coordinates
 */
export const isValidLocation = (location) => {
  if (!location || typeof location !== 'object') {
    return false;
  }

  const { latitude, longitude } = location;

  // Check if latitude and longitude are numbers
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return false;
  }

  // Check if coordinates are within valid ranges
  if (latitude < -90 || latitude > 90) {
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    return false;
  }

  // Check if coordinates are not NaN or Infinity
  return !(!Number.isFinite(latitude) || !Number.isFinite(longitude));


};

/**
 * Validates shop name input
 * @param {string} shopName - Shop name to validate
 * @returns {object} Validation result
 */
export const validateShopName = (shopName) => {
  const sanitized = sanitizeTextInput(shopName, 50);
  
  const result = {
    isValid: true,
    sanitized,
    message: '',
    error: ''
  };

  if (!sanitized || sanitized.length < 2) {
    result.isValid = false;
    result.message = 'Shop name must be at least 2 characters long';
    result.error = result.message;
  }

  return result;
};

/**
 * Validates oat milk brand input
 * @param {string} oatMilk - Oat milk brand to validate
 * @returns {object} Validation result
 */
export const validateOatMilk = (oatMilk) => {
  const sanitized = sanitizeTextInput(oatMilk, 30);
  
  const result = {
    isValid: true,
    sanitized,
    message: '',
    error: ''
  };

  if (!sanitized || sanitized.length < 2) {
    result.isValid = false;
    result.message = 'Oat milk brand must be at least 2 characters long';
    result.error = result.message;
  }

  return result;
};

/**
 * Validates upcharge amount
 * @param {string} upCharge - Upcharge amount as string
 * @param {boolean} isFree - Whether the upcharge is marked as free
 * @returns {object} Validation result
 */
export const validateUpcharge = (upCharge, isFree = false) => {
  const result = {
    isValid: true,
    message: '',
    error: '',
    sanitized: isFree ? 'Free' : (upCharge || '')
  };

  if (isFree) {
    return result; // Free is always valid
  }

  // Handle undefined, null, or non-string values by converting to string
  const upChargeStr = upCharge == null ? '' : String(upCharge).trim();

  if (!upChargeStr) {
    result.isValid = false;
    result.message = 'Upcharge is required when not free';
    result.error = result.message;
    return result;
  }

  // Require an actual price: optional $, digits, optional cents.
  // Stripping unexpected characters and parsing what's left silently
  // misreads input ("-5" became $5.00, "1e3" became $13.00), so anything
  // that doesn't look like a price is rejected instead.
  const match = upChargeStr.match(/^\$?(\d{1,3}(?:\.\d{0,2})?|\.\d{1,2})$/);

  if (!match) {
    result.isValid = false;
    result.message = 'Please enter a valid price';
    result.error = result.message;
    return result;
  }

  const price = parseFloat(match[1]);

  if (price > 99.99) {
    result.isValid = false;
    result.message = 'Price seems unreasonably high';
    result.error = result.message;
    return result;
  }

  result.sanitized = `$${price.toFixed(2)}`;
  return result;
};

/**
 * Validates emoji selection
 * @param {string} emoji - Emoji to validate
 * @returns {object} Validation result
 */
export const validateEmoji = (emoji) => {
  const result = {
    isValid: true,
    sanitized: '☕',
    message: '',
    error: ''
  };

  if (!emoji || typeof emoji !== 'string') {
    return result;
  }

  // A valid emoji starts with a pictographic character, optionally followed
  // by modifiers/components (skin tones, variation selectors) or further
  // ZWJ-joined pictographs (e.g. 👨‍👩‍👧‍👦). Length cap guards against
  // pathological ZWJ chains. Anything else falls back to the default.
  const emojiPattern = /^\p{Extended_Pictographic}(?:\p{Extended_Pictographic}|\p{Emoji_Component}|\u200D|\uFE0E|\uFE0F)*$/u;

  if (emoji.length <= 16 && emojiPattern.test(emoji)) {
    result.sanitized = emoji;
  } else {
    result.message = 'Invalid emoji, using default';
    result.error = result.message;
  }

  return result;
};