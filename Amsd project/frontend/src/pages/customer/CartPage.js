import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

export default function CartPage() {
  const { items, restaurant, totalPrice, fetchCart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  const handleIncrease = async (dishId, currentQty) => {
    try {
      await updateQuantity(dishId, currentQty + 1);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDecrease = async (dishId, currentQty) => {
    try {
      if (currentQty <= 1) {
        await removeItem(dishId);
        toast.info('Item removed from cart');
      } else {
        await updateQuantity(dishId, currentQty - 1);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRemove = async (dishId) => {
    try {
      await removeItem(dishId);
      toast.info('Item removed from cart');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.info('Cart cleared');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-content">
      <div className="container">
        <h2 className="fw-bold mb-4">🛒 Your Cart</h2>

        {items.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="text-muted mb-3">Your cart is empty</h4>
            <button className="btn btn-primary-custom" style={{ width: 'auto', padding: '10px 30px' }}
              onClick={() => navigate('/customer/home')}>
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              {restaurant && (
                <div className="mb-3 p-3 bg-white rounded-3 shadow-sm">
                  <small className="text-muted">From:</small>
                  <h5 className="fw-bold mb-0">{restaurant.name}</h5>
                </div>
              )}

              {items.map((item) => (
                <div key={item.dish || item._id} className="cart-item">
                  {item.image ? (
                    <img src={`http://localhost:5000${item.image}`} alt={item.name} />
                  ) : (
                    <div className="placeholder-img" style={{ width: 80, height: 80, borderRadius: 10, fontSize: '1.5rem' }}>
                      🍽️
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <span className="text-muted">₹{item.price} each</span>
                  </div>
                  <div className="quantity-controls">
                    <button onClick={() => handleDecrease(item.dish, item.quantity)}>
                      <FiMinus size={14} />
                    </button>
                    <span className="fw-bold mx-2">{item.quantity}</span>
                    <button onClick={() => handleIncrease(item.dish, item.quantity)}>
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <div className="text-end ms-3" style={{ minWidth: 70 }}>
                    <div className="fw-bold" style={{ color: '#ff6b35' }}>₹{item.price * item.quantity}</div>
                    <button
                      className="btn btn-sm text-danger p-0 mt-1"
                      onClick={() => handleRemove(item.dish)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button className="btn btn-outline-danger btn-sm mt-2" onClick={handleClear}>
                Clear Cart
              </button>
            </div>

            <div className="col-lg-4">
              <div className="bg-white rounded-4 p-4 shadow-sm" style={{ position: 'sticky', top: 90 }}>
                <h5 className="fw-bold mb-3">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery</span>
                  <span className="text-success">Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <h5 className="fw-bold">Total</h5>
                  <h5 className="fw-bold" style={{ color: '#ff6b35' }}>₹{totalPrice}</h5>
                </div>
                <button
                  className="btn-primary-custom"
                  onClick={() => navigate('/customer/order/place')}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
