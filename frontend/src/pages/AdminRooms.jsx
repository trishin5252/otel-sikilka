import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
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
    console.log('=== handleEdit вызван ===');
    console.log('Room:', room);
    console.log('Room ID:', room?.id);
    
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      description: room.description || '',
      capacity: room.capacity || 1,
      square: room.square || 0,
      price: room.price || 0,
      status: room.status || 'available',
      amenities: room.amenities || '',
      roomTypeId: room.roomTypeId || null,
      floor: room.floor || 1
    });
    setPhotoPreview(room.image_url ? `http://localhost:5000${room.image_url}` : null);
    setPhotoFile(null);
    setShowModal(true);
    
    console.log('showModal установлен в:', true);
    console.log('editingRoom установлен в:', room);
  };

  const handleDeletePhoto = async () => {
    if (!editingRoom) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/rooms/${editingRoom.id}/photo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotoPreview(null);
      fetchRooms();
    } catch (error) {
      console.error('Ошибка удаления фото:', error);
      alert('Ошибка удаления фото');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      
      if (photoFile) {
        data.append('photo', photoFile);
      }

      let response;
      if (editingRoom && editingRoom.id) {
        response = await axios.put(
          `http://localhost:5000/api/rooms/${editingRoom.id}`,
          data,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        response = await axios.post(
          'http://localhost:5000/api/rooms',
          data,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      alert(editingRoom?.id ? 'Номер обновлён' : 'Номер создан');
      fetchRooms();
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка сохранения номера:', error);
      alert('Ошибка сохранения номера: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCloseModal = () => {
    console.log('Закрытие модального окна');
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
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
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  if (loading) {
    return <div className="container mx-auto py-16 text-center">Загрузка...</div>;
  }

  console.log('Рендер AdminRooms, showModal:', showModal);
  console.log('editingRoom:', editingRoom);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Управление номерами</h1>
      
      <button
        onClick={() => handleEdit({})}
        className="bg-primary text-white px-4 py-2 rounded mb-6 hover:bg-purple-700 transition"
      >
        Добавить номер
      </button>

      {/* Модальное окно */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ position: 'relative', zIndex: 10000, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingRoom?.id ? 'Редактировать номер' : 'Добавить номер'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Вместимость</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Площадь (м²)</label>
                  <input
                    type="number"
                    value={formData.square}
                    onChange={(e) => setFormData({...formData, square: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Цена (₽)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Этаж</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Статус</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="available">Свободен</option>
                  <option value="occupied">Занят</option>
                  <option value="maintenance">На ремонте</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Тип номера</label>
                <select
                  value={formData.roomTypeId || ''}
                  onChange={(e) => setFormData({...formData, roomTypeId: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Выберите тип</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Удобства (через запятую)</label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Wi-Fi, Телевизор, Кондиционер"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Фото номера</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setPhotoFile(file);
                    if (file) {
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                />
                
                {photoPreview && (
                  <div className="mt-2">
                    <img src={photoPreview} alt="Preview" className="w-48 h-48 object-cover rounded" />
                    {editingRoom?.id && (
                      <button
                        type="button"
                        onClick={handleDeletePhoto}
                        className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Удалить фото
                      </button>
                    )}
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
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Список номеров */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-lg shadow p-4 border">
            <h3 className="font-bold text-lg mb-2">{room.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{room.RoomType?.name || 'Стандарт'}</p>
            <p className="text-sm text-gray-600 mb-2">Вместимость: {room.capacity} чел.</p>
            <p className="text-sm text-gray-600 mb-2">Цена: {room.price} ₽</p>
            <span className={`inline-block px-2 py-1 rounded text-xs ${
              room.status === 'available' ? 'bg-green-100 text-green-800' :
              room.status === 'occupied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {room.status === 'available' ? 'Свободен' :
               room.status === 'occupied' ? 'Занят' : 'На ремонте'}
            </span>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  console.log('Кнопка Редактировать нажата для:', room);
                  handleEdit(room);
                }}
                className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
              >
                Редактировать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRooms;