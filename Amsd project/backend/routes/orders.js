const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const DeliveryBoy = require('../models/DeliveryBoy');
const { auth, adminOnly, customerOnly } = require('../middleware/auth');

const router = express.Router();

// Customer: Place order
router.post('/place', auth, customerOnly, async (req, res) => {
  try {
    const { deliveryAddress } = req.body;

    const cart = await Cart.findOne({ customer: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      customer: req.user._id,
      restaurant: cart.restaurant,
      items: cart.items.map(item => ({
        dish: item.dish,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount,
      deliveryAddress,
      paymentMethod: 'COD',
      status: 'Placed'
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndDelete({ customer: req.user._id });

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name city')
      .populate('customer', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Customer: Get my orders
router.get('/my', auth, customerOnly, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('restaurant', 'name city image allowCancellation')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Customer: Get single order
router.get('/my/:id', auth, customerOnly, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id })
      .populate('restaurant', 'name city image allowCancellation');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get orders for their restaurants
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const { status } = req.query;
    const filter = { restaurant: { $in: restaurantIds } };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('restaurant', 'name city')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update order status
router.put('/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id.toString());

    const order = await Order.findById(req.params.id);
    if (!order || !restaurantIds.includes(order.restaurant.toString())) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name city')
      .populate('customer', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Assign delivery boy
router.put('/:id/delivery-boy', auth, adminOnly, async (req, res) => {
  try {
    const { name, phone, deliveryBoyId } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Delivery boy name and phone are required' });
    }

    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id.toString());

    const order = await Order.findById(req.params.id);
    if (!order || !restaurantIds.includes(order.restaurant.toString())) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryBoy = { name, phone };
    if (deliveryBoyId) {
      order.assignedDeliveryBoy = deliveryBoyId;
    }
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name city')
      .populate('customer', 'name email')
      .populate('assignedDeliveryBoy', 'name phone city email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Customer: Cancel order
router.put('/:id/cancel', auth, customerOnly, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id })
      .populate('restaurant', 'name city allowCancellation');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if restaurant allows cancellation
    if (!order.restaurant.allowCancellation) {
      return res.status(400).json({ message: 'This restaurant does not allow order cancellation' });
    }

    // Only allow cancel if status is Placed
    if (order.status !== 'Placed') {
      return res.status(400).json({ message: 'Order can only be cancelled when status is Placed' });
    }

    order.status = 'Cancelled';
    await order.save();

    const populated = await Order.findById(order._id)
      .populate('restaurant', 'name city image allowCancellation')
      .populate('customer', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
