import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Spinner from '../../components/Spinner';
import { FiArrowLeft, FiMapPin, FiPackage, FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API = 'http://localhost:5000/api';

export default function RestaurantDashboard() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/stats/dashboard/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!data) return (
    <div className="page-content">
      <div className="container text-center py-5">
        <h4>Failed to load restaurant dashboard</h4>
        <button className="btn btn-outline-secondary mt-3" onClick={() => navigate('/admin/dashboard')}>
          <FiArrowLeft className="me-2" /> Back to Dashboard
        </button>
      </div>
    </div>
  );

  const { restaurant, totalOrders, totalRevenue, pendingOrders, deliveredOrders, statusBreakdown, last7Days, recentOrders } = data;

  const doughnutData = {
    labels: ['Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'],
    datasets: [{
      data: [
        statusBreakdown.Placed,
        statusBreakdown.Preparing,
        statusBreakdown.Ready,
        statusBreakdown['Out for Delivery'] || 0,
        statusBreakdown.Delivered
      ],
      backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#8b5cf6', '#6b7280'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const lineData = {
    labels: last7Days.map(d => d.date),
    datasets: [
      {
        label: 'Orders',
        data: last7Days.map(d => d.orders),
        borderColor: '#ff5722',
        backgroundColor: 'rgba(255, 87, 34, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ff5722',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  const revenueBarData = {
    labels: last7Days.map(d => d.date),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: last7Days.map(d => d.revenue),
        backgroundColor: 'rgba(30, 58, 95, 0.8)',
        borderRadius: 8,
        barPercentage: 0.6
      }
    ]
  };

  const statusColor = (status) => {
    const map = {
      'Placed': 'status-placed',
      'Preparing': 'status-preparing',
      'Ready': 'status-ready',
      'Out for Delivery': 'status-out-for-delivery',
      'Delivered': 'status-delivered'
    };
    return map[status] || '';
  };

  return (
    <div className="page-content">
      <div className="container">
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/admin/dashboard')}
            style={{ borderRadius: '10px', padding: '8px 16px' }}
          >
            <FiArrowLeft /> Back
          </button>
          <div className="d-flex align-items-center gap-3">
            {restaurant.image ? (
              <img
                src={`http://localhost:5000${restaurant.image}`}
                alt={restaurant.name}
                style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: 12,
                background: 'linear-gradient(135deg, #ff5722, #ffb300)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '1.3rem'
              }}>
                {restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px' }}>{restaurant.name}</h3>
              <span style={{ color: '#64748b', fontSize: '0.88rem' }}>
                <FiMapPin size={13} /> {restaurant.city}
              </span>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          {[
            { icon: <FiPackage />, value: totalOrders, label: 'Total Orders', gradient: 'linear-gradient(135deg, #ff6b35, #ffc857)' },
            { icon: <FiDollarSign />, value: `₹${totalRevenue}`, label: 'Revenue', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
            { icon: <FiClock />, value: pendingOrders, label: 'Pending', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
            { icon: <FiCheckCircle />, value: deliveredOrders, label: 'Delivered', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
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

        {/* Charts Row */}
        <div className="row g-4 mb-4">
          <div className="col-lg-8">
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h5><FiTrendingUp /> Orders — Last 7 Days</h5>
              </div>
              {last7Days.some(d => d.orders > 0) ? (
                <Line data={lineData} options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                  }
                }} />
              ) : (
                <p className="text-muted text-center py-4">No orders in the last 7 days</p>
              )}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h5>Order Status</h5>
              </div>
              {totalOrders > 0 ? (
                <Doughnut data={doughnutData} options={{
                  responsive: true,
                  plugins: { legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, pointStyle: 'circle' } } },
                  cutout: '65%'
                }} />
              ) : (
                <p className="text-muted text-center py-4">No orders yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Bar Chart */}
        <div className="dashboard-section mb-4">
          <div className="dashboard-section-header">
            <h5><FiDollarSign /> Revenue — Last 7 Days</h5>
          </div>
          {last7Days.some(d => d.revenue > 0) ? (
            <Bar data={revenueBarData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true },
                x: { grid: { display: false } }
              }
            }} />
          ) : (
            <p className="text-muted text-center py-4">No revenue data yet</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h5><FiPackage /> Recent Orders</h5>
            <span className="section-badge">{recentOrders.length} orders</span>
          </div>
          {recentOrders.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="fw-bold" style={{ fontSize: '0.82rem' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td>{order.customer?.name || 'N/A'}</td>
                      <td>{order.items?.length || 0} items</td>
                      <td className="fw-bold">₹{order.totalAmount}</td>
                      <td>
                        <span className={`status-badge ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-4">No orders yet for this restaurant</p>
          )}
        </div>
      </div>
    </div>
  );
}
