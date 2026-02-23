import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiMapPin, FiUser, FiPackage } from 'react-icons/fi';
import Spinner from '../../components/Spinner';

const API = 'http://localhost:5000/api';

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/delivery/my-orders`, getHeaders());
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/delivery/order/${orderId}/status`, { status }, getHeaders());
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Placed': return 'status-placed';
      case 'Preparing': return 'status-preparing';
      case 'Ready': return 'status-ready';
      case 'Out for Delivery': return 'status-out-for-delivery';
      case 'Delivered': return 'status-delivered';
      default: return '';
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  if (loading) return <Spinner />;

  return (
    <div className="page-content">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">📦 My Deliveries</h2>
          <select
            className="form-select"
            style={{ width: 220, borderRadius: 10 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Placed">Placed</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <FiPackage size={60} className="text-muted mb-3" />
            <h4 className="text-muted">No orders assigned yet</h4>
            <p className="text-muted">Orders will appear here when a restaurant assigns them to you.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredOrders.map((order) => (
              <div className="col-md-6 col-lg-4" key={order._id}>
                <div className="bg-white rounded-4 p-4 shadow-sm h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <small className="text-muted">Order #{order._id.slice(-8)}</small>
                      <h6 className="fw-bold mb-0 mt-1">{order.restaurant?.name}</h6>
                    </div>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-2 d-flex align-items-center gap-2">
                    <FiUser size={14} className="text-muted" />
                    <small>{order.customer?.name}</small>
                  </div>

                  <div className="mb-2 d-flex align-items-center gap-2">
                    <FiMapPin size={14} className="text-danger" />
                    <small>{order.deliveryAddress}</small>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">
                      {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                    </small>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">₹{order.totalAmount}</span>
                    <small className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>

                  <hr />

                  <div className="d-flex gap-2">
                    {order.status === 'Ready' && (
                      <button
                        className="btn btn-sm btn-primary flex-grow-1"
                        onClick={() => updateStatus(order._id, 'Out for Delivery')}
                      >
                        🚚 Pick Up & Deliver
                      </button>
                    )}
                    {order.status === 'Out for Delivery' && (
                      <button
                        className="btn btn-sm btn-success flex-grow-1"
                        onClick={() => updateStatus(order._id, 'Delivered')}
                      >
                        ✅ Mark Delivered
                      </button>
                    )}
                    {order.status === 'Delivered' && (
                      <span className="text-success fw-bold w-100 text-center">✓ Completed</span>
                    )}
                    {['Placed', 'Preparing'].includes(order.status) && (
                      <span className="text-muted w-100 text-center">
                        <small>Waiting for restaurant...</small>
                      </span>
                    )}
                    <Link
                      to={`/delivery/order/${order._id}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
