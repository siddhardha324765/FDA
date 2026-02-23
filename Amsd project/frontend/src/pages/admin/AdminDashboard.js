import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import Spinner from '../../components/Spinner';
import { FiMapPin, FiTrendingUp, FiExternalLink } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const API = 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/stats/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!stats) return <div className="container py-5 text-center"><h4>Failed to load dashboard</h4></div>;

  const barData = {
    labels: stats.restaurantStats.map(r => r.restaurant.name),
    datasets: [
      {
        label: 'Orders',
        data: stats.restaurantStats.map(r => r.totalOrders),
        backgroundColor: 'rgba(255, 87, 34, 0.75)',
        borderRadius: 8,
        barPercentage: 0.6
      },
      {
        label: 'Revenue (₹)',
        data: stats.restaurantStats.map(r => r.revenue),
        backgroundColor: 'rgba(30, 58, 95, 0.75)',
        borderRadius: 8,
        barPercentage: 0.6
      }
    ]
  };

  const doughnutData = {
    labels: ['Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'],
    datasets: [{
      data: [
        stats.statusBreakdown.Placed,
        stats.statusBreakdown.Preparing,
        stats.statusBreakdown.Ready,
        stats.statusBreakdown['Out for Delivery'] || 0,
        stats.statusBreakdown.Delivered
      ],
      backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#8b5cf6', '#6b7280'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  return (
    <div className="page-content">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.5px' }}>📊 Admin Dashboard</h2>
            <p className="text-muted mb-0" style={{ fontSize: '0.92rem' }}>Combined overview of all your restaurants</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ff6b35, #ffc857)' }}>🏪</div>
                <div>
                  <div className="stat-value">{stats.totalRestaurants}</div>
                  <div className="stat-label">Restaurants</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #004e89, #1a8fe3)' }}>📦</div>
                <div>
                  <div className="stat-value">{stats.totalOrders}</div>
                  <div className="stat-label">Total Orders</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>💰</div>
                <div>
                  <div className="stat-value">₹{stats.totalRevenue}</div>
                  <div className="stat-label">Revenue</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>⏳</div>
                <div>
                  <div className="stat-value">{stats.pendingOrders}</div>
                  <div className="stat-label">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Cards — Click to open individual dashboard */}
        {stats.restaurantStats.length > 0 && (
          <div className="dashboard-section mb-4">
            <div className="dashboard-section-header">
              <h5>🏪 Your Restaurants</h5>
              <span className="section-badge">{stats.restaurantStats.length} restaurants</span>
            </div>
            <div className="row g-3">
              {stats.restaurantStats.map((r) => (
                <div key={r.restaurant.id} className="col-lg-4 col-md-6">
                  <div
                    className="restaurant-grid-card"
                    onClick={() => navigate(`/admin/restaurant-dashboard/${r.restaurant.id}`)}
                  >
                    <div className="rg-header">
                      <div className="rg-avatar">
                        {r.restaurant.image ? (
                          <img src={`http://localhost:5000${r.restaurant.image}`} alt={r.restaurant.name} />
                        ) : (
                          <div className="rg-avatar-placeholder">{r.restaurant.name.charAt(0)}</div>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="rg-name">{r.restaurant.name}</div>
                        <div className="rg-city"><FiMapPin size={12} /> {r.restaurant.city}</div>
                      </div>
                      <FiExternalLink size={16} style={{ color: '#94a3b8' }} />
                    </div>
                    <div className="rg-stats">
                      <div className="rg-stat">
                        <div className="rg-stat-value">{r.totalOrders}</div>
                        <div className="rg-stat-label">Orders</div>
                      </div>
                      <div className="rg-stat">
                        <div className="rg-stat-value" style={{ color: '#10b981' }}>₹{r.revenue}</div>
                        <div className="rg-stat-label">Revenue</div>
                      </div>
                      <div className="rg-stat">
                        <div className="rg-stat-value" style={{ color: '#f59e0b' }}>{r.pending}</div>
                        <div className="rg-stat-label">Pending</div>
                      </div>
                      <div className="rg-stat">
                        <div className="rg-stat-value" style={{ color: '#3b82f6' }}>{r.delivered}</div>
                        <div className="rg-stat-label">Delivered</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h5><FiTrendingUp className="me-1" /> Restaurant Performance</h5>
              </div>
              {stats.restaurantStats.length > 0 ? (
                <Bar data={barData} options={{
                  responsive: true,
                  plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 15 } } },
                  scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                  }
                }} />
              ) : (
                <p className="text-muted text-center py-3">No data yet. Add restaurants to see performance.</p>
              )}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h5>Order Status</h5>
              </div>
              {stats.totalOrders > 0 ? (
                <Doughnut data={doughnutData} options={{
                  responsive: true,
                  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 12 } } },
                  cutout: '65%'
                }} />
              ) : (
                <p className="text-muted text-center py-3">No orders yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Per Restaurant Table */}
        {stats.restaurantStats.length > 0 && (
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h5>Restaurant Details</h5>
            </div>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Restaurant</th>
                    <th>City</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Pending</th>
                    <th>Delivered</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.restaurantStats.map((r) => (
                    <tr key={r.restaurant.id}>
                      <td className="fw-bold">{r.restaurant.name}</td>
                      <td>{r.restaurant.city}</td>
                      <td>{r.totalOrders}</td>
                      <td className="fw-bold">₹{r.revenue}</td>
                      <td><span className="text-warning fw-bold">{r.pending}</span></td>
                      <td><span className="text-success fw-bold">{r.delivered}</span></td>
                      <td>
                        <button
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(255,87,34,0.08)',
                            color: '#ff5722',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            borderRadius: '8px',
                            padding: '5px 14px',
                            border: 'none'
                          }}
                          onClick={() => navigate(`/admin/restaurant-dashboard/${r.restaurant.id}`)}
                        >
                          View Dashboard →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
