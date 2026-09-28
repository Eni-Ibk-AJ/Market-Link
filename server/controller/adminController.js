const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Market = require('../model/marketSchema');
const Order = require('../model/orderSchema');
<<<<<<< HEAD
// Get high-level platform analytics for admin dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalMarkets = await Market.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalFarmers,
        totalCustomers,
        totalMarkets,
        totalProducts,
        totalOrders,
        totalRevenue: completedOrders[0]?.totalRevenue || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin dashboard analytics', error: error.message });
  }
};

// Get all registered users (supports filtering by role)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users list', error: error.message });
  }
};

// Update user status or role (e.g., suspend or upgrade user)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, verified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
=======
const express = require('express');

module.exports = function (app) {
  // 1. Get Admin Dashboard Analytics
  app.get('/api/admin/dashboard', async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalFarmers = await User.countDocuments({ role: 'farmer' });
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const totalMarkets = await Market.countDocuments();
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalFarmers,
          totalCustomers,
          totalMarkets,
          totalProducts,
          totalOrders
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching admin dashboard analytics', error: error.message });
>>>>>>> f0f338475f6dca0050fb276415fa4de8c66b3ba1
    }
  });

<<<<<<< HEAD
    if (role) user.role = role;
    if (status && ['pending', 'active', 'suspended'].includes(status)) user.status = status;
    if (typeof verified === 'boolean') user.verified = verified;
=======
  // 2. Get All Users
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { role } = req.query;
      const filter = role ? { role } : {};
>>>>>>> f0f338475f6dca0050fb276415fa4de8c66b3ba1

      const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

<<<<<<< HEAD
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        verified: user.verified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

// Delete a user from the platform
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
=======
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users list', error: error.message });
>>>>>>> f0f338475f6dca0050fb276415fa4de8c66b3ba1
    }
  });

  // 3. Update User Status / Role
  app.put('/api/admin/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { role, isVerified } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (role) user.role = role;
      if (typeof isVerified === 'boolean') user.isVerified = isVerified;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile', error: error.message });
    }
  });

  // 4. Delete User
  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  });
};