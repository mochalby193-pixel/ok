const express = require('express');
const { memoryStorage } = require('multer');
const multer = require('multer');
const router = express.Router();
const usersController = require('./users.controller');
const { authenticate, adminOnly } = require('../../shared/middleware/auth');

// Store file in memory (no disk write needed — we parse the buffer directly)
const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .xls files are allowed'));
    }
  },
});

// All routes: authenticate + adminOnly
router.use(authenticate, adminOnly);

router.get('/template', usersController.downloadTemplate);
router.post('/upload-excel', upload.single('file'), usersController.uploadExcel);

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.post('/', usersController.createUser);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
