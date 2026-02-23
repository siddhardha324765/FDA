const express = require('express');
const jwt = require('jsonwebtoken');
const DeliveryBoy = require('../models/DeliveryBoy');
const Order = require('../models/Order');

const router = express.Router();

// Middleware: authenticate delivery boy
const deliveryAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isDelivery) {
      return res.status(401).json({ message: 'Not a delivery boy token' });
    }
    const boy = await DeliveryBoy.findById(decoded.id).select('-password');
    if (!boy) {
      return res.status(401).json({ message: 'Delivery boy not found' });
    }
    req.deliveryBoy = boy;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get assigned orders for delivery boy
router.get('/my-orders', deliveryAuth, async (req, res) => {
  try {
    const orders = await Order.find({ assignedDeliveryBoy: req.deliveryBoy._id })
      .populate('restaurant', 'name city image')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get delivery boy dashboard stats
router.get('/stats', deliveryAuth, async (req, res) => {
  try {
    const orders = await Order.find({ assignedDeliveryBoy: req.deliveryBoy._id });
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const pendingOrders = orders.filter(o => o.status !== 'Delivered').length;
    const totalEarnings = orders.filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + (o.totalAmount * 0.1), 0); // 10% delivery commission

    const statusBreakdown = {
      Placed: orders.filter(o => o.status === 'Placed').length,
      Preparing: orders.filter(o => o.status === 'Preparing').length,
      'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
      Ready: orders.filter(o => o.status === 'Ready').length,
      Delivered: orders.filter(o => o.status === 'Delivered').length
    };

    res.json({
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalEarnings: Math.round(totalEarnings),
      city: req.deliveryBoy.city,
      statusBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status by delivery boy (can mark as "Out for Delivery" or "Delivered")
router.put('/order/:id/status', deliveryAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Out for Delivery', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Delivery boy can only set Out for Delivery or Delivered' });
    }

    const order = await Order.findOne({ _id: req.params.id, assignedDeliveryBoy: req.deliveryBoy._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name city image')
      .populate('customer', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle availability
router.put('/toggle-availability', deliveryAuth, async (req, res) => {
  try {
    const boy = await DeliveryBoy.findById(req.deliveryBoy._id);
    boy.available = !boy.available;
    await boy.save();
    res.json({ available: boy.available });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available delivery boys by city (used by admin)
router.get('/available', async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { available: true };
    if (city) filter.city = { $regex: new RegExp(city, 'i') };
    const boys = await DeliveryBoy.find(filter).select('-password');
    res.json(boys);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
