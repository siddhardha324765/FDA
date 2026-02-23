const express = require('express');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get dishes by category (with optional city filter)
router.get('/by-category', async (req, res) => {
  try {
    const { category, city } = req.query;
    const filter = { available: true };
    if (category) filter.category = category;

    let dishes;
    if (city) {
      // Find restaurants in that city first
      const cityRestaurants = await Restaurant.find({ city }).select('_id');
      const restaurantIds = cityRestaurants.map(r => r._id);
      filter.restaurant = { $in: restaurantIds };
    }

    dishes = await Dish.find(filter).populate('restaurant', 'name city image');
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dishes by restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const dishes = await Dish.find({ restaurant: req.params.restaurantId });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single dish
router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate('restaurant', 'name city');
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Add dish
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, available, restaurant } = req.body;

    // Verify ownership
    const rest = await Restaurant.findOne({ _id: restaurant, owner: req.user._id });
    if (!rest) {
      return res.status(403).json({ message: 'Not authorized for this restaurant' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const dish = new Dish({
      name,
      category,
      price: parseFloat(price),
      image,
      available: available !== 'false',
      restaurant
    });

    await dish.save();
    res.status(201).json(dish);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update dish
router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const rest = await Restaurant.findOne({ _id: dish.restaurant, owner: req.user._id });
    if (!rest) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, category, price, available } = req.body;
    if (name) dish.name = name;
    if (category) dish.category = category;
    if (price) dish.price = parseFloat(price);
    if (available !== undefined) dish.available = available !== 'false';
    if (req.file) dish.image = `/uploads/${req.file.filename}`;

    await dish.save();
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete dish
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    const rest = await Restaurant.findOne({ _id: dish.restaurant, owner: req.user._id });
    if (!rest) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Dish.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dish deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
