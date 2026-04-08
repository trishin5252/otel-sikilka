import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Profile = ({ logout }) => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        phone: response.data.phone || ''
      });
      if (response.data.photo_url) {
        const photoPath = `/uploads/profiles/${response.data.photo_url.split('/').pop()}`;
        setPhotoPreview(photoPath);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Размер файла не должен превышать 2MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) {
      setError('Выберите файл для загрузки');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.post('http://localhost:5000/api/auth/upload-photo', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Фото профиля успешно загружено!');
      
      const updatedUser = { ...user, photo_url: response.data.photo_url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setPhotoFile(null);
      const photoPath = `/uploads/profiles/${response.data.photo_url.split('/').pop()}`;
      setPhotoPreview(photoPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки фото');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm('Удалить фото профиля?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:5000/api/auth/delete-photo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Фото профиля удалено');
      
      const updatedUser = { ...user, photo_url: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPhotoPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка удаления фото');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/auth/me', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Профиль успешно обновлен!');
      setEditMode(false);
      
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка обновления профиля');
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate('/');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
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
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center dark:text-white">
        <p className="text-xl">Загрузка...</p>
      </div>
    );
  }

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return 'US';
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl dark:bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 dark:text-white">Личный кабинет</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              {user?.photo_url && photoPreview ? (
                <div className="relative inline-block">
                  <img 
                    src={photoPreview} 
                    alt="Фото профиля" 
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />
                  <button
                    onClick={handleDeletePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    title="Удалить фото"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-primary dark:bg-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials()}
                </div>
              )}
              <h2 className="text-xl font-bold mt-4 dark:text-white">{user?.first_name} {user?.last_name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                user?.role === 'director' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                user?.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {user?.role === 'director' ? 'Гендиректор' :
                 user?.role === 'manager' ? 'Менеджер' : 'Гость'}
              </span>
            </div>

            {/* Переключатель тёмной темы */}
            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300">Тёмная тема</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-primary' : 'bg-gray-300'
                }`}
                type="button"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Дата регистрации:</span>
                <span className="font-medium dark:text-white">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Бронирований:</span>
                <span className="font-medium dark:text-white">{bookings.length}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Фото профиля</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full text-sm mb-2 dark:text-gray-300"
              />
              {photoFile && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{photoFile.name}</p>
                  <button
                    onClick={handleUploadPhoto}
                    disabled={uploading}
                    className={`w-full py-2 rounded text-white ${
                      uploading ? 'bg-gray-400' : 'bg-primary hover:bg-blue-700'
                    }`}
                  >
                    {uploading ? 'Загрузка...' : 'Загрузить фото'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Информация о профиле</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-primary hover:underline dark:text-purple-400"
                >
                  Редактировать
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Имя</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Фамилия</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 rounded hover:bg-blue-700"
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        first_name: user?.first_name || '',
                        last_name: user?.last_name || '',
                        phone: user?.phone || ''
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Имя:</span>
                  <span className="font-medium dark:text-white">{user?.first_name || 'Не указано'}</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Фамилия:</span>
                  <span className="font-medium dark:text-white">{user?.last_name || 'Не указано'}</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Email:</span>
                  <span className="font-medium dark:text-white">{user?.email}</span>
                </div>
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Телефон:</span>
                  <span className="font-medium dark:text-white">{user?.phone || 'Не указан'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Мои бронирования</h2>
            
            {bookings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                У вас пока нет бронирований
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition dark:bg-gray-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold dark:text-white">Номер {booking.Room?.room_number}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{booking.Room?.RoomType?.name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Заезд:</span>
                        <span className="ml-2 font-medium dark:text-white">{formatDate(booking.check_in)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Выезд:</span>
                        <span className="ml-2 font-medium dark:text-white">{formatDate(booking.check_out)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Гостей:</span>
                        <span className="ml-2 font-medium dark:text-white">{booking.guests_count} чел.</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300">Сумма:</span>
                        <span className="ml-2 font-bold text-primary dark:text-purple-400">{booking.total_price} ₽</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;