import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi';

const API = 'http://localhost:5000/api';
const CATEGORIES = ['Biryani', 'Meals', 'Snacks', 'Fast Food', 'Beverages', 'Desserts', 'Other'];

export default function ManageDishes() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Biryani', price: '', available: true, image: null });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [restaurantId]);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchData = async () => {
    try {
      const [restRes, dishRes] = await Promise.all([
        axios.get(`${API}/restaurants/${restaurantId}`),
        axios.get(`${API}/dishes/restaurant/${restaurantId}`)
      ]);
      setRestaurant(restRes.data);
      setDishes(dishRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('price', form.price);
    formData.append('available', form.available);
    formData.append('restaurant', restaurantId);
    if (form.image) formData.append('image', form.image);

    try {
      if (editing) {
        await axios.put(`${API}/dishes/${editing}`, formData, {
          headers: { ...getHeaders().headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Dish updated!');
      } else {
        await axios.post(`${API}/dishes`, formData, {
          headers: { ...getHeaders().headers, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Dish added!');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', category: 'Biryani', price: '', available: true, image: null });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (dish) => {
    setEditing(dish._id);
    setForm({
      name: dish.name,
      category: dish.category,
      price: dish.price,
      available: dish.available,
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this dish?')) return;
    try {
      await axios.delete(`${API}/dishes/${id}`, getHeaders());
      toast.success('Dish deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-content">
      <div className="container">
        <button className="btn btn-link text-muted mb-3 p-0" onClick={() => navigate('/admin/restaurants')}>
          <FiArrowLeft className="me-1" /> Back to Restaurants
        </button>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">🍽️ Manage Dishes</h2>
            {restaurant && <p className="text-muted mb-0">{restaurant.name} — {restaurant.city}</p>}
          </div>
          <button className="btn btn-primary-custom" style={{ width: 'auto', padding: '10px 25px' }}
            onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', category: 'Biryani', price: '', available: true, image: null }); }}>
            <FiPlus className="me-1" /> {showForm ? 'Cancel' : 'Add Dish'}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <h5 className="fw-bold mb-3">{editing ? 'Edit Dish' : 'Add New Dish'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Dish Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                  />
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    />
                    <label className="form-check-label">Available</label>
                  </div>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary-custom" style={{ width: 'auto', padding: '10px 30px' }}>
                    {editing ? 'Update Dish' : 'Add Dish'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Dish List */}
        {dishes.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted">No dishes yet</h4>
            <p className="text-muted">Click "Add Dish" to add menu items</p>
          </div>
        ) : (
          <div className="row g-4">
            {dishes.map((dish) => (
              <div key={dish._id} className="col-md-3 col-sm-6">
                <div className="card dish-card">
                  {dish.image ? (
                    <img src={`http://localhost:5000${dish.image}`} alt={dish.name} className="card-img-top" />
                  ) : (
                    <div className="card-img-top placeholder-img" style={{ height: 180 }}>🍽️</div>
                  )}
                  <div className="card-body">
                    <h6 className="fw-bold mb-1">{dish.name}</h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>{dish.category}</span>
                      <span className={dish.available ? 'available-badge' : 'unavailable-badge'}>
                        {dish.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="price mb-2">₹{dish.price}</div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-warning flex-grow-1" onClick={() => handleEdit(dish)}>
                        <FiEdit2 size={14} /> Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger flex-grow-1" onClick={() => handleDelete(dish._id)}>
                        <FiTrash2 size={14} /> Delete
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
