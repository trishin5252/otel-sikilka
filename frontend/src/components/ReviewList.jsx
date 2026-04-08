import { useState, useEffect } from 'react';
import axios from 'axios';

const ReviewList = ({ roomId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/room/${roomId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Удалить этот отзыв?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchReviews();
    } catch (err) {
      alert('Ошибка удаления: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchReviews();
    
    const handleReviewAdded = () => fetchReviews();
    window.addEventListener('reviewAdded', handleReviewAdded);
    
    return () => {
      window.removeEventListener('reviewAdded', handleReviewAdded);
    };
  }, [roomId]);

  if (loading) {
    return <p className="text-center py-4 dark:text-gray-300">Загрузка отзывов...</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-center py-4 text-gray-500 dark:text-gray-400">Пока нет отзывов</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => {
        // Проверка прав на удаление: автор или гендиректор
        // currentUser.id - из localStorage, review.userId - из БД
        // currentUser.userId - тоже может быть (зависит от структуры)
        const currentUserId = currentUser?.userId || currentUser?.id;
        const reviewUserId = review.userId || review.User?.id;
        
        const canDelete = currentUser && (
          currentUserId === reviewUserId || 
          currentUser.role === 'director'
        );

        console.log('=== Проверка прав ===');
        console.log('Current User ID:', currentUserId);
        console.log('Review User ID:', reviewUserId);
        console.log('Can Delete:', canDelete);

        return (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border dark:border-gray-700">
            <div className="flex items-start gap-4">
              {/* Аватар автора */}
              <div className="flex-shrink-0">
                {review.User?.photo_url ? (
                  <img
                    src={`/uploads/profiles/${review.User.photo_url.split('/').pop()}`}
                    alt={review.User.first_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                    {review.User?.first_name?.[0] || 'U'}
                  </div>
                )}
              </div>
              
              {/* Контент отзыва */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold dark:text-white">
                      {review.User?.first_name} {review.User?.last_name}
                    </span>
                    <span className="text-yellow-400 text-lg">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  
                  {/* Кнопка удаления */}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Удалить отзыв"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(review.createdAt).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                {review.title && (
                  <h4 className="font-bold text-gray-800 dark:text-white mb-1">{review.title}</h4>
                )}
                <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                
                {/* Ответ администрации */}
                {review.admin_reply && (
                  <div className="mt-4 ml-4 pl-4 border-l-4 border-primary dark:border-purple-500 bg-gray-50 dark:bg-gray-700/50 rounded-r-lg p-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
                      Ответ администрации
                      {review.replied_at && (
                        <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                          {new Date(review.replied_at).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{review.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewList;