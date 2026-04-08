import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import RoomDetail from './pages/RoomDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminRooms from './pages/AdminRooms';
import AdminBookings from './pages/AdminBookings';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar user={user} logout={logout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetail />} />
        <Route path="/login" element={<Login login={login} />} />
        <Route path="/register" element={<Register login={login} />} />
        <Route path="/booking" element={user ? <Booking /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile logout={logout} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user && user.role === 'director' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/admin/rooms" element={user && user.role === 'director' ? <AdminRooms /> : <Navigate to="/" />} />
        <Route path="/admin/bookings" element={user && (user.role === 'manager' || user.role === 'director') ? <AdminBookings /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;