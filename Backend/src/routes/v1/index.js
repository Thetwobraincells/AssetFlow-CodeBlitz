const express = require('express');
const authRoutes = require('./auth.routes');
const organizationRoutes = require('./organization.routes');
const assetRoutes = require('./asset.routes');
const allocationRoutes = require('./allocation.routes');
const bookingRoutes = require('./booking.routes');
const maintenanceRoutes = require('./maintenance.routes');
const auditRoutes = require('./audit.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/', organizationRoutes);
router.use('/assets', assetRoutes);
router.use('/allocations', allocationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/audits', auditRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
