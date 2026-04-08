const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'otel_sikilka_secret_key_2024_secure';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Неверный токен' });
  }
};

const managerMiddleware = (req, res, next) => {
  // Проверяем что req.user существует
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  
  if (req.user.role !== 'manager' && req.user.role !== 'director') {
    return res.status(403).json({ message: 'Недостаточно прав' });
  }
  next();
};

const directorMiddleware = (req, res, next) => {
  // Проверяем что req.user существует
  if (!req.user || !req.user.role) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  
  if (req.user.role !== 'director') {
    return res.status(403).json({ message: 'Недостаточно прав' });
  }
  next();
};

module.exports = { authMiddleware, managerMiddleware, directorMiddleware };