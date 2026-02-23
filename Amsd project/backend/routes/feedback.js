const express = require('express');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { auth, adminOnly, customerOnly } = require('../middleware/auth');

const router = express.Router();

// Customer: Submit feedback
router.post('/', auth, customerOnly, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const existing = await Feedback.findOne({ order: orderId, customer: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Feedback already submitted for this order' });
    }

    const feedback = new Feedback({
      customer: req.user._id,
      restaurant: order.restaurant,
      order: orderId,
      rating,
      comment
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feedback for a restaurant (public)
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const feedback = await Feedback.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get feedback for own restaurants
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const feedback = await Feedback.find({ restaurant: { $in: restaurantIds } })
      .populate('customer', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
