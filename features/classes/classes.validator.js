const { TINGKAT } = require('../../shared/constants');
const { isValidInteger } = require('../../shared/utils/sqlSanitizer');

/**
 * Validate class creation/update data
 */
const validateClass = (data) => {
  const errors = [];
  
  if (!data.nama_kelas || data.nama_kelas.trim().length < 2) {
    errors.push('Class name must be at least 2 characters');
  }
  
  if (!data.tingkat) {
    errors.push('Tingkat (grade level) is required');
  } else if (!isValidInteger(data.tingkat)) {
    errors.push('Tingkat must be a valid integer');
  } else if (!TINGKAT.includes(parseInt(data.tingkat))) {
    errors.push('Tingkat must be between 1 and 6');
  }
  
  return errors;
};

module.exports = {
  validateClass,
};
