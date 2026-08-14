/**
 * Sanitize string input to prevent SQL injection
 * Note: This is a secondary defense. Primary defense is parameterized queries.
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous SQL characters
  return input
    .replace(/'/g, "''")  // Escape single quotes
    .replace(/;/g, '')     // Remove semicolons
    .replace(/--/g, '')    // Remove SQL comments
    .replace(/\/\*/g, '')  // Remove multi-line comment start
    .replace(/\*\//g, ''); // Remove multi-line comment end
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate integer
 * @param {*} value - Value to validate
 * @returns {boolean} - True if valid integer
 */
const isValidInteger = (value) => {
  return Number.isInteger(Number(value)) && Number(value) >= 0;
};

/**
 * Sanitize object keys (for dynamic queries)
 * @param {Object} obj - Object with user input
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeString(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

module.exports = {
  sanitizeString,
  isValidEmail,
  isValidInteger,
  sanitizeObject,
};
