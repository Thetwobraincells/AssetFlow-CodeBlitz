const express = require('express');
const AuthController = require('../../controllers/auth.controller');
const validate = require('../../middlewares/validate.middleware');
const { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../../validations/auth.schema');
const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/signup', validate(signupSchema), AuthController.signup);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

router.get('/me', authMiddleware, AuthController.getMe);

module.exports = router;
