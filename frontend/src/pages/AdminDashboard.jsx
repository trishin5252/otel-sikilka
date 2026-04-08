import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      alert('Ошибка изменения роли: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/block`, 
        { isBlocked, banReason: 'Нарушение правил', banDuration: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      alert('Ошибка: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Вы уверены что хотите удалить этого пользователя?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      alert('Ошибка удаления: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="container mx-auto py-16 text-center text-black dark:text-white">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl dark:bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-8 text-black dark:text-white">Панель управления</h1>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-black dark:text-white mb-2">Всего номеров</p>
            <p className="text-3xl font-bold text-primary dark:text-purple-400">{stats.totalRooms}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-black dark:text-white mb-2">Свободно</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.availableRooms}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-black dark:text-white mb-2">Бронирований</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.totalBookings}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-black dark:text-white mb-2">Активные</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.activeBookings}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-black dark:text-white mb-2">Пользователей</p>
            <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.totalUsers}</p>
          </div>
        </div>
      )}

      {/* Пользователи */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Пользователи</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Имя</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Телефон</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Роль</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Статус</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Причина бана</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Разбан</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-black dark:text-white">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm text-black dark:text-white">
                    {user.email}
                    {user.is_blocked && <span className="ml-2 text-red-500">🛡️</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white">{user.first_name} {user.last_name}</td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white">{user.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'director' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.role === 'director' ? 'Гендиректор' :
                       user.role === 'manager' ? 'Менеджер' : 'Гость'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.is_blocked ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {user.is_blocked ? 'Заблокирован' : 'Активен'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white">{user.ban_reason || '-'}</td>
                  <td className="px-4 py-3 text-sm text-black dark:text-white">
                    {user.ban_until ? new Date(user.ban_until).toLocaleString('ru-RU') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="space-y-2">
                      {user.role !== 'director' && (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="w-full text-xs border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="guest">Гость</option>
                          <option value="manager">Менеджер</option>
                          <option value="director">Гендиректор</option>
                        </select>
                      )}

                      {user.role !== 'director' && (
                        <button
                          onClick={() => handleBlockUser(user.id, !user.is_blocked)}
                          className={`w-full py-1 rounded text-xs text-white ${
                            user.is_blocked 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-yellow-500 hover:bg-yellow-600'
                          }`}
                        >
                          {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                      )}

                      {user.role !== 'director' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-full py-1 rounded text-xs text-white bg-red-500 hover:bg-red-600"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;