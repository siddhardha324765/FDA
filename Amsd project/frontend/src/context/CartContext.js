import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const CartContext = createContext();

const initialState = {
  items: [],
  restaurant: null,
  loading: false
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        restaurant: action.payload.restaurant || null,
        loading: false
      };
    case 'CLEAR_CART':
      return { ...initialState };
    case 'SET_LOADING':
      return { ...state, loading: true };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get(`${API}/cart`, getHeaders());
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch {
      dispatch({ type: 'SET_CART', payload: { items: [], restaurant: null } });
    }
  }, []);

  const addToCart = async (dish, restaurantId) => {
    try {
      const res = await axios.post(`${API}/cart/add`, {
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        restaurant: restaurantId
      }, getHeaders());
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = async (dishId, quantity) => {
    try {
      const res = await axios.put(`${API}/cart/update`, { dishId, quantity }, getHeaders());
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update cart');
    }
  };

  const removeItem = async (dishId) => {
    try {
      const res = await axios.delete(`${API}/cart/remove/${dishId}`, getHeaders());
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API}/cart/clear`, getHeaders());
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to clear cart');
    }
  };

  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      ...state, totalPrice, totalItems,
      fetchCart, addToCart, updateQuantity, removeItem, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
