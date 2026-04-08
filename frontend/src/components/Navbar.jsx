import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary dark:bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Отель Сикилька</Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-secondary transition">Главная</Link>
          <Link to="/rooms" className="hover:text-secondary transition">Номера</Link>
          
          {user && user.role === 'director' && (
            <Link to="/admin" className="hover:text-secondary transition">Админка</Link>
          )}
          
          {user && (user.role === 'director' || user.role === 'manager') && (
            <Link to="/admin/bookings" className="hover:text-secondary transition">Бронирования</Link>
          )}
          
          {user ? (
            <>
              {user.role === 'guest' && (
                <Link to="/booking" className="hover:text-secondary transition">Бронирование</Link>
              )}
              <Link to="/profile" className="hover:text-secondary transition font-semibold">
                {user.first_name || user.email?.split('@')[0] || 'Профиль'}
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-secondary transition">Вход</Link>
              <Link to="/register" className="bg-secondary px-4 py-2 rounded hover:bg-green-600 transition">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;