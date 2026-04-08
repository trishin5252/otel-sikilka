const { User, Room, RoomType, Booking } = require('../models');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'photo_url', 'is_blocked', 'ban_reason', 'ban_until', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const currentUserId = req.user.userId;

    if (!['guest', 'manager', 'director'].includes(role)) {
      return res.status(400).json({ message: 'Неверная роль' });
    }

    const currentUser = await User.findByPk(currentUserId);
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Гендиректор не может менять роль другим гендиректорам
    if (currentUser.role === 'director' && user.role === 'director' && id !== currentUserId) {
      return res.status(403).json({ 
        message: 'Гендиректор не может изменять роль других гендиректоров' 
      });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'Роль обновлена', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, banReason, banDuration } = req.body;
    const currentUserId = req.user.userId;

    const currentUser = await User.findByPk(currentUserId);
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Гендиректор не может блокировать других гендиректоров
    if (currentUser.role === 'director' && user.role === 'director' && id !== currentUserId) {
      return res.status(403).json({ 
        message: 'Гендиректор не может блокировать других гендиректоров' 
      });
    }

    if (isBlocked) {
      user.is_blocked = true;
      user.ban_reason = banReason || 'Нарушение правил';
      
      if (banDuration) {
        const banUntil = new Date();
        banUntil.setHours(banUntil.getHours() + parseInt(banDuration));
        user.ban_until = banUntil;
      } else {
        user.ban_until = null;
      }
    } else {
      user.is_blocked = false;
      user.ban_reason = null;
      user.ban_until = null;
    }

    await user.save();

    res.json({ 
      message: isBlocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован', 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId;

    const currentUser = await User.findByPk(currentUserId);
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Гендиректор не может удалять других гендиректоров
    if (currentUser.role === 'director' && user.role === 'director' && id !== currentUserId) {
      return res.status(403).json({ 
        message: 'Гендиректор не может удалять других гендиректоров' 
      });
    }

    const bookingsCount = await Booking.count({ where: { userId: id } });
    if (bookingsCount > 0) {
      return res.status(400).json({ 
        message: 'Нельзя удалить пользователя с активными бронированиями. Сначала удалите бронирования.' 
      });
    }

    await user.destroy();
    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const totalRooms = await Room.count();
    const availableRooms = await Room.count({ where: { status: 'available' } });
    const totalBookings = await Booking.count();
    const activeBookings = await Booking.count({ where: { status: 'confirmed' } });
    const totalUsers = await User.count();
    const blockedUsers = await User.count({ where: { is_blocked: true } });

    res.json({
      totalRooms,
      availableRooms,
      totalBookings,
      activeBookings,
      totalUsers,
      blockedUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};