const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize, connectDB } = require('./config/database');

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');
const adminRoutes = require('./routes/admin');
const roomTypeRoutes = require('./routes/roomTypes');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS настройки - ВАЖНО!
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы - ДО CORS и helmet
app.use('/uploads/rooms', express.static(path.join(__dirname, 'uploads/rooms'), {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles'), {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use('/api', limiter);

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API работает!' });
});

// Запуск сервера
const start = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('✅ Таблицы синхронизированы');
  
  app.listen(PORT, () => {
    console.log(`🚀 Сервер на порту ${PORT}`);
  });
};

start();

module.exports = app;