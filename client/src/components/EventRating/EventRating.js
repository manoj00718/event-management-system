import React, { useState, useEffect } from 'react';
import { addEventRating, getEventRatings } from '../../utils/api';
import { useUser } from '../../context/UserContext';
import './EventRating.css';

const StarRating = ({ rating, onRate, readonly }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= (hover || rating) ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && onRate(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const EventRating = ({ eventId }) => {
  const { user } = useUser();
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, [eventId, page]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const { data } = await getEventRatings(eventId, page);
      setRatings(data.ratings);
      setTotalPages(data.totalPages);
      setAverageRating(data.averageRating);
      setTotalRatings(data.totalRatings);

      // Check if user has already rated
      const userRating = data.ratings.find(r => r.user._id === user?._id);
      if (userRating) {
        setUserRating(userRating);
      }
    } catch (error) {
      setError('Failed to load ratings');
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!userRating?.rating) {
      setError('Please select a rating');
      return;
    }

    try {
      await addEventRating(eventId, {
        rating: userRating.rating,
        review: review.trim()
      });
      setReview('');
      fetchRatings(); // Refresh ratings
    } catch (error) {
      setError('Failed to submit rating');
      console.error('Error submitting rating:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="ratings-loading">Loading ratings...</div>;
  }

  if (error) {
    return <div className="ratings-error">{error}</div>;
  }

  return (
    <div className="event-ratings">
      <div className="ratings-summary">
        <div className="average-rating">
          <h3>Average Rating</h3>
          <div className="rating-value">{averageRating.toFixed(1)}</div>
          <StarRating rating={Math.round(averageRating)} readonly />
          <div className="total-ratings">{totalRatings} ratings</div>
        </div>

        {!userRating && user && (
          <form onSubmit={handleSubmitRating} className="rating-form">
            <h3>Rate this event</h3>
            <StarRating
              rating={userRating?.rating || 0}
              onRate={(rating) => setUserRating({ rating })}
            />
            <textarea
              placeholder="Write your review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={1000}
            />
            <button type="submit" className="btn-primary">
              Submit Rating
            </button>
          </form>
        )}
      </div>

      <div className="ratings-list">
        <h3>Reviews</h3>
        {ratings.length === 0 ? (
          <div className="no-ratings">No reviews yet</div>
        ) : (
          <>
            {ratings.map(rating => (
              <div key={rating._id} className="rating-item">
                <div className="rating-header">
                  <img
                    src={rating.user.profileImage.url}
                    alt={rating.user.name}
                    className="user-avatar"
                  />
                  <div className="rating-info">
                    <div className="user-name">{rating.user.name}</div>
                    <StarRating rating={rating.rating} readonly />
                    <div className="rating-date">
                      {formatDate(rating.createdAt)}
                    </div>
                  </div>
                </div>
                {rating.review && (
                  <div className="rating-review">{rating.review}</div>
                )}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="ratings-pagination">
                <button
                  className="btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  className="btn-secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EventRating; 