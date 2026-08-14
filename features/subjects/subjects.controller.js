const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const subjectsService = require('./subjects.service');

const getAllSubjects = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const subjects = await subjectsService.getAllSubjects(schoolId);
    return success(res, subjects, 'Subjects retrieved successfully');
  } catch (err) {
    console.error('Get subjects error:', err);
    return error(res, 'Failed to get subjects', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getSubjectById = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const subject = await subjectsService.getSubjectById(id, schoolId);
    if (!subject) return error(res, 'Subject not found', STATUS_CODES.NOT_FOUND);
    return success(res, subject, 'Subject retrieved successfully');
  } catch (err) {
    console.error('Get subject error:', err);
    return error(res, 'Failed to get subject', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const createSubject = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const newSubject = await subjectsService.createSubject(req.body, schoolId);
    return success(res, newSubject, 'Subject created successfully', STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Create subject error:', err);
    return error(res, 'Failed to create subject', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const updateSubject = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const updatedSubject = await subjectsService.updateSubject(id, req.body, schoolId);
    if (!updatedSubject) return error(res, 'Subject not found', STATUS_CODES.NOT_FOUND);
    return success(res, updatedSubject, 'Subject updated successfully');
  } catch (err) {
    console.error('Update subject error:', err);
    return error(res, 'Failed to update subject', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const deleteSubject = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const deletedSubject = await subjectsService.deleteSubject(id, schoolId);
    if (!deletedSubject) return error(res, 'Subject not found', STATUS_CODES.NOT_FOUND);
    return success(res, deletedSubject, 'Subject deleted successfully');
  } catch (err) {
    console.error('Delete subject error:', err);
    return error(res, 'Failed to delete subject', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const assignSubject = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { class_id, subject_id, teacher_id } = req.body;
    const assignment = await subjectsService.assignSubjectToClass(class_id, subject_id, teacher_id, schoolId);
    if (!assignment) return error(res, 'Kelas atau mapel tidak ditemukan di sekolah ini', STATUS_CODES.NOT_FOUND);
    return success(res, assignment, 'Subject assigned to class successfully');
  } catch (err) {
    console.error('Assign subject error:', err);
    return error(res, 'Failed to assign subject', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getAllClassSubjects = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const list = await subjectsService.getAllClassSubjects(schoolId);
    return success(res, list, 'Class subjects retrieved successfully');
  } catch (err) {
    console.error('Get class subjects error:', err);
    return error(res, 'Failed to get class subjects', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const removeClassSubject = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { id } = req.params;
    const removed = await subjectsService.removeClassSubject(id, schoolId);
    if (!removed) return error(res, 'Assignment not found', STATUS_CODES.NOT_FOUND);
    return success(res, removed, 'Assignment removed successfully');
  } catch (err) {
    console.error('Remove class subject error:', err);
    return error(res, 'Failed to remove assignment', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignSubject,
  getAllClassSubjects,
  removeClassSubject,
};
