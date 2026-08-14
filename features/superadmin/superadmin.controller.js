const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const svc = require('./superadmin.service');

// ─── USERS ────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search, school_id } = req.query;
    const users = await svc.getAllUsers({ role, search, school_id });
    return success(res, users, 'Users retrieved');
  } catch (err) {
    return error(res, 'Failed to get users', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await svc.getUserById(req.params.id);
    if (!user) return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    return success(res, user, 'User retrieved');
  } catch (err) {
    return error(res, 'Failed to get user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const updateUser = async (req, res) => {
  try {
    const target = await svc.getUserById(req.params.id);
    if (!target) return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    if (target.role === 'superadmin') {
      return error(res, 'Tidak bisa edit akun superadmin', STATUS_CODES.FORBIDDEN);
    }
    const updated = await svc.updateUser(req.params.id, req.body);
    return success(res, updated, 'User updated');
  } catch (err) {
    return error(res, err.message || 'Failed to update user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return error(res, 'Tidak bisa menonaktifkan akun sendiri', STATUS_CODES.BAD_REQUEST);
    }
    const target = await svc.getUserById(req.params.id);
    if (target?.role === 'superadmin') {
      return error(res, 'Tidak bisa menonaktifkan akun superadmin', STATUS_CODES.FORBIDDEN);
    }
    await svc.deleteUser(req.params.id);
    return success(res, null, 'User deactivated');
  } catch (err) {
    return error(res, 'Failed to deactivate user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const createUser = async (req, res) => {
  try {
    const { school_id, nama, email, password, role, nis, nisn, class_id } = req.body;
    if (!nama || !email || !password || !role) {
      return error(res, 'nama, email, password, role wajib diisi', STATUS_CODES.BAD_REQUEST);
    }
    if (password.length < 6) return error(res, 'Password minimal 6 karakter', STATUS_CODES.BAD_REQUEST);
    if (role === 'superadmin') return error(res, 'Tidak bisa membuat akun superadmin baru', STATUS_CODES.FORBIDDEN);
    const newUser = await svc.createUser({ school_id, nama, email, password, role, nis, nisn, class_id });
    return success(res, newUser, 'User created', STATUS_CODES.CREATED);
  } catch (err) {
    if (err.message.includes('Email') || err.message.includes('NISN')) {
      return error(res, err.message, STATUS_CODES.CONFLICT);
    }
    return error(res, 'Failed to create user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const hardDeleteUser = async (req, res) => {
  try {
    const target = await svc.getUserById(req.params.id);
    if (!target) return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    if (target.role === 'superadmin') return error(res, 'Tidak bisa menghapus akun superadmin', STATUS_CODES.FORBIDDEN);
    await svc.hardDeleteUser(req.params.id);
    return success(res, null, 'User deleted permanently');
  } catch (err) {
    return error(res, 'Failed to delete user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};
const getPendingRequests = async (req, res) => {
  try {
    const requests = await svc.getPendingRequests();
    return success(res, requests, 'Requests retrieved');
  } catch (err) {
    return error(res, 'Failed to get requests', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const approveRequest = async (req, res) => {
  try {
    const result = await svc.approveRequest(req.params.id);
    return success(res, result, 'Request approved, akun berhasil dibuat');
  } catch (err) {
    if (err.message.includes('Email')) return error(res, err.message, STATUS_CODES.CONFLICT);
    return error(res, err.message || 'Failed to approve', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const rejectRequest = async (req, res) => {
  try {
    const result = await svc.rejectRequest(req.params.id, req.body.note);
    return success(res, result, 'Request rejected');
  } catch (err) {
    return error(res, err.message || 'Failed to reject', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── PENGAWAS — buat request ──────────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const { school_id, nama, email, password } = req.body;
    if (!school_id || !nama || !email || !password) {
      return error(res, 'school_id, nama, email, dan password wajib diisi', STATUS_CODES.BAD_REQUEST);
    }
    if (password.length < 6) {
      return error(res, 'Password minimal 6 karakter', STATUS_CODES.BAD_REQUEST);
    }
    const request = await svc.createRequest({
      school_id, nama, email, password,
      requestedBy: req.user.id,
    });
    return success(res, request, 'Request submitted, menunggu persetujuan superadmin', STATUS_CODES.CREATED);
  } catch (err) {
    if (err.message.includes('Email') || err.message.includes('pending')) {
      return error(res, err.message, STATUS_CODES.CONFLICT);
    }
    return error(res, 'Failed to create request', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await svc.getMyRequests(req.user.id);
    return success(res, requests, 'My requests retrieved');
  } catch (err) {
    return error(res, 'Failed to get requests', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllUsers, getUserById, createUser, updateUser, deleteUser, hardDeleteUser,
  getPendingRequests, approveRequest, rejectRequest,
  createRequest, getMyRequests,
};
