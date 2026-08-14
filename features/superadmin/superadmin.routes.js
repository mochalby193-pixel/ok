const express = require('express');
const router = express.Router();
const ctrl = require('./superadmin.controller');
const { authenticate, superAdminOnly, pengawasOnly } = require('../../shared/middleware/auth');

// ─── Superadmin routes ────────────────────────────────────────────────────────
router.get('/users',                authenticate, superAdminOnly, ctrl.getAllUsers);
router.get('/users/:id',            authenticate, superAdminOnly, ctrl.getUserById);
router.put('/users/:id',            authenticate, superAdminOnly, ctrl.updateUser);
router.delete('/users/:id',         authenticate, superAdminOnly, ctrl.deleteUser);

router.get('/requests',             authenticate, superAdminOnly, ctrl.getPendingRequests);
router.post('/requests/:id/approve',authenticate, superAdminOnly, ctrl.approveRequest);
router.post('/requests/:id/reject', authenticate, superAdminOnly, ctrl.rejectRequest);

// ─── Pengawas routes (ajukan request) ────────────────────────────────────────
router.post('/requests',            authenticate, pengawasOnly,   ctrl.createRequest);
router.get('/my-requests',          authenticate, pengawasOnly,   ctrl.getMyRequests);

module.exports = router;
