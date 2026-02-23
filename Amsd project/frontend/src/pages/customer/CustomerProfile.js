import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit3 } from 'react-icons/fi';

const API = 'http://localhost:5000/api';

export default function CustomerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' }
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const u = res.data.user;
      setProfile({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        address: {
          street: u.address?.street || '',
          city: u.address?.city || '',
          state: u.address?.state || '',
          pincode: u.address?.pincode || ''
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/auth/profile`, {
        name: profile.name,
        phone: profile.phone,
        address: profile.address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Profile Header */}
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {initials}
          </div>
          <div className="profile-header-info">
            <h2 className="fw-bold mb-1">{profile.name}</h2>
            <p className="text-muted mb-0">{profile.email}</p>
            {profile.address?.city && (
              <p className="mb-0" style={{ fontSize: '0.88rem', color: '#64748b' }}>
                <FiMapPin size={13} /> {profile.address.city}{profile.address.state ? `, ${profile.address.state}` : ''}
              </p>
            )}
          </div>
          <button
            className={`btn-edit-profile ${editing ? 'active' : ''}`}
            onClick={() => setEditing(!editing)}
          >
            <FiEdit3 size={16} /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave}>
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h5><FiUser className="me-2" /> Personal Information</h5>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Full Name</label>
                <div className="profile-input-group">
                  <FiUser className="profile-input-icon" />
                  <input
                    type="text"
                    className="form-control profile-input"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!editing}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Email</label>
                <div className="profile-input-group">
                  <FiMail className="profile-input-icon" />
                  <input
                    type="email"
                    className="form-control profile-input"
                    value={profile.email}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Phone</label>
                <div className="profile-input-group">
                  <FiPhone className="profile-input-icon" />
                  <input
                    type="tel"
                    className="form-control profile-input"
                    placeholder="Your phone number"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h5><FiMapPin className="me-2" /> Delivery Address</h5>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Street Address</label>
                <input
                  type="text"
                  className="form-control profile-input"
                  placeholder="House/Flat no., Street name, Area"
                  value={profile.address.street}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, street: e.target.value }
                  })}
                  disabled={!editing}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>City</label>
                <input
                  type="text"
                  className="form-control profile-input"
                  placeholder="City"
                  value={profile.address.city}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, city: e.target.value }
                  })}
                  disabled={!editing}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>State</label>
                <input
                  type="text"
                  className="form-control profile-input"
                  placeholder="State"
                  value={profile.address.state}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, state: e.target.value }
                  })}
                  disabled={!editing}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Pincode</label>
                <input
                  type="text"
                  className="form-control profile-input"
                  placeholder="Pincode"
                  value={profile.address.pincode}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: { ...profile.address, pincode: e.target.value }
                  })}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="text-end mb-4">
              <button type="submit" className="btn-save-profile" disabled={saving}>
                <FiSave className="me-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
