const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const adminService = require('./admin.service');

const getStats = async (req, res) => {
  try {
    const stats = await adminService.getStats();
    return success(res, stats, 'Statistics retrieved successfully');
  } catch (err) {
    console.error('Get stats error:', err);
    return error(res, 'Failed to get statistics', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await adminService.getAllStudents();
    return success(res, students, 'Students retrieved successfully');
  } catch (err) {
    console.error('Get students error:', err);
    return error(res, 'Failed to get students', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getStats,
  getAllStudents,
};
