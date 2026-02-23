const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  },
  items: [{
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true
    },
    name: String,
    price: Number,
    image: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
