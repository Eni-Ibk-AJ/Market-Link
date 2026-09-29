const User = require('../model/userSchema');
const Product = require('../model/productSchema');
const Market = require('../model/marketSchema');
const Order = require('../model/orderSchema');

// 1. Get Admin Dashboard Analytics
exports.getAdminDashboard = async (req, res) => {
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
    res.status(500).json({
      message: 'Error fetching admin dashboard analytics',
      error: error.message
    });
  }
};

// 2. Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, verified } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (status && ['pending', 'active', 'suspended'].includes(status)) {
      filter.status = status;
    }

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// 3. Update User Status / Role
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isVerified, verified, status } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (role) {
      user.role = role;
    }

    if (status && ['pending', 'active', 'suspended'].includes(status)) {
      user.status = status;
    }

    if (typeof isVerified === 'boolean') {
      user.isVerified = isVerified;
    }

    if (typeof verified === 'boolean') {
      user.verified = verified;
    }

    await user.save();

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
    res.status(500).json({
      message: 'Error updating user profile',
      error: error.message
    });
  }
};

// 4. Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message
    });
  }
};