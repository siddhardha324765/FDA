import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import { FiPackage, FiCheckCircle, FiClock, FiDollarSign, FiMapPin, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const API = 'http://localhost:5000/api';

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(user?.available ?? true);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/delivery/stats`, getHeaders());
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const res = await axios.put(`${API}/delivery/toggle-availability`, {}, getHeaders());
      setAvailable(res.data.available);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner />;
  if (!stats) return <div className="container py-5 text-center"><h4>Failed to load dashboard</h4></div>;

  return (
    <div className="page-content">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">🚚 Delivery Dashboard</h2>
          <button
            className={`btn ${available ? 'btn-success' : 'btn-secondary'} d-flex align-items-center gap-2`}
            onClick={toggleAvailability}
          >
            {available ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
            {available ? 'Available' : 'Offline'}
          </button>
        </div>

        {/* City Info */}
        <div className="bg-white rounded-4 p-3 mb-4 shadow-sm d-flex align-items-center gap-2">
          <FiMapPin size={20} className="text-danger" />
          <span className="fw-bold">Your Delivery City:</span>
          <span className="badge bg-primary fs-6">{stats.city || user?.city || 'Not Set'}</span>
        </div>

        {/* Stat Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3 col-sm-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #004e89, #1a8fe3)' }}>
                  <FiPackage size={22} color="#fff" />
                </div>
                <div>
                  <div className="stat-value">{stats.totalOrders}</div>
                  <div className="stat-label">Total Orders</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #71d88a)' }}>
                  <FiCheckCircle size={22} color="#fff" />
                </div>
                <div>
                  <div className="stat-value">{stats.deliveredOrders}</div>
                  <div className="stat-label">Delivered</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #ffdb58)' }}>
                  <FiClock size={22} color="#fff" />
                </div>
                <div>
                  <div className="stat-value">{stats.pendingOrders}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ff6b35, #ffc857)' }}>
                  <FiDollarSign size={22} color="#fff" />
                </div>
                <div>
                  <div className="stat-value">₹{stats.totalEarnings}</div>
                  <div className="stat-label">Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
          <h5 className="fw-bold mb-3">Order Status Breakdown</h5>
          <div className="row g-3">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div className="col-md-2 col-4" key={status}>
                <div className="text-center p-3 rounded-3" style={{ background: '#f8f9fa' }}>
                  <div className="fw-bold fs-4">{count}</div>
                  <small className="text-muted">{status}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
