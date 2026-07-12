const express = require('express');
const BookingController = require('../../controllers/booking.controller');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const tenantMiddleware = require('../../middlewares/tenant.middleware');
const idempotencyMiddleware = require('../../middlewares/idempotency.middleware');
const { createBookingSchema } = require('../../validations/booking.schema');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', BookingController.getBookings);

router.post(
  '/', 
  idempotencyMiddleware,
  validate(createBookingSchema), 
  BookingController.createBooking
);

router.delete('/:id', BookingController.cancelBooking);

module.exports = router;
