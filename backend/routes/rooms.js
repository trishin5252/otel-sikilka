const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authMiddleware, directorMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads/rooms';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'room-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Только изображения'));
  }
});

// Маршруты
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', authMiddleware, directorMiddleware, upload.single('photo'), roomController.createRoom);
router.put('/:id', authMiddleware, directorMiddleware, upload.single('photo'), roomController.updateRoom);
router.delete('/:id', authMiddleware, directorMiddleware, roomController.deleteRoom);

module.exports = router;