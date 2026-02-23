import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

export default function CustomerRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password, 'customer');
      toast.success('Account created successfully!');
      navigate('/customer/home');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-decoration">
        <div className="auth-deco-circle auth-deco-circle-1" />
        <div className="auth-deco-circle auth-deco-circle-2" />
        <div className="auth-deco-circle auth-deco-circle-3" />
      </div>
      <div className="auth-card">
        <div className="auth-logo">🍕</div>
        <h2>Create Account</h2>
        <p className="subtitle">Join us and order delicious food</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <div className="auth-input-group">
              <FiUser className="auth-input-icon" />
              <input
                type="text"
                className="form-control auth-input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError(); }}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <div className="auth-input-group">
              <FiMail className="auth-input-icon" />
              <input
                type="email"
                className="form-control auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="auth-input-group">
              <FiLock className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control auth-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary-custom mb-3" disabled={loading}>
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" /> Creating Account...
              </span>
            ) : (
              <span className="d-flex align-items-center justify-content-center gap-2">
                Sign Up <FiArrowRight />
              </span>
            )}
          </button>
        </form>
        <div className="auth-divider">
          <span>or</span>
        </div>
        <p className="text-center mb-2">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </p>
        <p className="text-center">
          <Link to="/" className="auth-back-link">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
