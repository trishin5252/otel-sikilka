import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    setUser(currentUser);
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/rooms/${id}`);
      setRoom(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки номера:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-16 text-center dark:text-white">Загрузка...</div>;
  }

  if (!room) {
    return <div className="container mx-auto py-16 text-center dark:text-white">Номер не найден</div>;
  }

  const imageUrl = room.image_url 
    ? `/uploads/rooms/${room.image_url.split('/').pop()}`
    : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl dark:bg-gray-900 min-h-screen">
      <Link to="/rooms" className="text-primary hover:underline mb-4 inline-block">
        ← Назад к номерам
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Изображение */}
        <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={room.room_number || room.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xl">Нет фото</p>
              </div>
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold dark:text-white">{room.room_number || room.name}</h1>
            <span className={`px-4 py-2 rounded text-white ${
              room.status === 'available' ? 'bg-green-500' :
              room.status === 'occupied' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}>
              {room.status === 'available' ? 'Свободен' :
               room.status === 'occupied' ? 'Занят' : 'На ремонте'}
            </span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {room.description || 'Описание отсутствует'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Вместимость</p>
              <p className="font-semibold text-lg dark:text-white">
                {room.capacity ? `${room.capacity} чел.` : 'Не указано'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Площадь</p>
              <p className="font-semibold text-lg dark:text-white">
                {room.square ? `${room.square} м²` : 'Не указано'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Этаж</p>
              <p className="font-semibold text-lg dark:text-white">
                {room.floor || 'Не указано'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Цена за ночь</p>
              <p className="font-semibold text-lg text-primary dark:text-purple-400">
                {room.price_per_night ? `${room.price_per_night} ₽` : 'Не указано'}
              </p>
            </div>
          </div>

          {room.amenities && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 dark:text-white">Удобства:</h3>
              <div className="flex flex-wrap gap-2">
                {room.amenities.split(',').map((amenity, index) => (
                  <span key={index} className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {amenity.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка бронирования */}
          {user && user.role === 'guest' && room.status === 'available' && (
            <Link
              to="/booking"
              state={{ room }}
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition text-lg font-semibold"
            >
              Забронировать
            </Link>
          )}
        </div>
      </div>

      {/* Отзывы */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Отзывы</h2>
        {user && <ReviewForm roomId={room.id} />}
        <ReviewList roomId={room.id} />
      </div>
    </div>
  );
};

export default RoomDetail;