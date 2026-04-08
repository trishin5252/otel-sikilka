const { Booking, User, Room, RoomType } = require('../models');
const { Op } = require('sequelize');

// === НОВАЯ ФУНКЦИЯ для админки ===
exports.getAllBookingsAdmin = async (req, res) => {
  try {
    console.log('=== getAllBookingsAdmin вызван ===');
    
    const bookings = await Booking.findAll({
      include: [
        { 
          model: User,
          as: 'User',  // ← ДОБАВЛЕНО: должен совпадать с ассоциацией
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] 
        },
        { 
          model: Room,
          as: 'Room',  // ← ДОБАВЛЕНО: должен совпадать с ассоциацией
          attributes: ['id', 'room_number', 'floor', 'price_per_night'],
          include: [
            {
              model: RoomType,
              as: 'RoomType',  // ← ДОБАВЛЕНО
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Найдено бронирований: ${bookings.length}`);
    res.json(bookings);
  } catch (error) {
    console.error('Ошибка загрузки бронирований:', error);
    res.status(500).json({ message: error.message });
  }
};

// Получить мои бронирования
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        { 
          model: Room,
          as: 'Room',  // ← ДОБАВЛЕНО
          attributes: ['id', 'room_number', 'floor', 'price_per_night'],
          include: [
            {
              model: RoomType,
              as: 'RoomType',  // ← ДОБАВЛЕНО
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['check_in', 'DESC']]
    });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получить все бронирования (публично)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Room, as: 'Room', attributes: ['id', 'room_number'] }]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Создать бронирование
exports.createBooking = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, guestsCount } = req.body;
    const userId = req.user.userId;

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Номер не найден' });
    }

    // Проверка доступности
    const existingBooking = await Booking.findOne({
      where: {
        roomId,
        status: ['pending', 'confirmed'],
        [Op.or]: [
          { check_in: { [Op.between]: [checkIn, checkOut] } },
          { check_out: { [Op.between]: [checkIn, checkOut] } },
          {
            check_in: { [Op.lte]: checkIn },
            check_out: { [Op.gte]: checkOut }
          }
        ]
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Номер уже забронирован на эти даты' });
    }

    // Расчёт стоимости
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.price_per_night;

    const booking = await Booking.create({
      userId,
      roomId,
      check_in: checkIn,
      check_out: checkOut,
      guests_count: guestsCount,
      total_price: totalPrice,
      status: 'pending'
    });

    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        { model: User, as: 'User', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { 
          model: Room,
          as: 'Room',
          include: [{ model: RoomType, as: 'RoomType', attributes: ['name'] }]
        }
      ]
    });

    res.status(201).json({ message: 'Бронирование создано', booking: bookingWithDetails });
  } catch (error) {
    console.error('Ошибка создания бронирования:', error);
    res.status(500).json({ message: error.message });
  }
};

// Обновить статус бронирования
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: 'Статус обновлён', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удалить бронирование
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Бронирование не найдено' });
    }

    await booking.destroy();
    res.json({ message: 'Бронирование удалено' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};