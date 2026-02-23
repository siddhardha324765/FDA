import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_LOADED':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, user: null, token: null, loading: false, error: action.payload || null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, loading: true };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'AUTH_ERROR' });
      return;
    }
    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch({ type: 'AUTH_LOADED', payload: res.data.user });
    } catch {
      // Try delivery boy auth
      try {
        const res = await axios.get(`${API}/delivery/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch({ type: 'AUTH_LOADED', payload: res.data.user });
      } catch {
        dispatch({ type: 'AUTH_ERROR' });
      }
    }
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, role = 'customer') => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await axios.post(`${API}/auth/register`, { name, email, password, role });
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const deliveryLogin = async (email, password) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await axios.post(`${API}/delivery/auth/login`, { email, password });
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const deliveryRegister = async (name, email, password, phone, city) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await axios.post(`${API}/delivery/auth/register`, { name, email, password, phone, city });
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, deliveryLogin, deliveryRegister, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
