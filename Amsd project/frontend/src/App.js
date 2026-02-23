import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages
import LandingPage from './pages/LandingPage';
import CustomerLogin from './pages/auth/CustomerLogin';
import CustomerRegister from './pages/auth/CustomerRegister';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import DeliveryLogin from './pages/auth/DeliveryLogin';
import DeliveryRegister from './pages/auth/DeliveryRegister';
import CustomerHome from './pages/customer/CustomerHome';
import RestaurantMenu from './pages/customer/RestaurantMenu';
import CartPage from './pages/customer/CartPage';
import OrderPlacement from './pages/customer/OrderPlacement';
import MyOrders from './pages/customer/MyOrders';
import OrderDetail from './pages/customer/OrderDetail';
import RestaurantReviews from './pages/customer/RestaurantReviews';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageRestaurants from './pages/admin/ManageRestaurants';
import ManageDishes from './pages/admin/ManageDishes';
import AdminOrders from './pages/admin/AdminOrders';
import AdminFeedback from './pages/admin/AdminFeedback';
import RestaurantDashboard from './pages/admin/RestaurantDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrders from './pages/delivery/DeliveryOrders';
import DeliveryOrderDetail from './pages/delivery/DeliveryOrderDetail';

// Components
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) {
    if (user.role === 'delivery') return <Navigate to="/delivery/dashboard" />;
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/customer/home'} />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><CustomerLogin /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><CustomerRegister /></PublicRoute>} />
        <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route path="/admin/register" element={<PublicRoute><AdminRegister /></PublicRoute>} />
        <Route path="/delivery/login" element={<PublicRoute><DeliveryLogin /></PublicRoute>} />
        <Route path="/delivery/register" element={<PublicRoute><DeliveryRegister /></PublicRoute>} />

        {/* Customer Routes */}
        <Route path="/customer/home" element={<ProtectedRoute role="customer"><CustomerHome /></ProtectedRoute>} />
        <Route path="/customer/restaurant/:id" element={<ProtectedRoute role="customer"><RestaurantMenu /></ProtectedRoute>} />
        <Route path="/customer/cart" element={<ProtectedRoute role="customer"><CartPage /></ProtectedRoute>} />
        <Route path="/customer/order/place" element={<ProtectedRoute role="customer"><OrderPlacement /></ProtectedRoute>} />
        <Route path="/customer/orders" element={<ProtectedRoute role="customer"><MyOrders /></ProtectedRoute>} />
        <Route path="/customer/order/:id" element={<ProtectedRoute role="customer"><OrderDetail /></ProtectedRoute>} />
        <Route path="/customer/reviews/:restaurantId" element={<ProtectedRoute role="customer"><RestaurantReviews /></ProtectedRoute>} />
        <Route path="/customer/profile" element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />
        <Route path="/customer/dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/restaurants" element={<ProtectedRoute role="admin"><ManageRestaurants /></ProtectedRoute>} />
        <Route path="/admin/dishes/:restaurantId" element={<ProtectedRoute role="admin"><ManageDishes /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/feedback" element={<ProtectedRoute role="admin"><AdminFeedback /></ProtectedRoute>} />
        <Route path="/admin/restaurant-dashboard/:restaurantId" element={<ProtectedRoute role="admin"><RestaurantDashboard /></ProtectedRoute>} />

        {/* Delivery Routes */}
        <Route path="/delivery/dashboard" element={<ProtectedRoute role="delivery"><DeliveryDashboard /></ProtectedRoute>} />
        <Route path="/delivery/orders" element={<ProtectedRoute role="delivery"><DeliveryOrders /></ProtectedRoute>} />
        <Route path="/delivery/order/:id" element={<ProtectedRoute role="delivery"><DeliveryOrderDetail /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
