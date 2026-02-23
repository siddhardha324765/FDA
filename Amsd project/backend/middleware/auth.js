const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeliveryBoy = require('../models/DeliveryBoy');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isDelivery) {
      const boy = await DeliveryBoy.findById(decoded.id).select('-password');
      if (!boy) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      req.user = boy;
      req.user.role = 'delivery';
      return next();
    }
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const customerOnly = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Customer only.' });
  }
  next();
};

module.exports = { auth, adminOnly, customerOnly };
