import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки бронирований:', err);
      setError('Не удалось загрузить бронирования');
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
    } catch (err) {
      alert('Ошибка обновления статуса: ' + err.message);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!confirm('Удалить бронирование?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status) => {
    const statuses = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено',
      completed: 'Завершено'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'active') return booking.status === 'confirmed';
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'cancelled') return booking.status === 'cancelled';
    return true;
  });

  if (loading) {
    return <div className="container mx-auto py-16 text-center">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Все бронирования</h1>

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Все ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Активные ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${
              filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Ожидают ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded ${
              filter === 'cancelled' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Отменены ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Таблица бронирований */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">№</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Гость</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Номер</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Заезд</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Выезд</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Гостей</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Сумма</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Статус</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  Бронирований не найдено
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking, index) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium">
                        {booking.User?.first_name} {booking.User?.last_name}
                      </div>
                      <div className="text-gray-500 text-xs">{booking.User?.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <div className="font-medium">Номер {booking.Room?.room_number}</div>
                      <div className="text-gray-500 text-xs">
                        {booking.Room?.RoomType?.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(booking.check_in)}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(booking.check_out)}</td>
                  <td className="px-4 py-3 text-sm">{booking.guests_count} чел.</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">
                    {booking.total_price} ₽
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Подтвердить
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;