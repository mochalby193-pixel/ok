const { verifyToken } = require('../../config/jwt');
const { error } = require('../utils/response');
const { STATUS_CODES, ROLES } = require('../constants');

/**
 * Middleware to authenticate JWT token
 * Attaches user data to req.user
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'No token provided', STATUS_CODES.UNAUTHORIZED);
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user data to request
    req.user = decoded;
    
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token', STATUS_CODES.UNAUTHORIZED);
  }
};

/**
 * Middleware to check if user has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'User not authenticated', STATUS_CODES.UNAUTHORIZED);
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res, 
        'You do not have permission to access this resource', 
        STATUS_CODES.FORBIDDEN
      );
    }
    
    next();
  };
};

/**
 * Middleware for admin and guru only
 */
const adminOrGuruOnly = authorize(ROLES.ADMIN, ROLES.GURU);

/**
 * Middleware for admin only
 */
const adminOnly = authorize(ROLES.ADMIN);

/**
 * Middleware for siswa only
 */
const siswaOnly = authorize(ROLES.SISWA);

/**
 * Middleware for pengawas only
 */
const pengawasOnly = authorize(ROLES.PENGAWAS);

/**
 * Middleware for pengawas or admin
 */
const pengawasOrAdmin = authorize(ROLES.PENGAWAS, ROLES.ADMIN);

module.exports = {
  authenticate,
  authorize,
  adminOrGuruOnly,
  adminOnly,
  siswaOnly,
  pengawasOnly,
  pengawasOrAdmin,
};
