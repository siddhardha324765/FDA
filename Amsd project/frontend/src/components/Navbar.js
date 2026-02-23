import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiLogOut, FiHome, FiList, FiClipboard, FiStar, FiBarChart2, FiPackage, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) return null;

  return (
    <nav className="app-navbar navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'delivery' ? '/delivery/dashboard' : '/customer/home'}>
          ⚡ Fast Way
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user.role === 'customer' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/customer/home')}`} to="/customer/home">
                    <FiHome className="me-1" /> Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/customer/dashboard')}`} to="/customer/dashboard">
                    <FiBarChart2 className="me-1" /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/customer/orders')}`} to="/customer/orders">
                    <FiList className="me-1" /> My Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/customer/profile')}`} to="/customer/profile">
                    <FiUser className="me-1" /> Profile
                  </Link>
                </li>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/dashboard')}`} to="/admin/dashboard">
                    <FiBarChart2 className="me-1" /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/restaurants')}`} to="/admin/restaurants">
                    <FiHome className="me-1" /> Restaurants
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/orders')}`} to="/admin/orders">
                    <FiClipboard className="me-1" /> Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/feedback')}`} to="/admin/feedback">
                    <FiStar className="me-1" /> Feedback
                  </Link>
                </li>
              </>
            )}
            {user.role === 'delivery' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/delivery/dashboard')}`} to="/delivery/dashboard">
                    <FiBarChart2 className="me-1" /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/delivery/orders')}`} to="/delivery/orders">
                    <FiPackage className="me-1" /> My Deliveries
                  </Link>
                </li>
              </>
            )}
          </ul>
          <ul className="navbar-nav align-items-center">
            {user.role === 'customer' && (
              <li className="nav-item me-3">
                <Link className="nav-link cart-badge" to="/customer/cart">
                  <FiShoppingCart size={22} />
                  {totalItems > 0 && (
                    <span className="badge rounded-pill">{totalItems}</span>
                  )}
                </Link>
              </li>
            )}
            <li className="nav-item">
              <span className="nav-link" style={{ color: '#888', fontSize: '0.85rem' }}>
                Hi, {user.name}
              </span>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                <FiLogOut className="me-1" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
