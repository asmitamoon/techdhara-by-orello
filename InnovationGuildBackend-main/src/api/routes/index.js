const express = require('express');
const authRoutes = require('./auth');
const publicRoutes = require('./public');
const adminRoutes = require('./admin');
const nodalOrgRoutes = require('./no');
const aoRoutes = require('./ao');
const orgRoutes = require('./org');
const innovatorRoutes = require('./innovator');
const vleRoutes = require('./vle');
const commonRoutes = require('./common');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/nodal-org', nodalOrgRoutes);
router.use('/ao', aoRoutes);
router.use('/org', orgRoutes);
router.use('/innovator', innovatorRoutes);
router.use('/vle', vleRoutes);
router.use('/common', commonRoutes);

module.exports = router;