const express = require('express');
const router = express.Router();
const ctrl = require('./pengawas.controller');
const { authenticate, pengawasOnly } = require('../../shared/middleware/auth');

router.use(authenticate, pengawasOnly);

router.get('/schools',                    ctrl.getAllSchools);
router.get('/schools/:id',                ctrl.getSchoolById);
router.post('/schools',                   ctrl.createSchool);
router.put('/schools/:id',                ctrl.updateSchool);
router.get('/schools/:id/admins',         ctrl.getSchoolAdmins);
router.post('/schools/:id/admins',        ctrl.createSchoolAdmin);
router.get('/schools/:id/scores',         ctrl.getSchoolScores);
router.get('/schools/:id/stats',          ctrl.getSchoolStats);

module.exports = router;
