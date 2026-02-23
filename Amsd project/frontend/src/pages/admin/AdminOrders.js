import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiTruck, FiPhone, FiUser, FiX, FiCheck, FiMapPin } from 'react-icons/fi';
import Spinner from '../../components/Spinner';

const API = 'http://localhost:5000/api';
const STATUSES = ['Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({ name: '', phone: '', deliveryBoyId: '' });
  const [availableBoys, setAvailableBoys] = useState([]);
  const [loadingBoys, setLoadingBoys] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [filterStatus]);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filterStatus
        ? `${API}/orders/admin?status=${filterStatus}`
        : `${API}/orders/admin`;
      const res = await axios.get(url, getHeaders());
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status`, { status: newStatus }, getHeaders());
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const assignDeliveryBoy = async (orderId) => {
    if (!deliveryForm.name.trim() || !deliveryForm.phone.trim()) {
      toast.error('Please select or enter delivery boy name and phone');
      return;
    }
    try {
      await axios.put(`${API}/orders/${orderId}/delivery-boy`, deliveryForm, getHeaders());
      toast.success('Delivery boy assigned successfully');
      setEditingDelivery(null);
      setDeliveryForm({ name: '', phone: '', deliveryBoyId: '' });
      setAvailableBoys([]);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to assign delivery boy');
    }
  };

  const fetchAvailableBoys = async (city) => {
    setLoadingBoys(true);
    try {
      const res = await axios.get(`${API}/delivery/available?city=${encodeURIComponent(city)}`, getHeaders());
      setAvailableBoys(res.data);
    } catch (err) {
      console.error(err);
      setAvailableBoys([]);
    } finally {
      setLoadingBoys(false);
    }
  };

  const startEditDelivery = (order) => {
    setEditingDelivery(order._id);
    setDeliveryForm({
      name: order.deliveryBoy?.name || '',
      phone: order.deliveryBoy?.phone || '',
      deliveryBoyId: order.assignedDeliveryBoy || ''
    });
    if (order.restaurant?.city) {
      fetchAvailableBoys(order.restaurant.city);
    }
  };

  const selectDeliveryBoy = (boy) => {
    setDeliveryForm({
      name: boy.name,
      phone: boy.phone,
      deliveryBoyId: boy._id
    });
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

  const getNextStatus = (current) => {
    const idx = STATUSES.indexOf(current);
    return idx < STATUSES.length - 1 ? STATUSES[idx + 1] : null;
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-content">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">📋 Manage Orders</h2>
          <select
            className="form-select"
            style={{ width: 220, borderRadius: 10 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No orders found</h4>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table bg-white rounded-4 overflow-hidden shadow-sm">
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Delivery Boy</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><small>{order._id.slice(-8)}</small></td>
                    <td>{order.customer?.name}</td>
                    <td>{order.restaurant?.name}</td>
                    <td>
                      <small>{order.items.map(i => `${i.name}×${i.quantity}`).join(', ')}</small>
                    </td>
                    <td className="fw-bold">₹{order.totalAmount}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {editingDelivery === order._id ? (
                        <div className="delivery-boy-form" style={{ minWidth: 220 }}>
                          {/* Available delivery boys list */}
                          {loadingBoys ? (
                            <small className="text-muted">Loading delivery boys...</small>
                          ) : availableBoys.length > 0 ? (
                            <div className="mb-2">
                              <small className="fw-bold text-muted d-block mb-1">
                                <FiMapPin size={12} /> Available in {order.restaurant?.city}:
                              </small>
                              <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                                {availableBoys.map(boy => (
                                  <div
                                    key={boy._id}
                                    className={`d-flex align-items-center gap-1 p-1 rounded ${deliveryForm.deliveryBoyId === boy._id ? 'bg-primary text-white' : 'bg-light'}`}
                                    style={{ cursor: 'pointer', fontSize: '0.8rem', marginBottom: 2 }}
                                    onClick={() => selectDeliveryBoy(boy)}
                                  >
                                    <FiUser size={12} />
                                    <span>{boy.name}</span>
                                    <span className="ms-auto">{boy.phone}</span>
                                  </div>
                                ))}
                              </div>
                              <hr className="my-1" />
                            </div>
                          ) : (
                            <small className="text-muted d-block mb-1">No delivery boys in this city</small>
                          )}

                          <div className="d-flex align-items-center gap-1 mb-1">
                            <FiUser size={14} className="text-muted" />
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Name"
                              value={deliveryForm.name}
                              onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            />
                          </div>
                          <div className="d-flex align-items-center gap-1 mb-1">
                            <FiPhone size={14} className="text-muted" />
                            <input
                              type="tel"
                              className="form-control form-control-sm"
                              placeholder="Phone"
                              value={deliveryForm.phone}
                              onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                            />
                          </div>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-success d-flex align-items-center gap-1"
                              onClick={() => assignDeliveryBoy(order._id)}>
                              <FiCheck size={14} /> Save
                            </button>
                            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                              onClick={() => { setEditingDelivery(null); setDeliveryForm({ name: '', phone: '', deliveryBoyId: '' }); setAvailableBoys([]); }}>
                              <FiX size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {order.deliveryBoy?.name ? (
                            <div className="delivery-boy-info">
                              <div className="d-flex align-items-center gap-1">
                                <FiUser size={13} className="text-muted" />
                                <small className="fw-bold">{order.deliveryBoy.name}</small>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <FiPhone size={13} className="text-muted" />
                                <small>{order.deliveryBoy.phone}</small>
                              </div>
                              <button className="btn btn-sm btn-link p-0 mt-1" style={{ fontSize: '0.75rem' }}
                                onClick={() => startEditDelivery(order)}>
                                Edit
                              </button>
                            </div>
                          ) : (
                            <button className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                              onClick={() => startEditDelivery(order)}>
                              <FiTruck size={14} /> Assign
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td>
                      {getNextStatus(order.status) && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => updateStatus(order._id, getNextStatus(order.status))}
                        >
                          → {getNextStatus(order.status)}
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <span className="text-success fw-bold">✓ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
