const XLSX = require('xlsx');
const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const usersService = require('./users.service');

const getAllUsers = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const { role, search, class_id } = req.query;
    const users = await usersService.getAllUsers({ role, search, class_id, schoolId });
    return success(res, users, 'Users retrieved successfully');
  } catch (err) {
    console.error('Get all users error:', err);
    return error(res, 'Failed to get users', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getUserById = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const user = await usersService.getUserById(req.params.id, schoolId);
    if (!user) return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    return success(res, user, 'User retrieved successfully');
  } catch (err) {
    console.error('Get user by id error:', err);
    return error(res, 'Failed to get user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const createUser = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const newUser = await usersService.createUser({ ...req.body, schoolId });
    return success(res, newUser, 'User created successfully', STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Create user error:', err);
    if (err.message === 'Email already registered') return error(res, err.message, STATUS_CODES.CONFLICT);
    if (err.message === 'NISN sudah terdaftar') return error(res, err.message, STATUS_CODES.CONFLICT);
    return error(res, 'Failed to create user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const updateUser = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    const updated = await usersService.updateUser(req.params.id, req.body, schoolId);
    if (!updated) return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    return success(res, updated, 'User updated successfully');
  } catch (err) {
    console.error('Update user error:', err);
    return error(res, 'Failed to update user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const deleteUser = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    if (parseInt(req.params.id) === req.user.id) {
      return error(res, 'Cannot deactivate your own account', STATUS_CODES.BAD_REQUEST);
    }
    await usersService.deleteUser(req.params.id, schoolId);
    return success(res, null, 'User deactivated successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    return error(res, 'Failed to deactivate user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const downloadTemplate = (req, res) => {
  try {
    const wb = XLSX.utils.book_new();
    const headers = [['nama', 'email', 'password', 'role', 'nisn', 'nis', 'class_id']];
    const sampleData = [
      ['Budi Santoso',  'budi2@lms.com', 'guru123',  'guru',  '',           '',        ''],
      ['Andi Wijaya',   'andi2@lms.com', 'siswa123', 'siswa', '1234567890', '2024010', '1'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    ws['!cols'] = [{ wch:25},{wch:30},{wch:15},{wch:10},{wch:15},{wch:15},{wch:10}];
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    const guide = XLSX.utils.aoa_to_sheet([
      ['PETUNJUK PENGISIAN'],
      [],
      ['Kolom','Keterangan','Wajib?','Contoh'],
      ['nama','Nama lengkap','Ya','Budi Santoso'],
      ['email','Email unik','Ya','budi@lms.com'],
      ['password','Min 6 karakter','Ya','guru123'],
      ['role','admin | guru | siswa','Ya','guru'],
      ['nisn','10 digit, untuk login siswa','Tidak*','1234567890'],
      ['nis','NIS sekolah','Tidak','2024001'],
      ['class_id','ID kelas (khusus siswa)','Tidak','1'],
    ]);
    guide['!cols'] = [{wch:12},{wch:40},{wch:10},{wch:20}];
    XLSX.utils.book_append_sheet(wb, guide, 'Petunjuk');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="template_import_users.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
  } catch (err) {
    console.error('Download template error:', err);
    return error(res, 'Failed to generate template', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const uploadExcel = async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    if (!req.file) return error(res, 'No file uploaded', STATUS_CODES.BAD_REQUEST);

    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (!raw || raw.length === 0) return error(res, 'File is empty', STATUS_CODES.BAD_REQUEST);

    const required = ['nama', 'email', 'password', 'role'];
    const missing = required.filter(c => !(c in raw[0]));
    if (missing.length > 0) return error(res, `Missing columns: ${missing.join(', ')}`, STATUS_CODES.BAD_REQUEST);

    const rows = raw.map((r, i) => ({
      rowNum: i + 2,
      nama: String(r.nama || '').trim(),
      email: String(r.email || '').trim().toLowerCase(),
      password: String(r.password || '').trim(),
      role: String(r.role || '').trim().toLowerCase(),
      nisn: r.nisn ? String(r.nisn).trim() : null,
      nis: r.nis ? String(r.nis).trim() : null,
      class_id: r.class_id ? parseInt(r.class_id) || null : null,
    }));

    const validRoles = ['admin', 'guru', 'siswa'];
    const preErrors = [], validRows = [];
    for (const row of rows) {
      if (!row.nama) { preErrors.push({ email: row.email, reason: 'nama wajib' }); continue; }
      if (!row.email) { preErrors.push({ email: `row ${row.rowNum}`, reason: 'email wajib' }); continue; }
      if (!row.password || row.password.length < 6) { preErrors.push({ email: row.email, reason: 'password min 6 karakter' }); continue; }
      if (!validRoles.includes(row.role)) { preErrors.push({ email: row.email, reason: `role tidak valid: ${row.role}` }); continue; }
      if (row.nisn && !/^\d{10}$/.test(row.nisn)) { preErrors.push({ email: row.email, reason: 'NISN harus 10 digit angka' }); continue; }
      validRows.push(row);
    }

    const dbResults = await usersService.bulkCreateUsers(validRows, schoolId);
    return success(res, {
      total: raw.length,
      imported: dbResults.success.length,
      failed: preErrors.length + dbResults.errors.length,
      errors: [...preErrors, ...dbResults.errors],
      created: dbResults.success,
    }, `Import: ${dbResults.success.length} berhasil`, STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Upload excel error:', err);
    return error(res, 'Failed to process file', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, downloadTemplate, uploadExcel };
