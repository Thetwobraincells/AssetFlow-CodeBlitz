const BookingService = require('../services/booking.service');

class BookingController {
  static async createBooking(req, res, next) {
    try {
      const booking = await BookingService.createBooking(req.tenantId, req.user.id, req.body);
      res.status(201).json({ message: 'Asset booked successfully', data: booking });
    } catch (error) {
      next(error);
    }
  }

  static async getBookings(req, res, next) {
    try {
      const bookings = await BookingService.getBookings(req.tenantId, req.query.asset_id);
      res.status(200).json({ data: bookings });
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req, res, next) {
    try {
      await BookingService.cancelBooking(req.tenantId, req.user.id, req.params.id, req.user.role);
      res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController;
