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

  return input
    .trim()
    // Remove HTML tags and potentially dangerous characters
    .replace(/[<>]/g, '')
    // Remove null bytes and other control characters
    .replace(/[\x00-\x1f\x7f]/g, '')
    // Limit length
    .substring(0, maxLength);
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
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
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

  // Check for suspicious patterns
  if (/^\s*$/.test(sanitized)) {
    result.isValid = false;
    result.message = 'Shop name cannot be empty or only whitespace';
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
  const upChargeStr = upCharge == null ? '' : String(upCharge);

  if (!upChargeStr || upChargeStr.trim() === '') {
    result.isValid = false;
    result.message = 'Upcharge is required when not free';
    result.error = result.message;
    return result;
  }

  // Remove non-numeric characters except decimal point
  const numericValue = upChargeStr.replace(/[^0-9.]/g, '');
  
  // Check for valid decimal format
  const decimalParts = numericValue.split('.');
  if (decimalParts.length > 2) {
    result.isValid = false;
    result.message = 'Invalid price format';
    result.error = result.message;
    return result;
  }

  const price = parseFloat(numericValue);
  
  if (isNaN(price)) {
    result.isValid = false;
    result.message = 'Please enter a valid price';
    result.error = result.message;
    return result;
  }

  if (price < 0) {
    result.isValid = false;
    result.message = 'Price cannot be negative';
    result.error = result.message;
    return result;
  }

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
    sanitized: emoji || '☕',
    message: '',
    error: ''
  };

  // Basic emoji validation - just ensure it's a single character
  if (emoji && emoji.length > 4) {
    result.sanitized = '☕';
    result.message = 'Invalid emoji, using default';
    result.error = result.message;
  }

  return result;
};