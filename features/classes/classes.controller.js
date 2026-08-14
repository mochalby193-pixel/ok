const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const classesService = require('./classes.service');

/**
 * Get all classes
 * GET /api/classes
 */
const getAllClasses = async (req, res) => {
  try {
    const classes = await classesService.getAllClasses();
    return success(res, classes, 'Classes retrieved successfully');
  } catch (err) {
    console.error('Get classes error:', err);
    return error(res, 'Failed to get classes', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get class by ID
 * GET /api/classes/:id
 */
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = await classesService.getClassById(id);
    
    if (!classData) {
      return error(res, 'Class not found', STATUS_CODES.NOT_FOUND);
    }
    
    return success(res, classData, 'Class retrieved successfully');
  } catch (err) {
    console.error('Get class error:', err);
    return error(res, 'Failed to get class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Create new class
 * POST /api/classes
 */
const createClass = async (req, res) => {
  try {
    const classData = req.body;
    const newClass = await classesService.createClass(classData);
    
    return success(
      res, 
      newClass, 
      'Class created successfully', 
      STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error('Create class error:', err);
    return error(res, 'Failed to create class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update class
 * PUT /api/classes/:id
 */
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const classData = req.body;
    
    const updatedClass = await classesService.updateClass(id, classData);
    
    if (!updatedClass) {
      return error(res, 'Class not found', STATUS_CODES.NOT_FOUND);
    }
    
    return success(res, updatedClass, 'Class updated successfully');
  } catch (err) {
    console.error('Update class error:', err);
    return error(res, 'Failed to update class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Delete class
 * DELETE /api/classes/:id
 */
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await classesService.deleteClass(id);
    
    if (!deletedClass) {
      return error(res, 'Class not found', STATUS_CODES.NOT_FOUND);
    }
    
    return success(res, deletedClass, 'Class deleted successfully');
  } catch (err) {
    console.error('Delete class error:', err);
    return error(res, 'Failed to delete class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get students in a class
 * GET /api/classes/:id/students
 */
const getClassStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await classesService.getClassStudents(id);
    
    return success(res, students, 'Students retrieved successfully');
  } catch (err) {
    console.error('Get class students error:', err);
    return error(res, 'Failed to get students', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
};
