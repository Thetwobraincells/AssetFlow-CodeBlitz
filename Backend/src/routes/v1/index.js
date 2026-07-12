const express = require('express');
const authRoutes = require('./auth.routes');
const organizationRoutes = require('./organization.routes');
const assetRoutes = require('./asset.routes');
const allocationRoutes = require('./allocation.routes');
const bookingRoutes = require('./booking.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', organizationRoutes);
router.use('/assets', assetRoutes);
router.use('/allocations', allocationRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
