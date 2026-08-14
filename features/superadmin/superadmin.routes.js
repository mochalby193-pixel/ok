const express = require('express');
const router = express.Router();
const ctrl = require('./superadmin.controller');
const { authenticate, superAdminOnly, pengawasOnly } = require('../../shared/middleware/auth');
const pengawasCtrl = require('../pengawas/pengawas.controller');

// ─── Superadmin routes ────────────────────────────────────────────────────────
router.get('/users',                authenticate, superAdminOnly, ctrl.getAllUsers);
router.get('/users/:id',            authenticate, superAdminOnly, ctrl.getUserById);
router.post('/users',               authenticate, superAdminOnly, ctrl.createUser);
router.put('/users/:id',            authenticate, superAdminOnly, ctrl.updateUser);
router.delete('/users/:id',         authenticate, superAdminOnly, ctrl.deleteUser);
router.delete('/users/:id/hard',    authenticate, superAdminOnly, ctrl.hardDeleteUser);

router.get('/requests',             authenticate, superAdminOnly, ctrl.getPendingRequests);
router.post('/requests/:id/approve',authenticate, superAdminOnly, ctrl.approveRequest);
router.post('/requests/:id/reject', authenticate, superAdminOnly, ctrl.rejectRequest);

// ─── Pengawas routes (ajukan request) ────────────────────────────────────────
router.post('/requests',            authenticate, pengawasOnly,   ctrl.createRequest);
router.get('/my-requests',          authenticate, pengawasOnly,   ctrl.getMyRequests);

// ─── Schools list untuk superadmin (read-only) ───────────────────────────────
router.get('/schools-list',         authenticate, superAdminOnly, pengawasCtrl.getAllSchools);

module.exports = router;
