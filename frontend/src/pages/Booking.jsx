import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Booking = () => {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    roomId: '',
    check_in: '',
    check_out: '',
    guests_count: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/rooms');
      setRooms(response.data.filter(r => r.status === 'available'));
    } catch (error) {
      console.error('Ошибка загрузки номеров:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/bookings', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Бронирование успешно создано!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании бронирования');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-4xl font-bold text-center mb-8">Бронирование номера</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Выберите номер</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">-- Выберите номер --</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  Номер {room.room_number} - {room.price_per_night} ₽/ночь
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Дата заезда</label>
            <input
              type="date"
              value={formData.check_in}
              onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Дата выезда</label>
            <input
              type="date"
              value={formData.check_out}
              onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              min={formData.check_in}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Количество гостей</label>
            <input
              type="number"
              min="1"
              value={formData.guests_count}
              onChange={(e) => setFormData({ ...formData, guests_count: e.target.value })}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white p-3 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Бронирование...' : 'Забронировать'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;