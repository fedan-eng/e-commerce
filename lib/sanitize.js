// lib/sanitize.js

/**
 * Sanitize phone number - only digits, spaces, +, -, ()
 * Strips all letters and special characters
 */
export const sanitizePhone = (value) => {
  if (!value) return "";
  // Allow only digits, +, -, (, ), and spaces
  return String(value).replace(/[^\d+\-()\s]/g, "").slice(0, 20);
};

/**
 * Get only digits from phone (for validation/API)
 */
export const getPhoneDigits = (value) => {
  if (!value) return "";
  return String(value).replace(/\D/g, "");
};

/**
 * Sanitize email - trim, lowercase, remove spaces
 */
export const sanitizeEmail = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase().replace(/\s/g, "").slice(0, 254);
};

/**
 * Validate email format (RFC 5322 simplified)
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate Nigerian phone number
 * Accepts: 080xxxxxxxx, 0803xxxxxxx, +234803xxxxxxx (10-14 digits total)
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const digits = getPhoneDigits(phone);
  return digits.length >= 10 && digits.length <= 14;
};

/**
 * Sanitize name - only letters, spaces, hyphens, apostrophes
 * Removes numbers and special chars
 */
export const sanitizeName = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/[^a-zA-Z\s'-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 50);
};

/**
 * Sanitize general text (address, city, notes) - trim and remove dangerous chars
 */
export const sanitizeText = (value, maxLength = 200) => {
  if (!value) return "";
  return String(value)
    .replace(/[<>]/g, "") // remove HTML brackets
    .slice(0, maxLength);
};

/**
 * Sanitize address - allow alphanumeric, common punctuation
 */
export const sanitizeAddress = (value) => {
  if (!value) return "";
  return String(value)
    .replace(/[<>]/g, "")
    .slice(0, 250);
};
