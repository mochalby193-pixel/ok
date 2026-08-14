const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const classesService = require('./classes.service');

const getAllClasses = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const classes = await classesService.getAllClasses(schoolId);
    return success(res, classes, 'Classes retrieved successfully');
  } catch (err) {
    console.error('Get classes error:', err);
    return error(res, 'Failed to get classes', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getClassById = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const classData = await classesService.getClassById(id, schoolId);
    if (!classData) return error(res, 'Class not found', STATUS_CODES.NOT_FOUND);
    return success(res, classData, 'Class retrieved successfully');
  } catch (err) {
    console.error('Get class error:', err);
    return error(res, 'Failed to get class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const createClass = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const newClass = await classesService.createClass(req.body, schoolId);
    return success(res, newClass, 'Class created successfully', STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Create class error:', err);
    return error(res, 'Failed to create class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const updateClass = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const updatedClass = await classesService.updateClass(id, req.body, schoolId);
    if (!updatedClass) return error(res, 'Class not found', STATUS_CODES.NOT_FOUND);
    return success(res, updatedClass, 'Class updated successfully');
  } catch (err) {
    console.error('Update class error:', err);
    return error(res, 'Failed to update class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const deleteClass = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const deletedClass = await classesService.deleteClass(id, schoolId);
    if (!deletedClass) return error(res, 'Class not found', STATUS_CODES.NOT_FOUND);
    return success(res, deletedClass, 'Class deleted successfully');
  } catch (err) {
    console.error('Delete class error:', err);
    return error(res, 'Failed to delete class', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getClassStudents = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const students = await classesService.getClassStudents(id, schoolId);
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
