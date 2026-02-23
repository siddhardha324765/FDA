import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Spinner from '../../components/Spinner';
import OrderTracker from '../../components/OrderTracker';
import { useAuth } from '../../context/AuthContext';
import { FiPackage, FiDollarSign, FiCheckCircle, FiClock, FiTruck, FiPhone, FiArrowRight } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API = 'http://localhost:5000/api';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/auth/customer/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/orders/my`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  if (loading) return <Spinner />;

  const spendingData = stats ? {
    labels: stats.monthlySpending.map(m => m.month),
    datasets: [
      {
        label: 'Spent (₹)',
        data: stats.monthlySpending.map(m => m.spent),
        backgroundColor: 'rgba(255, 87, 34, 0.7)',
        borderRadius: 8,
        barPercentage: 0.6
      },
      {
        label: 'Orders',
        data: stats.monthlySpending.map(m => m.orders),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 8,
        barPercentage: 0.6
      }
    ]
  } : null;

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold" style={{ letterSpacing: '-0.5px' }}>
            📊 My Dashboard
          </h2>
          <p className="text-muted mb-0">
            Welcome back, {user?.name?.split(' ')[0]}! Here's your ordering summary.
          </p>
        </div>

        {/* Stat Cards */}
        {stats && (
          <div className="row g-3 mb-4">
            {[
              { icon: <FiPackage />, value: stats.totalOrders, label: 'Total Orders', gradient: 'linear-gradient(135deg, #ff6b35, #ffc857)' },
              { icon: <FiDollarSign />, value: `₹${stats.totalSpent}`, label: 'Total Spent', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
              { icon: <FiCheckCircle />, value: stats.delivered, label: 'Delivered', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
              { icon: <FiClock />, value: stats.active, label: 'Active', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
            ].map((stat, i) => (
              <div key={i} className="col-md-3 col-6">
                <div className="stat-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="stat-icon" style={{ background: stat.gradient, fontSize: '1.2rem' }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {stats && spendingData && (
          <div className="dashboard-section mb-4">
            <div className="dashboard-section-header">
              <h5><FiDollarSign className="me-1" /> Spending — Last 6 Months</h5>
            </div>
            {stats.monthlySpending.some(m => m.spent > 0) ? (
              <Bar data={spendingData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 15 } }
                },
                scales: {
                  y: { beginAtZero: true },
                  x: { grid: { display: false } }
                }
              }} />
            ) : (
              <p className="text-muted text-center py-4">No order data yet. Start ordering!</p>
            )}
          </div>
        )}

        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h5><FiPackage className="me-1" /> Recent Orders</h5>
            <button
              className="btn btn-sm"
              style={{
                background: 'rgba(255,87,34,0.08)', color: '#ff5722',
                fontWeight: 600, fontSize: '0.8rem', borderRadius: '8px',
                padding: '5px 14px', border: 'none'
              }}
              onClick={() => navigate('/customer/orders')}
            >
              View All <FiArrowRight size={13} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-3">You haven't placed any orders yet</p>
              <button
                className="btn-primary-custom"
                style={{ width: 'auto', padding: '10px 30px' }}
                onClick={() => navigate('/customer/home')}
              >
                Start Ordering
              </button>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order._id}
                className="recent-order-card"
                onClick={() => navigate(`/customer/order/${order._id}`)}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold mb-1">{order.restaurant?.name || 'Restaurant'}</h6>
                    <small className="text-muted">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <div className="text-end">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <div className="fw-bold mt-1" style={{ color: '#ff6b35', fontSize: '0.95rem' }}>₹{order.totalAmount}</div>
                  </div>
                </div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  {order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}
                </div>
                {order.status !== 'Delivered' && (
                  <OrderTracker currentStatus={order.status} />
                )}
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
