import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiClock, FiMapPin, FiStar, FiTruck, FiArrowRight, FiSmartphone, FiHeart, FiZap } from 'react-icons/fi';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-v2">
      {/* Floating Nav */}
      <nav className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">🚀</span>
            <span className="landing-logo-text">Fast Way</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/admin/login" className="landing-nav-link">
              <FiShield size={14} /> Admin
            </Link>
            <Link to="/delivery/login" className="landing-nav-link">
              <FiTruck size={14} /> Delivery
            </Link>
            <Link to="/login" className="landing-nav-btn">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero-v2">
        <div className="landing-hero-bg">
          <div className="landing-blob landing-blob-1"></div>
          <div className="landing-blob landing-blob-2"></div>
          <div className="landing-blob landing-blob-3"></div>
        </div>
        <div className="landing-hero-content">
          <div className="landing-hero-badge">🔥 #1 Food Delivery Platform</div>
          <h1 className="landing-hero-title">
            Delicious Food,<br />
            <span className="landing-gradient-text">Delivered Fast</span>
          </h1>
          <p className="landing-hero-desc">
            Discover hundreds of restaurants, browse thousands of dishes, and get your
            favorite meals delivered to your doorstep in minutes.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register" className="landing-btn-primary">
              Get Started Free <FiArrowRight />
            </Link>
            <Link to="/login" className="landing-btn-secondary">
              I have an account
            </Link>
          </div>
          <div className="landing-hero-trust">
            <div className="landing-trust-avatars">
              <div className="landing-trust-avatar" style={{ background: '#ff6b35' }}>A</div>
              <div className="landing-trust-avatar" style={{ background: '#4ecdc4' }}>R</div>
              <div className="landing-trust-avatar" style={{ background: '#6c5ce7' }}>K</div>
              <div className="landing-trust-avatar" style={{ background: '#fd79a8' }}>S</div>
            </div>
            <span className="landing-trust-text">Trusted by <strong>10,000+</strong> happy customers</span>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-phone-mockup">
            <div className="landing-phone-screen">
              <div className="landing-mock-header">
                <div className="landing-mock-dot"></div>
                <div className="landing-mock-dot"></div>
                <div className="landing-mock-dot"></div>
              </div>
              <div className="landing-mock-card">
                <div className="landing-mock-img">🍕</div>
                <div>
                  <div className="landing-mock-title">Margherita Pizza</div>
                  <div className="landing-mock-price">₹299</div>
                </div>
              </div>
              <div className="landing-mock-card">
                <div className="landing-mock-img">🍔</div>
                <div>
                  <div className="landing-mock-title">Classic Burger</div>
                  <div className="landing-mock-price">₹199</div>
                </div>
              </div>
              <div className="landing-mock-card">
                <div className="landing-mock-img">🍜</div>
                <div>
                  <div className="landing-mock-title">Ramen Bowl</div>
                  <div className="landing-mock-price">₹349</div>
                </div>
              </div>
              <div className="landing-mock-btn">Order Now</div>
            </div>
          </div>
          <div className="landing-float-card landing-float-1">
            <span>🎉</span> Order Placed!
          </div>
          <div className="landing-float-card landing-float-2">
            <span>⭐</span> 4.9 Rating
          </div>
          <div className="landing-float-card landing-float-3">
            <span>🚀</span> 20 min delivery
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="landing-stats-bar">
        <div className="landing-stat-item">
          <div className="landing-stat-number">500+</div>
          <div className="landing-stat-label">Restaurants</div>
        </div>
        <div className="landing-stat-divider"></div>
        <div className="landing-stat-item">
          <div className="landing-stat-number">10K+</div>
          <div className="landing-stat-label">Customers</div>
        </div>
        <div className="landing-stat-divider"></div>
        <div className="landing-stat-item">
          <div className="landing-stat-number">50+</div>
          <div className="landing-stat-label">Cities</div>
        </div>
        <div className="landing-stat-divider"></div>
        <div className="landing-stat-item">
          <div className="landing-stat-number">4.9★</div>
          <div className="landing-stat-label">Avg Rating</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features-v2">
        <div className="landing-section-header">
          <h2>Why Choose <span className="landing-gradient-text">Fast Way</span>?</h2>
          <p>We make food ordering simple, fast and delightful</p>
        </div>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon-v2" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff8c42)' }}>
              <FiZap size={24} />
            </div>
            <h3>Lightning Fast</h3>
            <p>Get your food delivered in as fast as 20 minutes with our optimized delivery network.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon-v2" style={{ background: 'linear-gradient(135deg, #4ecdc4, #44a08d)' }}>
              <FiMapPin size={24} />
            </div>
            <h3>Live Tracking</h3>
            <p>Track your order in real-time from the restaurant kitchen to your doorstep.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon-v2" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}>
              <FiStar size={24} />
            </div>
            <h3>Top Restaurants</h3>
            <p>Curated selection of the best-rated restaurants and dishes in your city.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon-v2" style={{ background: 'linear-gradient(135deg, #fd79a8, #e84393)' }}>
              <FiHeart size={24} />
            </div>
            <h3>Easy Cancellation</h3>
            <p>Cancel your order hassle-free before it's prepared. No questions asked.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon-v2" style={{ background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)' }}>
              <FiSmartphone size={24} />
            </div>
            <h3>Smart Profiles</h3>
            <p>Save your address and preferences for a faster, personalized ordering experience.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon-v2" style={{ background: 'linear-gradient(135deg, #55efc4, #00b894)' }}>
              <FiClock size={24} />
            </div>
            <h3>Order History</h3>
            <p>Access your complete order history, spending analytics and reorder favorites.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how-it-works">
        <div className="landing-section-header">
          <h2>How It <span className="landing-gradient-text">Works</span></h2>
          <p>Order your favorite food in 3 simple steps</p>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-number">1</div>
            <h3>Browse & Choose</h3>
            <p>Explore restaurants, search by city or cuisine, and pick your favorite dishes.</p>
          </div>
          <div className="landing-step-arrow">→</div>
          <div className="landing-step">
            <div className="landing-step-number">2</div>
            <h3>Place Order</h3>
            <p>Add items to cart, confirm your address (auto-filled from profile!) and place order.</p>
          </div>
          <div className="landing-step-arrow">→</div>
          <div className="landing-step">
            <div className="landing-step-number">3</div>
            <h3>Enjoy!</h3>
            <p>Track your delivery in real-time and enjoy your delicious meal at home.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <h2>Ready to Order?</h2>
          <p>Join thousands of happy customers who trust Fast Way for their daily meals.</p>
          <div className="landing-hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="landing-btn-primary">
              Create Free Account <FiArrowRight />
            </Link>
            <Link to="/login" className="landing-btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">🚀</span>
            <span className="landing-logo-text">Fast Way</span>
          </div>
          <p className="landing-footer-text">© 2024 Fast Way. Delivering happiness, one meal at a time.</p>
        </div>
      </footer>
    </div>
  );
}
