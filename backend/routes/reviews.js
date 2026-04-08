const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, managerMiddleware } = require('../middleware/auth');

// Публичные маршруты
router.get('/room/:roomId', reviewController.getReviewsByRoom);

// Защищённые маршруты (требуется авторизация)
router.post('/', authMiddleware, reviewController.createReview);

// Удаление отзыва (только автор или директор)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

// Ответ на отзыв (только менеджер/директор)
router.post('/:id/reply', authMiddleware, managerMiddleware, reviewController.replyToReview);
router.delete('/:id/reply', authMiddleware, managerMiddleware, reviewController.deleteReply);

module.exports = router;