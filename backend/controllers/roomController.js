const { Room, RoomType, Booking } = require('../models');
const path = require('path');
const fs = require('fs');

// Получить все номера
exports.getAllRooms = async (req, res) => {
  try {
    console.log('=== Загрузка всех номеров ===');
    
    const rooms = await Room.findAll({
      include: [
        { 
          model: RoomType,
          as: 'RoomType',  // ← ДОБАВЛЕНО: должен совпадать с ассоциацией
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Найдено номеров: ${rooms.length}`);
    res.json(rooms);
  } catch (error) {
    console.error('=== Ошибка загрузки номеров ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Получить номер по ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [
        { 
          model: RoomType,
          as: 'RoomType',  // ← ДОБАВЛЕНО
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Номер не найден' });
    }
    
    res.json(room);
  } catch (error) {
    console.error('Ошибка загрузки номера:', error);
    res.status(500).json({ message: error.message });
  }
};

// Создать номер
exports.createRoom = async (req, res) => {
  try {
    const { room_number, description, capacity, square, price_per_night, status, amenities, typeId, floor } = req.body;
    
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/rooms/${req.file.filename}`;
    }

    const room = await Room.create({
      room_number,
      description,
      capacity: parseInt(capacity) || 1,
      square: parseInt(square) || 0,
      price_per_night: parseFloat(price_per_night) || 0,
      status: status || 'available',
      amenities,
      typeId: typeId ? parseInt(typeId) : null,
      floor: floor ? parseInt(floor) : 1,
      image_url
    });

    const roomWithDetails = await Room.findByPk(room.id, {
      include: [
        { 
          model: RoomType,
          as: 'RoomType',  // ← ДОБАВЛЕНО
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({ message: 'Номер создан', room: roomWithDetails });
  } catch (error) {
    console.error('Ошибка создания номера:', error);
    res.status(500).json({ message: error.message });
  }
};

// Обновить номер
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, description, capacity, square, price_per_night, status, amenities, typeId, floor } = req.body;

    console.log('=== UPDATE ROOM ===');
    console.log('Room ID:', id);
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Номер не найден' });
    }

    // Если загружен новый файл
    let image_url = room.image_url;
    if (req.file) {
      // Удаляем старое изображение если есть
      if (room.image_url) {
        const oldPath = path.join(__dirname, '..', room.image_url);
        console.log('Deleting old image:', oldPath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      image_url = `/uploads/rooms/${req.file.filename}`;
      console.log('New image URL:', image_url);
    }

    // Обновляем данные
    await room.update({
      room_number: room_number || room.room_number,
      description: description || room.description,
      capacity: capacity ? parseInt(capacity) : room.capacity,
      square: square ? parseInt(square) : room.square,
      price_per_night: price_per_night ? parseFloat(price_per_night) : room.price_per_night,
      status: status || room.status,
      amenities: amenities || room.amenities,
      typeId: typeId ? parseInt(typeId) : room.typeId,
      floor: floor ? parseInt(floor) : room.floor,
      image_url: image_url
    });

    console.log('Room updated:', room);

    const updatedRoom = await Room.findByPk(id, {
      include: [
        { 
          model: RoomType,
          as: 'RoomType',  // ← ДОБАВЛЕНО
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({ message: 'Номер обновлён', room: updatedRoom });
  } catch (error) {
    console.error('Ошибка обновления номера:', error);
    res.status(500).json({ message: error.message });
  }
};

// Удалить номер
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ message: 'Номер не найден' });
    }

    // Проверяем есть ли бронирования
    const bookingsCount = await Booking.count({ where: { roomId: id } });
    if (bookingsCount > 0) {
      return res.status(400).json({ 
        message: 'Нельзя удалить номер с активными бронированиями' 
      });
    }

    // Удаляем изображение если есть
    if (room.image_url) {
      const imagePath = path.join(__dirname, '..', room.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await room.destroy();
    res.json({ message: 'Номер удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};