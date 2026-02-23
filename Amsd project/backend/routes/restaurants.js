const express = require('express');
const Restaurant = require('../models/Restaurant');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all restaurants (public) — includes average rating
router.get('/', async (req, res) => {
  try {
    const Feedback = require('../models/Feedback');
    const { city } = req.query;
    const filter = city ? { city: new RegExp(city, 'i') } : {};
    const restaurants = await Restaurant.find(filter).populate('owner', 'name email');

    // Attach average rating for each restaurant
    const restaurantIds = restaurants.map(r => r._id);
    const ratings = await Feedback.aggregate([
      { $match: { restaurant: { $in: restaurantIds } } },
      { $group: { _id: '$restaurant', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const ratingMap = {};
    ratings.forEach(r => { ratingMap[r._id.toString()] = { avgRating: Math.round(r.avgRating * 10) / 10, count: r.count }; });

    const result = restaurants.map(r => {
      const obj = r.toObject();
      const rm = ratingMap[r._id.toString()];
      obj.avgRating = rm ? rm.avgRating : 0;
      obj.ratingCount = rm ? rm.count : 0;
      return obj;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all cities (distinct) - MUST be before /:id
router.get('/meta/cities', async (req, res) => {
  try {
    const cities = await Restaurant.distinct('city');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Get own restaurants - MUST be before /:id
router.get('/admin/my', auth, adminOnly, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single restaurant — includes average rating
router.get('/:id', async (req, res) => {
  try {
    const Feedback = require('../models/Feedback');
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    const ratingAgg = await Feedback.aggregate([
      { $match: { restaurant: restaurant._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const obj = restaurant.toObject();
    obj.avgRating = ratingAgg.length ? Math.round(ratingAgg[0].avgRating * 10) / 10 : 0;
    obj.ratingCount = ratingAgg.length ? ratingAgg[0].count : 0;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Create restaurant
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, city, description, allowCancellation } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const restaurant = new Restaurant({
      name,
      city,
      description,
      image,
      owner: req.user._id,
      allowCancellation: allowCancellation === 'false' ? false : true
    });

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Update restaurant
router.put('/:id', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, city, description, allowCancellation } = req.body;
    const update = { name, city, description };
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }
    if (allowCancellation !== undefined) {
      update.allowCancellation = allowCancellation === 'false' ? false : true;
    }

    const restaurant = await Restaurant.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      update,
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin: Delete restaurant
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
