const XLSX = require('xlsx');
const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const usersService = require('./users.service');

// ─── GET all users ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, search, class_id } = req.query;
    const users = await usersService.getAllUsers({ role, search, class_id });
    return success(res, users, 'Users retrieved successfully');
  } catch (err) {
    console.error('Get all users error:', err);
    return error(res, 'Failed to get users', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── GET single user ──────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    return success(res, user, 'User retrieved successfully');
  } catch (err) {
    console.error('Get user by id error:', err);
    return error(res, 'Failed to get user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── CREATE user ──────────────────────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const newUser = await usersService.createUser(req.body);
    return success(res, newUser, 'User created successfully', STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Create user error:', err);
    if (err.message === 'Email already registered') {
      return error(res, err.message, STATUS_CODES.CONFLICT);
    }
    return error(res, 'Failed to create user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── UPDATE user ──────────────────────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const updated = await usersService.updateUser(req.params.id, req.body);
    if (!updated) return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    return success(res, updated, 'User updated successfully');
  } catch (err) {
    console.error('Update user error:', err);
    return error(res, 'Failed to update user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── DELETE (deactivate) user ─────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (parseInt(req.params.id) === req.user.id) {
      return error(res, 'Cannot deactivate your own account', STATUS_CODES.BAD_REQUEST);
    }
    await usersService.deleteUser(req.params.id);
    return success(res, null, 'User deactivated successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    return error(res, 'Failed to deactivate user', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── DOWNLOAD Excel template ──────────────────────────────────────────────────
const downloadTemplate = (req, res) => {
  try {
    const wb = XLSX.utils.book_new();

    // ── Sheet: Template
    const headers = [['nama', 'email', 'password', 'role', 'nisn', 'nis', 'class_id']];
    const sampleData = [
      ['Budi Santoso',  'budi2@lms.com', 'guru123',  'guru',  '',           '',        ''],
      ['Andi Wijaya',   'andi2@lms.com', 'siswa123', 'siswa', '1234567890', '2024010', '1'],
      ['Rina Putri',    'rina2@lms.com', 'siswa123', 'siswa', '0987654321', '2024011', '1'],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);

    // Column widths
    ws['!cols'] = [
      { wch: 25 }, // nama
      { wch: 30 }, // email
      { wch: 15 }, // password
      { wch: 10 }, // role
      { wch: 15 }, // nisn
      { wch: 15 }, // nis
      { wch: 10 }, // class_id
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // ── Sheet: Petunjuk
    const guide = XLSX.utils.aoa_to_sheet([
      ['PETUNJUK PENGISIAN'],
      [],
      ['Kolom',     'Keterangan',                                              'Wajib?',    'Contoh'],
      ['nama',      'Nama lengkap pengguna',                                   'Ya',        'Budi Santoso'],
      ['email',     'Alamat email (harus unik)',                               'Ya',        'budi@lms.com'],
      ['password',  'Password awal (min. 6 karakter)',                         'Ya',        'guru123'],
      ['role',      'Hanya: admin | guru | siswa',                             'Ya',        'guru'],
      ['nisn',      'Nomor Induk Siswa Nasional — 10 digit (khusus siswa, digunakan untuk LOGIN)', 'Tidak*', '1234567890'],
      ['nis',       'Nomor Induk Siswa Sekolah (khusus siswa, opsional)',       'Tidak',     '2024001'],
      ['class_id',  'ID kelas dari tabel classes (khusus siswa)',              'Tidak',     '1'],
      [],
      ['CATATAN:'],
      ['- Baris pertama (header) JANGAN dihapus'],
      ['- Kolom nisn, nis, dan class_id dikosongkan jika bukan siswa'],
      ['- nisn harus tepat 10 digit angka dan unik (dipakai siswa untuk login)'],
      ['- Password akan di-hash otomatis, tidak disimpan plain text'],
    ]);

    guide['!cols'] = [{ wch: 12 }, { wch: 60 }, { wch: 10 }, { wch: 20 }];
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

// ─── UPLOAD Excel & bulk create ───────────────────────────────────────────────
const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', STATUS_CODES.BAD_REQUEST);
    }

    // Parse workbook from buffer
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (!raw || raw.length === 0) {
      return error(res, 'File is empty or has no data rows', STATUS_CODES.BAD_REQUEST);
    }

    // Validate required columns exist
    const required = ['nama', 'email', 'password', 'role'];
    const firstRow = raw[0];
    const missingCols = required.filter((col) => !(col in firstRow));
    if (missingCols.length > 0) {
      return error(
        res,
        `Missing required columns: ${missingCols.join(', ')}`,
        STATUS_CODES.BAD_REQUEST
      );
    }

    // Sanitize rows
    const rows = raw.map((r, i) => ({
      rowNum: i + 2, // +2 = header row + 1-indexed
      nama: String(r.nama || '').trim(),
      email: String(r.email || '').trim().toLowerCase(),
      password: String(r.password || '').trim(),
      role: String(r.role || '').trim().toLowerCase(),
      nisn: r.nisn ? String(r.nisn).trim() : null,
      nis: r.nis ? String(r.nis).trim() : null,
      class_id: r.class_id ? parseInt(r.class_id) || null : null,
    }));

    // Basic per-row validation
    const validRoles = ['admin', 'guru', 'siswa'];
    const preErrors = [];
    const validRows = [];

    for (const row of rows) {
      if (!row.nama)    { preErrors.push({ email: row.email || `row ${row.rowNum}`, reason: 'nama is required' }); continue; }
      if (!row.email)   { preErrors.push({ email: `row ${row.rowNum}`, reason: 'email is required' }); continue; }
      if (!row.password || row.password.length < 6) {
        preErrors.push({ email: row.email, reason: 'password must be at least 6 characters' }); continue;
      }
      if (!validRoles.includes(row.role)) {
        preErrors.push({ email: row.email, reason: `invalid role "${row.role}", must be admin|guru|siswa` }); continue;
      }
      // Validate NISN format if provided
      if (row.nisn && !/^\d{10}$/.test(row.nisn)) {
        preErrors.push({ email: row.email, reason: `NISN "${row.nisn}" harus tepat 10 digit angka` }); continue;
      }
      validRows.push(row);
    }

    const dbResults = await usersService.bulkCreateUsers(validRows);

    return success(
      res,
      {
        total: raw.length,
        imported: dbResults.success.length,
        failed: preErrors.length + dbResults.errors.length,
        errors: [...preErrors, ...dbResults.errors],
        created: dbResults.success,
      },
      `Import complete: ${dbResults.success.length} created, ${preErrors.length + dbResults.errors.length} failed`,
      STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error('Upload excel error:', err);
    return error(res, 'Failed to process file', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  downloadTemplate,
  uploadExcel,
};
