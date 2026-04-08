const { Review, User, Room } = require('../models');
const { Op } = require('sequelize');

// Получить все отзывы для номера
exports.getReviewsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    console.log('=== Загрузка отзывов для комнаты ===');
    console.log('Room ID:', roomId);
    
    const reviews = await Review.findAll({
      where: { roomId },
      include: [
        { 
          model: User,
          as: 'User',  // ← ВАЖНО: должно совпадать с ассоциацией в models/index.js
          attributes: ['id', 'first_name', 'last_name', 'photo_url']
        },
        {
          model: User,
          as: 'RepliedBy',  // ← ВАЖНО: должно совпадать с ассоциацией
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('Найдено отзывов:', reviews.length);
    res.json(reviews);
  } catch (error) {
    console.error('=== Ошибка загрузки отзывов ===');
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Создать отзыв
exports.createReview = async (req, res) => {
  try {
    const { roomId, rating, title, comment } = req.body;
    const userId = req.user.userId;

    console.log('=== Создание отзыва ===');
    console.log('Room ID:', roomId);
    console.log('User ID:', userId);

    const review = await Review.create({
      userId,
      roomId,
      rating: parseInt(rating),
      title: title || '',
      comment: comment || ''
    });

    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        { 
          model: User,
          as: 'User',  // ← ВАЖНО
          attributes: ['id', 'first_name', 'last_name', 'photo_url']
        }
      ]
    });

    console.log('Review создан:', reviewWithUser);

    res.status(201).json({ 
      message: 'Отзыв создан', 
      review: reviewWithUser 
    });
  } catch (error) {
    console.error('=== Ошибка создания отзыва ===');
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Удалить отзыв (только автор или гендиректор)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;
    const currentUserRole = req.user.role;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    // Проверка прав: только автор или гендиректор может удалить
    if (review.userId !== currentUserId && currentUserRole !== 'director') {
      return res.status(403).json({ message: 'Недостаточно прав для удаления' });
    }

    await review.destroy();
    res.json({ message: 'Отзыв удалён' });
  } catch (error) {
    console.error('Ошибка удаления отзыва:', error);
    res.status(500).json({ message: error.message });
  }
};

// Ответить на отзыв (только для менеджера/директора)
exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const userId = req.user.userId;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    review.admin_reply = reply;
    review.replied_by = userId;
    review.replied_at = new Date();
    await review.save();

    const updatedReview = await Review.findByPk(id, {
      include: [
        { 
          model: User,
          as: 'User',  // ← ВАЖНО
          attributes: ['id', 'first_name', 'last_name', 'photo_url']
        },
        { 
          model: User, 
          as: 'RepliedBy',  // ← ВАЖНО
          attributes: ['id', 'first_name', 'last_name'], 
          required: false 
        }
      ]
    });

    res.json({ message: 'Ответ отправлен', review: updatedReview });
  } catch (error) {
    console.error('Ошибка ответа на отзыв:', error);
    res.status(500).json({ message: error.message });
  }
};

// Удалить ответ на отзыв
exports.deleteReply = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    review.admin_reply = null;
    review.replied_by = null;
    review.replied_at = null;
    await review.save();

    res.json({ message: 'Ответ удалён' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};