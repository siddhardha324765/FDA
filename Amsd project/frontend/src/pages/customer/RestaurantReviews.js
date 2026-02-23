import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import StarRating from '../../components/StarRating';
import { FiArrowLeft, FiSend } from 'react-icons/fi';

const API = 'http://localhost:5000/api';

export default function RestaurantReviews() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New review form
  const [selectedOrder, setSelectedOrder] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [restRes, fbRes, ordRes] = await Promise.all([
        axios.get(`${API}/restaurants/${restaurantId}`),
        axios.get(`${API}/feedback/restaurant/${restaurantId}`),
        axios.get(`${API}/orders/my`, getHeaders())
      ]);
      setRestaurant(restRes.data);
      setFeedbacks(fbRes.data);
      // Filter orders for this restaurant that are delivered
      const relevantOrders = ordRes.data.filter(
        o => o.restaurant?._id === restaurantId && o.status === 'Delivered'
      );
      setMyOrders(relevantOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedOrder) {
      toast.error('Please select an order to review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/feedback`, {
        orderId: selectedOrder,
        rating,
        comment
      }, getHeaders());
      toast.success('Review submitted! Thank you 🎉');
      setRating(0);
      setComment('');
      setSelectedOrder('');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  if (loading) return <Spinner />;

  return (
    <div className="page-content">
      <div className="container">
        <button className="btn btn-link text-muted mb-3 p-0" onClick={() => navigate(-1)}>
          <FiArrowLeft className="me-1" /> Back
        </button>

        {/* Restaurant Header */}
        {restaurant && (
          <div className="review-header mb-4">
            <div className="d-flex align-items-center gap-3 mb-2">
              <h2 className="fw-bold mb-0">{restaurant.name}</h2>
              {avgRating && (
                <span className="rating-summary-badge">
                  ★ {avgRating} <small>({feedbacks.length})</small>
                </span>
              )}
            </div>
            <p className="text-muted mb-0">📍 {restaurant.city} — {restaurant.description}</p>
          </div>
        )}

        <div className="row g-4">
          {/* Write Review Form */}
          <div className="col-lg-5">
            <div className="review-form-card">
              <h5 className="fw-bold mb-1">✍️ Write a Review</h5>
              <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                Share your experience with this restaurant
              </p>
              {myOrders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">
                    You need a delivered order from this restaurant to leave a review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Order</label>
                    <select
                      className="form-select"
                      value={selectedOrder}
                      onChange={(e) => setSelectedOrder(e.target.value)}
                      required
                    >
                      <option value="">Choose an order...</option>
                      {myOrders.map((o) => (
                        <option key={o._id} value={o._id}>
                          {new Date(o.createdAt).toLocaleDateString()} — ₹{o.totalAmount} ({o.items.map(i => i.name).join(', ')})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Your Rating</label>
                    <div className="d-flex align-items-center gap-3">
                      <StarRating rating={rating} onRate={setRating} />
                      {rating > 0 && (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Your Comment</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Tell us about the food quality, delivery, taste..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary-custom d-flex align-items-center justify-content-center gap-2" disabled={submitting}>
                    <FiSend size={16} />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="col-lg-7">
            <h5 className="fw-bold mb-3">💬 Customer Reviews ({feedbacks.length})</h5>
            {feedbacks.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>💬</div>
                <h6 className="text-muted mt-2">No reviews yet</h6>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Be the first to share your experience!
                </p>
              </div>
            ) : (
              <div className="reviews-list">
                {feedbacks.map((f) => (
                  <div key={f._id} className="review-card">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-center gap-2">
                        <div className="review-avatar">
                          {f.customer?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>
                            {f.customer?.name || 'Anonymous'}
                          </h6>
                          <small className="text-muted">
                            {new Date(f.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </small>
                        </div>
                      </div>
                      <div className="review-rating-pill">
                        ★ {f.rating}
                      </div>
                    </div>
                    {f.comment && (
                      <p className="mt-2 mb-0" style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.6 }}>
                        {f.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
