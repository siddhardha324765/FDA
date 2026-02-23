const express = require('express');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Admin: Get dashboard stats
router.get('/dashboard', auth, adminOnly, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const orders = await Order.find({ restaurant: { $in: restaurantIds } });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    // Per-restaurant stats
    const restaurantStats = restaurants.map(r => {
      const rOrders = orders.filter(o => o.restaurant.toString() === r._id.toString());
      return {
        restaurant: { id: r._id, name: r.name, city: r.city, image: r.image },
        totalOrders: rOrders.length,
        revenue: rOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        pending: rOrders.filter(o => o.status !== 'Delivered').length,
        delivered: rOrders.filter(o => o.status === 'Delivered').length
      };
    });

    // Status breakdown
    const statusBreakdown = {
      Placed: orders.filter(o => o.status === 'Placed').length,
      Preparing: orders.filter(o => o.status === 'Preparing').length,
      Ready: orders.filter(o => o.status === 'Ready').length,
      'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length
    };

    res.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      totalRestaurants: restaurants.length,
      restaurantStats,
      statusBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get dashboard stats for a SINGLE restaurant
router.get('/dashboard/:restaurantId', auth, adminOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      owner: req.user._id
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    // Status breakdown
    const statusBreakdown = {
      Placed: orders.filter(o => o.status === 'Placed').length,
      Preparing: orders.filter(o => o.status === 'Preparing').length,
      Ready: orders.filter(o => o.status === 'Ready').length,
      'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length
    };

    // Daily orders for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      const dayOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d <= dayEnd;
      });
      last7Days.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      });
    }

    // Recent orders (last 10)
    const recentOrders = orders.slice(0, 10).map(o => ({
      _id: o._id,
      customer: o.customer,
      totalAmount: o.totalAmount,
      status: o.status,
      items: o.items,
      createdAt: o.createdAt
    }));

    res.json({
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        city: restaurant.city,
        image: restaurant.image,
        description: restaurant.description
      },
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      statusBreakdown,
      last7Days,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
