import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiMapPin, FiUser, FiMail } from 'react-icons/fi';
import Spinner from '../../components/Spinner';
import OrderTracker from '../../components/OrderTracker';

const API = 'http://localhost:5000/api';

export default function DeliveryOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API}/delivery/my-orders`, getHeaders());
      const found = res.data.find(o => o._id === id);
      if (found) {
        setOrder(found);
      } else {
        toast.error('Order not found');
        navigate('/delivery/orders');
      }
    } catch (err) {
      toast.error('Failed to load order');
      navigate('/delivery/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const res = await axios.put(`${API}/delivery/order/${id}/status`, { status }, getHeaders());
      setOrder(res.data);
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <Spinner />;
  if (!order) return null;

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 800 }}>
        <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => navigate('/delivery/orders')}>
          <FiArrowLeft className="me-1" /> Back to Orders
        </button>

        <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 className="fw-bold mb-1">Order #{order._id.slice(-8)}</h4>
              <small className="text-muted">{new Date(order.createdAt).toLocaleString()}</small>
            </div>
            <span className={`badge fs-6 ${order.status === 'Delivered' ? 'bg-success' : 'bg-primary'}`}>
              {order.status}
            </span>
          </div>

          {/* Order Tracker */}
          <OrderTracker currentStatus={order.status} />
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
          <h5 className="fw-bold mb-3">🏪 Restaurant</h5>
          <p className="mb-1 fw-bold">{order.restaurant?.name}</p>
          <p className="text-muted mb-0 d-flex align-items-center gap-1">
            <FiMapPin size={14} /> {order.restaurant?.city}
          </p>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
          <h5 className="fw-bold mb-3">👤 Customer</h5>
          <p className="mb-1 d-flex align-items-center gap-2">
            <FiUser size={14} /> {order.customer?.name}
          </p>
          <p className="mb-1 d-flex align-items-center gap-2">
            <FiMail size={14} /> {order.customer?.email}
          </p>
          <p className="mb-0 d-flex align-items-center gap-2 text-danger fw-bold">
            <FiMapPin size={14} /> {order.deliveryAddress}
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
          <h5 className="fw-bold mb-3">🛒 Items</h5>
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td>₹{item.price * item.quantity}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="fw-bold text-end">Total:</td>
                <td className="fw-bold fs-5">₹{order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-4 p-4 shadow-sm text-center">
          {order.status === 'Ready' && (
            <button className="btn btn-primary btn-lg" onClick={() => updateStatus('Out for Delivery')}>
              🚚 Pick Up & Start Delivery
            </button>
          )}
          {order.status === 'Out for Delivery' && (
            <button className="btn btn-success btn-lg" onClick={() => updateStatus('Delivered')}>
              ✅ Mark as Delivered
            </button>
          )}
          {order.status === 'Delivered' && (
            <div className="text-success">
              <h5 className="fw-bold">✓ This order has been delivered successfully</h5>
            </div>
          )}
          {['Placed', 'Preparing'].includes(order.status) && (
            <div className="text-muted">
              <h6>⏳ Waiting for restaurant to prepare the order...</h6>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
