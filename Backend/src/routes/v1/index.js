const express = require('express');
const authRoutes = require('./auth.routes');
const organizationRoutes = require('./organization.routes');

const router = express.Router();

router.use('/auth', authRoutes);
// We mount organization routes at the root or /organization, PRD just says `/departments`, `/categories`, `/users`.
// Let's mount them at / to match PRD exactly.
router.use('/', organizationRoutes);

module.exports = router;
