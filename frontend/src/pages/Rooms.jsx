import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    square: 0,
    price: 0,
    status: 'available',
    amenities: '',
    roomTypeId: null,
    floor: 1
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    setUser(currentUser);
    fetchRooms();
    fetchRoomTypes();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки номеров:', error);
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/room-types', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomTypes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки типов:', error);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.room_number || room.name || '',
      description: room.description || '',
      capacity: room.capacity || 1,
      square: room.square || 0,
      price: room.price_per_night || room.price || 0,
      status: room.status || 'available',
      amenities: room.amenities || '',
      roomTypeId: room.typeId || room.roomTypeId || null,
      floor: room.floor || 1
    });
    
    if (room.image_url) {
      const currentPhotoUrl = `/uploads/rooms/${room.image_url.split('/').pop()}`;
      setPhotoPreview(currentPhotoUrl);
    } else {
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  };

  const handleDeletePhoto = async () => {
    if (!editingRoom) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/rooms/${editingRoom.id}/photo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPhotoPreview(null);
      setPhotoFile(null);
      await fetchRooms();
      
      const updatedRoom = rooms.find(r => r.id === editingRoom.id);
      if (updatedRoom) {
        setEditingRoom(updatedRoom);
      }
      
      alert('Фото удалено');
    } catch (error) {
      alert('Ошибка удаления фото: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      data.append('room_number', formData.name);
      if (formData.description) data.append('description', formData.description);
      if (formData.capacity) data.append('capacity', formData.capacity);
      if (formData.square) data.append('square', formData.square);
      if (formData.price) data.append('price_per_night', formData.price);
      if (formData.status) data.append('status', formData.status);
      if (formData.amenities) data.append('amenities', formData.amenities);
      if (formData.roomTypeId) data.append('typeId', formData.roomTypeId);
      if (formData.floor) data.append('floor', formData.floor);
      
      if (photoFile) {
        data.append('photo', photoFile);
      }

      const response = await axios.put(
        `http://localhost:5000/api/rooms/${editingRoom.id}`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Номер обновлён');
      fetchRooms();
      setEditingRoom(null);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      alert('Ошибка: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCloseModal = () => {
    setEditingRoom(null);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-16 text-center dark:text-white">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">Наши номера</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            {/* Изображение */}
            <div className="h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {room.image_url ? (
                <img
                  src={`/uploads/rooms/${room.image_url.split('/').pop()}`}
                  alt={room.room_number || room.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Нет фото</p>
                </div>
              )}
            </div>

            {/* Информация */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-2xl font-bold dark:text-white">{room.room_number || room.name}</h3>
                <span className={`px-3 py-1 rounded text-sm ${
                  room.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  room.status === 'occupied' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {room.status === 'available' ? 'Свободен' :
                   room.status === 'occupied' ? 'Занят' : 'На ремонте'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-gray-600 dark:text-gray-300"><strong>Тип:</strong> {room.RoomType?.name || 'Стандарт'}</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>Этаж:</strong> {room.floor || 1}</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>Вместимость:</strong> {room.capacity} чел.</p>
                <p className="text-gray-600 dark:text-gray-300"><strong>Площадь:</strong> {room.square} м²</p>
              </div>

              <p className="text-2xl font-bold text-primary dark:text-purple-400 mb-4">{room.price_per_night || room.price} ₽ / ночь</p>

              <div className="flex gap-2">
                <Link
                  to={`/rooms/${room.id}`}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition text-center"
                >
                  Подробнее
                </Link>
                
                {user && user.role === 'director' && (
                  <button
                    onClick={() => handleEdit(room)}
                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                  >
                    Редактировать
                  </button>
                )}
                
                {user && user.role === 'guest' && room.status === 'available' && (
                  <Link
                    to="/booking"
                    state={{ room }}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-purple-700 transition text-center"
                  >
                    Забронировать
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно редактирования */}
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Редактировать номер</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Вместимость</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Площадь (м²)</label>
                  <input
                    type="number"
                    value={formData.square}
                    onChange={(e) => setFormData({...formData, square: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Цена (₽)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Этаж</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="available">Свободен</option>
                  <option value="occupied">Занят</option>
                  <option value="maintenance">На ремонте</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Тип номера</label>
                <select
                  value={formData.roomTypeId || ''}
                  onChange={(e) => setFormData({...formData, roomTypeId: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Выберите тип</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Удобства (через запятую)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Wi-Fi, Телевизор, Кондиционер"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Фото номера</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-sm mb-2 dark:text-gray-300"
                />
                
                {photoPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Превью:</p>
                    <img 
                      src={photoPreview}
                      alt="Preview" 
                      className="w-full max-w-xs h-48 object-cover rounded border-2"
                    />
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Удалить фото
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;