const express = require('express');
const router = express.Router();

// Импортируем контроллер
const authController = require('../controllers/authController');

// Импортируем middleware (деструктуризация!)
const { authMiddleware } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

// === ПРОСТЫЕ МАРШРУТЫ ===

router.post('/register', (req, res) => authController.register(req, res));

router.post('/login', (req, res) => authController.login(req, res));

router.get('/me', authMiddleware, (req, res) => authController.getMe(req, res));

router.put('/me', authMiddleware, (req, res) => authController.updateProfile(req, res));

router.post('/upload-photo', authMiddleware, uploadProfile.single('photo'), (req, res) => authController.uploadPhoto(req, res));

router.delete('/delete-photo', authMiddleware, (req, res) => authController.deletePhoto(req, res));

router.put('/change-password', authMiddleware, (req, res) => authController.changePassword(req, res));

module.exports = router;