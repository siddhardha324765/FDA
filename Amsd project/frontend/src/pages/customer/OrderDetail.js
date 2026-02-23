import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiTruck, FiPhone, FiUser, FiXCircle } from 'react-icons/fi';
import Spinner from '../../components/Spinner';
import OrderTracker from '../../components/OrderTracker';
import StarRating from '../../components/StarRating';

const API = 'http://localhost:5000/api';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/orders/my/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/feedback`, {
        orderId: id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feedback submitted! Thank you 🙏');
      setFeedbackSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/orders/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <div className="container py-5 text-center"><h4>Order not found</h4></div>;

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="fw-bold mb-4">📦 Order Details</h2>

        <div className="row">
          <div className="col-lg-8">
            <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="fw-bold">{order.restaurant?.name}</h4>
                  <small className="text-muted">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </small>
                </div>
                <span className={`status-badge ${order.status === 'Placed' ? 'status-placed' : order.status === 'Preparing' ? 'status-preparing' : order.status === 'Ready' ? 'status-ready' : order.status === 'Out for Delivery' ? 'status-out-for-delivery' : order.status === 'Cancelled' ? 'status-cancelled' : 'status-delivered'}`}>
                  {order.status}
                </span>
              </div>

              <OrderTracker currentStatus={order.status} />

              <hr />
              <h5 className="fw-bold mb-3">Items</h5>
              {order.items.map((item, idx) => (
                <div key={idx} className="d-flex justify-content-between mb-2">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <h5 className="fw-bold">Total</h5>
                <h5 className="fw-bold" style={{ color: '#ff6b35' }}>₹{order.totalAmount}</h5>
              </div>
            </div>

            <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
              <h5 className="fw-bold mb-2">📍 Delivery Address</h5>
              <p className="text-muted">{order.deliveryAddress}</p>
              <h6 className="fw-bold mb-1">Payment</h6>
              <p className="text-muted">💵 Cash on Delivery</p>
            </div>

            {order.deliveryBoy?.name && (
              <div className="delivery-boy-card bg-white rounded-4 p-4 shadow-sm mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="delivery-boy-icon-circle">
                    <FiTruck size={20} />
                  </div>
                  <h5 className="fw-bold mb-0">Delivery Partner</h5>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="delivery-boy-avatar">
                    <FiUser size={22} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: '1.05rem' }}>{order.deliveryBoy.name}</div>
                    <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.9rem' }}>
                      <FiPhone size={14} />
                      <a href={`tel:${order.deliveryBoy.phone}`} className="text-muted">
                        {order.deliveryBoy.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            {order.status === 'Placed' && order.restaurant?.allowCancellation && (
              <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
                <h5 className="fw-bold mb-3">⚠️ Cancel Order</h5>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                  You can cancel this order since it hasn't been prepared yet.
                </p>
                <button
                  className="btn-cancel-order-detail"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  <FiXCircle size={16} />
                  {cancelling ? 'Cancelling...' : 'Cancel This Order'}
                </button>
              </div>
            )}
            {order.status === 'Delivered' && !feedbackSubmitted && (
              <div className="bg-white rounded-4 p-4 shadow-sm">
                <h5 className="fw-bold mb-3">⭐ Rate Your Order</h5>
                <form onSubmit={handleFeedback}>
                  <div className="mb-3 text-center">
                    <StarRating rating={rating} onRate={setRating} />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Write a review..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                  <button type="submit" className="btn-primary-custom" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            )}
            {feedbackSubmitted && (
              <div className="bg-white rounded-4 p-4 shadow-sm text-center">
                <h5 className="text-success">✅ Feedback Submitted</h5>
                <p className="text-muted">Thank you for your review!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
