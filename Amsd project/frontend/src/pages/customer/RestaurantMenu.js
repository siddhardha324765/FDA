import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import { FiStar } from 'react-icons/fi';

const API = 'http://localhost:5000/api';
const CATEGORIES = ['All', 'Biryani', 'Meals', 'Snacks', 'Fast Food', 'Beverages', 'Desserts', 'Other'];

export default function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [restRes, dishRes] = await Promise.all([
        axios.get(`${API}/restaurants/${id}`),
        axios.get(`${API}/dishes/restaurant/${id}`)
      ]);
      setRestaurant(restRes.data);
      setDishes(dishRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (dish) => {
    try {
      await addToCart(dish, id);
      toast.success(`${dish.name} added to cart!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredDishes = selectedCategory === 'All'
    ? dishes.filter(d => d.available)
    : dishes.filter(d => d.category === selectedCategory && d.available);

  if (loading) return <Spinner />;
  if (!restaurant) return <div className="container py-5 text-center"><h4>Restaurant not found</h4></div>;

  return (
    <div className="page-content">
      <div className="container">
        {/* Restaurant Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="p-4 rounded-4" style={{
              background: 'linear-gradient(135deg, #ff6b35, #ffc857)',
              color: '#fff'
            }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h2 className="fw-bold mb-1">{restaurant.name}</h2>
                  <p className="mb-1">📍 {restaurant.city}</p>
                  <p className="mb-0" style={{ opacity: 0.9 }}>{restaurant.description}</p>
                  {restaurant.avgRating > 0 && (
                    <div className="mt-2 d-flex align-items-center gap-2">
                      <span style={{
                        background: 'rgba(255,255,255,0.25)',
                        padding: '4px 12px',
                        borderRadius: '100px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FiStar size={14} /> {restaurant.avgRating}
                      </span>
                      <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                        {restaurant.ratingCount} review{restaurant.ratingCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-light btn-sm fw-bold d-flex align-items-center gap-1"
                  style={{ borderRadius: '20px', padding: '8px 18px' }}
                  onClick={() => navigate(`/customer/reviews/${id}`)}
                >
                  <FiStar size={16} /> Reviews
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dishes Grid */}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No dishes available in this category</h5>
          </div>
        ) : (
          <div className="row g-4 mt-2">
            {filteredDishes.map((dish) => (
              <div key={dish._id} className="col-md-3 col-sm-6">
                <div className="card dish-card">
                  {dish.image ? (
                    <img
                      src={`http://localhost:5000${dish.image}`}
                      alt={dish.name}
                      className="card-img-top"
                    />
                  ) : (
                    <div className="card-img-top placeholder-img" style={{ height: 180 }}>
                      🍽️
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h6 className="fw-bold mb-1">{dish.name}</h6>
                    <span className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                      {dish.category}
                    </span>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="price">₹{dish.price}</span>
                      <button
                        className="btn-add-cart btn btn-sm"
                        onClick={() => handleAddToCart(dish)}
                      >
                        + Add
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
