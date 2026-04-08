const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, directorMiddleware } = require('../middleware/auth');
const { Room } = require('../models');
const path = require('path');
const fs = require('fs');

// Все маршруты требуют авторизации и прав директора
router.use(authMiddleware);
router.use(directorMiddleware);

// Статистика
router.get('/stats', adminController.getDashboardStats);

// Управление пользователями
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/block', adminController.blockUser);
router.delete('/users/:id', adminController.deleteUser);

// Удаление фото номера
router.delete('/rooms/:id/photo', async (req, res) => {
  try {
    const { id } = req.params;
    
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Номер не найден' });
    }

    // Удаляем файл если есть
    if (room.image_url) {
      const imagePath = path.join(__dirname, '..', room.image_url);
      console.log('Deleting image:', imagePath);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image deleted from disk');
      }
    }

    // Обновляем запись в БД
    room.image_url = null;
    await room.save();

    res.json({ message: 'Фото удалено' });
  } catch (error) {
    console.error('Ошибка удаления фото:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;