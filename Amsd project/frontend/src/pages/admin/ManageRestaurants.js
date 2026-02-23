import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import { FiEdit2, FiTrash2, FiPlus, FiList } from 'react-icons/fi';

const API = 'http://localhost:5000/api';

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', description: '', image: null, allowCancellation: true });
  const navigate = useNavigate();

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get(`${API}/restaurants/admin/my`, getHeaders());
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('city', form.city);
    formData.append('description', form.description);
    formData.append('allowCancellation', form.allowCancellation);
    if (form.image) formData.append('image', form.image);

    try {
      if (editing) {
        await axios.put(`${API}/restaurants/${editing}`, formData, {
          headers: { ...getHeaders().headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Restaurant updated!');
      } else {
        await axios.post(`${API}/restaurants`, formData, {
          headers: { ...getHeaders().headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Restaurant added!');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', city: '', description: '', image: null, allowCancellation: true });
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (restaurant) => {
    setEditing(restaurant._id);
    setForm({
      name: restaurant.name,
      city: restaurant.city,
      description: restaurant.description,
      image: null,
      allowCancellation: restaurant.allowCancellation !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    try {
      await axios.delete(`${API}/restaurants/${id}`, getHeaders());
      toast.success('Restaurant deleted');
      fetchRestaurants();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-content">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold">🏪 My Restaurants</h2>
          <button className="btn btn-primary-custom" style={{ width: 'auto', padding: '10px 25px' }}
            onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', city: '', description: '', image: null, allowCancellation: true }); }}>
            <FiPlus className="me-1" /> {showForm ? 'Cancel' : 'Add Restaurant'}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <h5 className="fw-bold mb-3">{editing ? 'Edit Restaurant' : 'Add New Restaurant'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Restaurant Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-center">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="allowCancellation"
                      checked={form.allowCancellation}
                      onChange={(e) => setForm({ ...form, allowCancellation: e.target.checked })}
                      style={{ width: '44px', height: '22px' }}
                    />
                    <label className="form-check-label ms-2 fw-semibold" htmlFor="allowCancellation">
                      Allow Order Cancellation
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary-custom" style={{ width: 'auto', padding: '10px 30px' }}>
                    {editing ? 'Update' : 'Add Restaurant'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Restaurant List */}
        {restaurants.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No restaurants yet</h4>
            <p className="text-muted">Click "Add Restaurant" to get started</p>
          </div>
        ) : (
          <div className="row g-4">
            {restaurants.map((r) => (
              <div key={r._id} className="col-md-4 col-sm-6">
                <div className="card restaurant-card" style={{ cursor: 'default' }}>
                  {r.image ? (
                    <img src={`http://localhost:5000${r.image}`} alt={r.name} className="card-img-top" />
                  ) : (
                    <div className="card-img-top placeholder-img" style={{ height: 200 }}>
                      {r.name.charAt(0)}
                    </div>
                  )}
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{r.name}</h5>
                    <span className="city-badge mb-2 d-inline-block">📍 {r.city}</span>
                    {r.allowCancellation === false && (
                      <span className="no-cancel-badge ms-2 d-inline-block">🚫 No Cancel</span>
                    )}
                    <p className="card-text text-muted" style={{ fontSize: '0.85rem' }}>
                      {r.description?.substring(0, 80)}...
                    </p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/admin/dishes/${r._id}`)}>
                        <FiList className="me-1" /> Dishes
                      </button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => handleEdit(r)}>
                        <FiEdit2 className="me-1" /> Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r._id)}>
                        <FiTrash2 className="me-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
