const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'otel_sikilka_secret_key_2024_secure';

exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      phone,
      role: 'guest'
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Пользователь зарегистрирован',
      user: { id: user.id, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    if (user.is_blocked) {
      const now = new Date();
      if (user.ban_until && new Date(user.ban_until) < now) {
        user.is_blocked = false;
        user.ban_reason = null;
        user.ban_until = null;
        await user.save();
      } else {
        const banUntil = user.ban_until ? new Date(user.ban_until).toLocaleString('ru-RU') : 'Бессрочно';
        return res.status(403).json({ 
          message: 'Аккаунт заблокирован',
          banReason: user.ban_reason || 'Нарушение правил',
          banUntil: banUntil
        });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      user: { id: user.id, email: user.email, role: user.role },
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'photo_url', 'role', 'createdAt']
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({ 
      message: 'Профиль обновлен',
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, phone: user.phone, photo_url: user.photo_url, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Файл не загружен' });
    }

    // Если было старое фото, удаляем его
    if (user.photo_url) {
      const oldPhotoPath = path.join(__dirname, '..', user.photo_url);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Сохраняем новое фото
    user.photo_url = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.json({ 
      message: 'Фото профиля загружено',
      photo_url: user.photo_url
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.photo_url) {
      const photoPath = path.join(__dirname, '..', user.photo_url);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      user.photo_url = null;
      await user.save();
    }

    res.json({ message: 'Фото профиля удалено' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Текущий пароль неверен' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};