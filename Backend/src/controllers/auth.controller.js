const AuthService = require('../services/auth.service');

class AuthController {
  static async signup(req, res, next) {
    try {
      const user = await AuthService.signup(req.body);
      res.status(201).json({ message: 'User created successfully', data: user });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login(email, password);
      res.status(200).json({ message: 'Login successful', data });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const data = await AuthService.forgotPassword(email);
      res.status(200).json({ message: data.message, data: { resetToken: data.resetToken } });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const data = await AuthService.resetPassword(token, newPassword);
      res.status(200).json({ message: data.message });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
