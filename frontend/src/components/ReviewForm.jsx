import { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ roomId }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/reviews',
        { roomId, ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Отзыв успешно оставлен!');
      setFormData({ rating: 5, title: '', comment: '' });
      
      // Перезагружаем страницу с отзывами
      window.dispatchEvent(new CustomEvent('reviewAdded'));
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при отправке отзыва');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Оставить отзыв</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Оценка</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({...formData, rating: star})}
                className={`text-3xl ${
                  star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:scale-110 transition`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Заголовок</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border rounded px-3 py-2"
            placeholder="Краткая характеристика"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Отзыв</label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({...formData, comment: e.target.value})}
            className="w-full border rounded px-3 py-2"
            rows="4"
            placeholder="Расскажите о вашем опыте..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold ${
            loading ? 'bg-gray-400' : 'bg-primary hover:bg-purple-700'
          }`}
        >
          {loading ? 'Отправка...' : 'Оставить отзыв'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;