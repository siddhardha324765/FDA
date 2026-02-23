import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import StarRating from '../../components/StarRating';

const API = 'http://localhost:5000/api';

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/feedback/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const avgRating = feedback.length > 0
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="fw-bold mb-4">⭐ Customer Feedback</h2>

        {/* Summary */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="bg-white rounded-4 p-4 shadow-sm text-center">
              <h3 className="fw-bold" style={{ color: '#ffc107' }}>{avgRating} ⭐</h3>
              <p className="text-muted mb-0">Average Rating</p>
              <small className="text-muted">{feedback.length} reviews</small>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {feedback.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No feedback yet</h4>
          </div>
        ) : (
          feedback.map((f) => (
            <div key={f._id} className="feedback-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold mb-1">{f.customer?.name || 'Anonymous'}</h6>
                  <small className="text-muted">{f.restaurant?.name}</small>
                </div>
                <div className="text-end">
                  <StarRating rating={f.rating} readOnly />
                  <small className="text-muted d-block mt-1">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
              {f.comment && (
                <p className="mt-2 mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                  "{f.comment}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
