import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiTruck, FiPhone, FiXCircle } from 'react-icons/fi';
import Spinner from '../../components/Spinner';
import OrderTracker from '../../components/OrderTracker';

const API = 'http://localhost:5000/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e, orderId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Placed': return 'status-placed';
      case 'Preparing': return 'status-preparing';
      case 'Ready': return 'status-ready';
      case 'Out for Delivery': return 'status-out-for-delivery';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="fw-bold mb-4">📋 My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted mb-3">No orders yet</h4>
            <button className="btn btn-primary-custom" style={{ width: 'auto', padding: '10px 30px' }}
              onClick={() => navigate('/customer/home')}>
              Start Ordering
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-4 p-4 shadow-sm mb-3"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/customer/order/${order._id}`)}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 className="fw-bold mb-1">{order.restaurant?.name || 'Restaurant'}</h5>
                  <small className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </small>
                </div>
                <div className="text-end">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="fw-bold mt-1" style={{ color: '#ff6b35' }}>₹{order.totalAmount}</div>
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                {order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}
              </div>
              <OrderTracker currentStatus={order.status} />
              {order.deliveryBoy?.name && (
                <div className="delivery-boy-strip mt-2">
                  <FiTruck size={15} className="text-primary" />
                  <span className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                    {order.deliveryBoy.name}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                    <FiPhone size={13} /> {order.deliveryBoy.phone}
                  </span>
                </div>
              )}
              {order.status === 'Placed' && order.restaurant?.allowCancellation && (
                <button
                  className="btn-cancel-order mt-2"
                  onClick={(e) => handleCancel(e, order._id)}
                  disabled={cancelling === order._id}
                >
                  <FiXCircle size={15} />
                  {cancelling === order._id ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
