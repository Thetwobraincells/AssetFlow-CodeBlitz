const NotificationService = require('../services/notification.service');

class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const unreadOnly = req.query.unread === 'true';
      const notifications = await NotificationService.getUserNotifications(
        req.tenantId, req.user.id, { unreadOnly }
      );
      res.status(200).json({ data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(
        req.tenantId, req.user.id, req.params.id
      );
      res.status(200).json({ message: 'Notification marked as read', data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.tenantId, req.user.id);
      res.status(200).json({ message: 'All notifications marked as read', data: { count: result.count } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
