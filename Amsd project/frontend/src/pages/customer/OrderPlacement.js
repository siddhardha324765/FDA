import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { FiMapPin, FiUser } from 'react-icons/fi';

const API = 'http://localhost:5000/api';

export default function OrderPlacement() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const { items, restaurant, totalPrice, fetchCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = res.data;
      if (user.address) {
        const parts = [user.address.street, user.address.city, user.address.state, user.address.pincode].filter(Boolean);
        if (parts.length > 0) {
          setAddress(parts.join(', '));
          setProfileLoaded(true);
        }
      }
    } catch (err) {
      console.error('Could not load profile address');
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/orders/place`, { deliveryAddress: address }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order placed successfully! 🎉');
      navigate('/customer/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-content">
        <div className="container text-center py-5">
          <h4 className="text-muted mb-3">No items in cart</h4>
          <button className="btn btn-primary-custom" style={{ width: 'auto', padding: '10px 30px' }}
            onClick={() => navigate('/customer/home')}>
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="fw-bold mb-4">📦 Place Order</h2>
        <div className="row">
          <div className="col-lg-7">
            <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
              <h5 className="fw-bold mb-3"><FiMapPin className="me-2" />Delivery Address</h5>
              {profileLoaded && (
                <div className="profile-address-hint">
                  <FiUser size={14} />
                  <span>Auto-filled from your profile</span>
                </div>
              )}
              <form onSubmit={handlePlaceOrder}>
                <textarea
                  className="form-control mb-3"
                  rows="3"
                  placeholder="Enter your full delivery address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  style={{ borderRadius: '10px' }}
                />

                <h5 className="fw-bold mb-3">Payment Method</h5>
                <div className="form-check mb-4 p-3 rounded-3" style={{ background: '#f8f9fa' }}>
                  <input className="form-check-input" type="radio" checked readOnly />
                  <label className="form-check-label fw-bold ms-2">
                    💵 Cash on Delivery (COD)
                  </label>
                </div>

                <button type="submit" className="btn-primary-custom" disabled={loading}>
                  {loading ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="bg-white rounded-4 p-4 shadow-sm">
              <h5 className="fw-bold mb-3">Order Summary</h5>
              {restaurant && (
                <p className="text-muted mb-3">From: <strong>{restaurant.name}</strong></p>
              )}
              {items.map((item) => (
                <div key={item.dish} className="d-flex justify-content-between mb-2">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <h5 className="fw-bold">Total</h5>
                <h5 className="fw-bold" style={{ color: '#ff6b35' }}>₹{totalPrice}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
