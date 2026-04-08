const { sequelize } = require('../config/database');
const { Model, DataTypes } = require('sequelize');

// Модель User
class User extends Model {}
User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(50), defaultValue: 'guest' },
  first_name: { type: DataTypes.STRING(100) },
  last_name: { type: DataTypes.STRING(100) },
  phone: { type: DataTypes.STRING(20) },
  photo_url: { type: DataTypes.STRING(255), allowNull: true },
  is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  ban_reason: { type: DataTypes.TEXT, allowNull: true },
  ban_until: { type: DataTypes.DATE, allowNull: true }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// Модель RoomType
class RoomType extends Model {}
RoomType.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  base_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.TEXT }
}, {
  sequelize,
  modelName: 'RoomType',
  tableName: 'room_types',
  timestamps: true,
  underscored: true
});

// Модель Room
class Room extends Model {}
Room.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  room_number: { type: DataTypes.STRING(10), unique: true, allowNull: false },
  typeId: { type: DataTypes.INTEGER, allowNull: false, field: 'type_id' },
  floor: { type: DataTypes.INTEGER, allowNull: false },
  price_per_night: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.STRING(50), defaultValue: 'available' },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  
  // === ВАЖНО: Эти поля должны быть ===
  capacity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
  square: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  amenities: { type: DataTypes.TEXT, allowNull: true }
}, {
  sequelize,
  modelName: 'Room',
  tableName: 'rooms',
  timestamps: true,
  underscored: true
});

// Модель Booking
class Booking extends Model {}
Booking.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  roomId: { type: DataTypes.INTEGER, allowNull: false, field: 'room_id' },
  check_in: { type: DataTypes.DATEONLY, allowNull: false },
  check_out: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
  total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  guests_count: { type: DataTypes.INTEGER, allowNull: false }
}, {
  sequelize,
  modelName: 'Booking',
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (booking) => {
      if (new Date(booking.check_out) <= new Date(booking.check_in)) {
        throw new Error('Дата выезда должна быть после даты заезда');
      }
    }
  }
});

// Модель Review
class Review extends Model {}
Review.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  roomId: { type: DataTypes.INTEGER, allowNull: false, field: 'room_id' },
  rating: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comment: { type: DataTypes.TEXT, allowNull: true },
  title: { type: DataTypes.STRING(200), allowNull: true },
  
  // Поля для ответов администрации
  admin_reply: { type: DataTypes.TEXT, allowNull: true },
  replied_by: { 
    type: DataTypes.INTEGER, 
    allowNull: true, 
    field: 'replied_by',
    references: { model: 'users', key: 'id' }
  },
  replied_at: { type: DataTypes.DATE, allowNull: true, field: 'replied_at' }
}, {
  sequelize,
  modelName: 'Review',
  tableName: 'reviews',
  timestamps: true,
  underscored: true
});

// === СВЯЗИ (АССОЦИАЦИИ) ===

// RoomType ↔ Room
RoomType.hasMany(Room, { foreignKey: 'typeId', as: 'Rooms' });
Room.belongsTo(RoomType, { foreignKey: 'typeId', as: 'RoomType' });

// User ↔ Booking
User.hasMany(Booking, { foreignKey: 'userId', as: 'Bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Room ↔ Booking
Room.hasMany(Booking, { foreignKey: 'roomId', as: 'Bookings' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'Room' });

// User ↔ Review (автор отзыва)
User.hasMany(Review, { foreignKey: 'userId', as: 'Reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Room ↔ Review
Room.hasMany(Review, { foreignKey: 'roomId', as: 'Reviews' });
Review.belongsTo(Room, { foreignKey: 'roomId', as: 'Room' });

// User ↔ Review (кто ответил - админ)
Review.belongsTo(User, { foreignKey: 'replied_by', as: 'RepliedBy' });

module.exports = { sequelize, User, RoomType, Room, Booking, Review };