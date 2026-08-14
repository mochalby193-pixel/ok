const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const pengawasService = require('./pengawas.service');

const getAllSchools = async (req, res) => {
  try {
    const schools = await pengawasService.getAllSchools();
    return success(res, schools, 'Schools retrieved');
  } catch (err) {
    return error(res, 'Failed to get schools', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getSchoolById = async (req, res) => {
  try {
    const school = await pengawasService.getSchoolById(req.params.id);
    if (!school) return error(res, 'School not found', STATUS_CODES.NOT_FOUND);
    return success(res, school, 'School retrieved');
  } catch (err) {
    return error(res, 'Failed to get school', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const createSchool = async (req, res) => {
  try {
    const { nama, kode, alamat } = req.body;
    if (!nama) return error(res, 'Nama sekolah wajib diisi', STATUS_CODES.BAD_REQUEST);
    const school = await pengawasService.createSchool({ nama, kode, alamat });
    return success(res, school, 'School created', STATUS_CODES.CREATED);
  } catch (err) {
    return error(res, 'Failed to create school', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const updateSchool = async (req, res) => {
  try {
    const updated = await pengawasService.updateSchool(req.params.id, req.body);
    if (!updated) return error(res, 'School not found', STATUS_CODES.NOT_FOUND);
    return success(res, updated, 'School updated');
  } catch (err) {
    return error(res, 'Failed to update school', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getSchoolAdmins = async (req, res) => {
  try {
    const admins = await pengawasService.getSchoolAdmins(req.params.id);
    return success(res, admins, 'Admins retrieved');
  } catch (err) {
    return error(res, 'Failed to get admins', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const createSchoolAdmin = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) {
      return error(res, 'Nama, email, dan password wajib diisi', STATUS_CODES.BAD_REQUEST);
    }
    const admin = await pengawasService.createSchoolAdmin({
      nama, email, password,
      schoolId: parseInt(req.params.id),
    });
    return success(res, admin, 'Admin created', STATUS_CODES.CREATED);
  } catch (err) {
    if (err.message === 'Email already registered') return error(res, err.message, STATUS_CODES.CONFLICT);
    return error(res, 'Failed to create admin', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getSchoolScores = async (req, res) => {
  try {
    const scores = await pengawasService.getSchoolScores(req.params.id);
    return success(res, scores, 'Scores retrieved');
  } catch (err) {
    return error(res, 'Failed to get scores', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getSchoolStats = async (req, res) => {
  try {
    const stats = await pengawasService.getSchoolStats(req.params.id);
    return success(res, stats, 'Stats retrieved');
  } catch (err) {
    return error(res, 'Failed to get stats', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllSchools, getSchoolById, createSchool, updateSchool,
  getSchoolAdmins, createSchoolAdmin, getSchoolScores, getSchoolStats,
};
