const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authMiddleware, managerMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

// Публичные маршруты
router.get('/', bookingController.getAllBookings);
router.get('/my', authMiddleware, bookingController.getMyBookings);
router.post('/', authMiddleware, bookingController.createBooking);

// Маршруты для менеджеров/директоров
router.get('/admin/all', authMiddleware, managerMiddleware, bookingController.getAllBookingsAdmin);
router.put('/:id/status', authMiddleware, managerMiddleware, bookingController.updateBookingStatus);
router.delete('/:id', authMiddleware, managerMiddleware, bookingController.deleteBooking);

module.exports = router;