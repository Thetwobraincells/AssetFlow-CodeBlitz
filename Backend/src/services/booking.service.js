const { PrismaClient } = require('@prisma/client');
const ApiError = require('../utils/ApiError');
const prisma = new PrismaClient();

class BookingService {
  static async createBooking(tenantId, userId, data) {
    // Relying on PostgreSQL EXCLUDE constraint (btree_gist) to prevent overlaps.
    // Ensure asset belongs to tenant and is bookable.
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findFirst({
        where: { id: data.asset_id, organization_id: tenantId }
      });

      if (!asset) throw new ApiError(404, 'NOT_FOUND', 'Asset not found');
      
      // If asset is retired or lost, it shouldn't be booked. 
      // If it's allocated, it depends on business logic, but let's assume it can be booked for meeting rooms etc.
      if (asset.status === 'retired' || asset.status === 'lost') {
        throw new ApiError(400, 'VALIDATION_ERROR', 'Asset is not available for booking');
      }

      // The actual overlap logic is enforced by the database schema we defined earlier:
      // EXCLUDE USING gist (asset_id WITH =, time_range WITH &&)
      // We catch the P2010 / 23P01 error in the global error handler.
      const booking = await tx.booking.create({
        data: {
          asset_id: data.asset_id,
          user_id: userId,
          start_time: new Date(data.start_time),
          end_time: new Date(data.end_time),
          purpose: data.purpose
        }
      });

      return booking;
    });
  }

  static async getBookings(tenantId, assetId) {
    const whereClause = {
      asset: { organization_id: tenantId }
    };
    if (assetId) {
      whereClause.asset_id = assetId;
    }

    return prisma.booking.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true } },
        asset: { select: { id: true, name: true, asset_tag: true } }
      },
      orderBy: { start_time: 'asc' }
    });
  }

  static async cancelBooking(tenantId, userId, bookingId, userRole) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { asset: true }
    });

    if (!booking || booking.asset.organization_id !== tenantId) {
      throw new ApiError(404, 'NOT_FOUND', 'Booking not found');
    }

    if (booking.user_id !== userId && userRole !== 'admin') {
      throw new ApiError(403, 'FORBIDDEN', 'Cannot cancel booking belonging to another user');
    }

    return prisma.booking.delete({
      where: { id: bookingId }
    });
  }
}

module.exports = BookingService;
