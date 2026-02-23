import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function DeliveryRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const { deliveryRegister, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await deliveryRegister(name, email, password, phone, city);
      toast.success('Delivery partner account created!');
      navigate('/delivery/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>🚚 Delivery Partner Sign Up</h2>
        <p className="subtitle">Join as a delivery partner</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError(); }}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
              minLength={6}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearError(); }}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-control"
              placeholder="City where you can deliver"
              value={city}
              onChange={(e) => { setCity(e.target.value); clearError(); }}
              required
            />
          </div>
          <button type="submit" className="btn-primary-custom mb-3" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mb-2">
          Already have an account? <Link to="/delivery/login">Sign In</Link>
        </p>
        <p className="text-center">
          <Link to="/" style={{ color: '#888', fontSize: '0.85rem' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
