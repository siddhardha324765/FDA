import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';
import { FiSearch, FiMapPin, FiX, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const API = 'http://localhost:5000/api';
const CATEGORIES = [
  { name: 'Biryani', emoji: '🍛' },
  { name: 'Meals', emoji: '🍱' },
  { name: 'Snacks', emoji: '🍟' },
  { name: 'Fast Food', emoji: '🍔' },
  { name: 'Beverages', emoji: '🥤' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Other', emoji: '🍽️' },
];

export default function CustomerHome() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryDishes, setCategoryDishes] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchCart, addToCart } = useCart();
  const { user } = useAuth();
  const cityRef = useRef(null);

  useEffect(() => {
    fetchCities();
    fetchCart();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line
  }, [selectedCity]);

  // Close city dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API}/restaurants/meta/cities`);
      setCities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const url = selectedCity
        ? `${API}/restaurants?city=${selectedCity}`
        : `${API}/restaurants`;
      const res = await axios.get(url);
      setRestaurants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchText.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const clearCity = () => {
    setSelectedCity('');
    setCitySearch('');
  };

  const handleCategoryClick = async (categoryName) => {
    if (selectedCategory === categoryName) {
      // Deselect category
      setSelectedCategory('');
      setCategoryDishes([]);
      return;
    }
    setSelectedCategory(categoryName);
    setCategoryLoading(true);
    try {
      const params = new URLSearchParams({ category: categoryName });
      if (selectedCity) params.append('city', selectedCity);
      const res = await axios.get(`${API}/dishes/by-category?${params}`);
      setCategoryDishes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleAddToCart = async (dish) => {
    try {
      await addToCart(dish, dish.restaurant._id || dish.restaurant);
      toast.success(`${dish.name} added to cart!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Re-fetch category dishes when city changes
  useEffect(() => {
    if (selectedCategory) {
      handleCategoryClick(selectedCategory);
    }
    // eslint-disable-next-line
  }, [selectedCity]);

  return (
    <div className="page-content customer-home">
      {/* Hero Banner */}
      <div className="customer-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Hello, {user?.name?.split(' ')[0] || 'Foodie'} 👋
            </h1>
            <p className="hero-subtitle">What would you like to eat today?</p>

            {/* Search Bar */}
            <div className="search-bar-wrapper">
              <div className="search-bar">
                {/* City Search */}
                <div className="city-search-section" ref={cityRef}>
                  <FiMapPin className="search-icon city-icon" />
                  <input
                    type="text"
                    className="city-search-input"
                    placeholder="Select city..."
                    value={selectedCity || citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setSelectedCity('');
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                  />
                  {selectedCity && (
                    <button className="city-clear-btn" onClick={clearCity}>
                      <FiX size={14} />
                    </button>
                  )}
                  {showCityDropdown && filteredCities.length > 0 && (
                    <div className="city-dropdown">
                      <div
                        className="city-dropdown-item"
                        onClick={() => {
                          setSelectedCity('');
                          setCitySearch('');
                          setShowCityDropdown(false);
                        }}
                      >
                        <FiMapPin size={14} /> All Cities
                      </div>
                      {filteredCities.map((city) => (
                        <div
                          key={city}
                          className={`city-dropdown-item ${selectedCity === city ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedCity(city);
                            setCitySearch('');
                            setShowCityDropdown(false);
                          }}
                        >
                          <FiMapPin size={14} /> {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="search-divider" />

                {/* Restaurant Search */}
                <div className="restaurant-search-section">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    className="restaurant-search-input"
                    placeholder="Search restaurants or cuisines..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  {searchText && (
                    <button className="city-clear-btn" onClick={() => setSearchText('')}>
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* City Quick Pills */}
            {cities.length > 0 && (
              <div className="city-pills">
                <span
                  className={`city-pill ${!selectedCity ? 'active' : ''}`}
                  onClick={clearCity}
                >
                  🌍 All
                </span>
                {cities.slice(0, 6).map((city) => (
                  <span
                    key={city}
                    className={`city-pill ${selectedCity === city ? 'active' : ''}`}
                    onClick={() => { setSelectedCity(city); setCitySearch(''); }}
                  >
                    📍 {city}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Category Row */}
        <div className="category-browse-section">
          <h3 className="results-title" style={{ marginBottom: '0.75rem' }}>
            What are you craving?
          </h3>
          <div className="category-browse-row">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className={`category-browse-item ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <span className="category-browse-emoji">{cat.emoji}</span>
                <span className="category-browse-label">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Dishes */}
        {selectedCategory && (
          <div className="category-dishes-section">
            <div className="results-header">
              <h3 className="results-title">
                {selectedCategory} Dishes
                <span className="results-count">{categoryDishes.length} found</span>
              </h3>
              <button
                className="btn-clear-filters"
                onClick={() => { setSelectedCategory(''); setCategoryDishes([]); }}
              >
                ✕ Clear
              </button>
            </div>
            {categoryLoading ? (
              <Spinner />
            ) : categoryDishes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍽️</div>
                <h4>No {selectedCategory} dishes found</h4>
                <p>Try a different category{selectedCity ? ' or city' : ''}</p>
              </div>
            ) : (
              <div className="row g-3 mb-4">
                {categoryDishes.map((dish) => (
                  <div key={dish._id} className="col-lg-3 col-md-4 col-sm-6">
                    <div className="card category-dish-card">
                      <div className="category-dish-img-wrapper">
                        {dish.image ? (
                          <img
                            src={`http://localhost:5000${dish.image}`}
                            alt={dish.name}
                            className="card-img-top"
                          />
                        ) : (
                          <div className="card-img-top placeholder-img" style={{ height: 160 }}>
                            {CATEGORIES.find(c => c.name === dish.category)?.emoji || '🍽️'}
                          </div>
                        )}
                      </div>
                      <div className="card-body" style={{ padding: '0.85rem' }}>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{dish.name}</h6>
                        {dish.restaurant && (
                          <p className="text-muted mb-1" style={{ fontSize: '0.78rem' }}>
                            📍 {dish.restaurant.name}{dish.restaurant.city ? `, ${dish.restaurant.city}` : ''}
                          </p>
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="fw-bold" style={{ color: 'var(--primary)', fontSize: '1rem' }}>
                            ₹{dish.price}
                          </span>
                          <button
                            className="btn btn-sm btn-add-dish"
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
        )}

        {/* Results Header */}
        <div className="results-header">
          <h3 className="results-title">
            {selectedCity ? `Restaurants in ${selectedCity}` : 'All Restaurants'}
            <span className="results-count">{filteredRestaurants.length} found</span>
          </h3>
        </div>

        {/* Restaurant List */}
        {loading ? (
          <Spinner />
        ) : filteredRestaurants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h4>No restaurants found</h4>
            <p>Try a different city or search term</p>
            {(selectedCity || searchText) && (
              <button
                className="btn-clear-filters"
                onClick={() => { clearCity(); setSearchText(''); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant._id} className="col-lg-4 col-md-6">
                <div
                  className="card restaurant-card"
                  onClick={() => navigate(`/customer/restaurant/${restaurant._id}`)}
                >
                  <div className="card-img-wrapper">
                    {restaurant.image ? (
                      <img
                        src={`http://localhost:5000${restaurant.image}`}
                        alt={restaurant.name}
                        className="card-img-top"
                      />
                    ) : (
                      <div className="card-img-top placeholder-img" style={{ height: 200 }}>
                        {restaurant.name.charAt(0)}
                      </div>
                    )}
                    <div className="card-img-overlay-badge">
                      <span className="img-city-badge"><FiMapPin size={12} /> {restaurant.city}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{restaurant.name}</h5>
                    <p className="card-text text-muted" style={{ fontSize: '0.88rem' }}>
                      {restaurant.description?.substring(0, 90)}
                      {restaurant.description?.length > 90 ? '...' : ''}
                    </p>
                    <div className="card-footer-info">
                      <span className="city-badge">📍 {restaurant.city}</span>
                      <div className="d-flex align-items-center gap-2">
                        {restaurant.avgRating > 0 && (
                          <span className="rating-pill">
                            <FiStar size={12} className="rating-star-filled" /> {restaurant.avgRating}
                            <span className="rating-pill-count">({restaurant.ratingCount})</span>
                          </span>
                        )}
                        <span className="restaurant-cta">View Menu →</span>
                      </div>
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
