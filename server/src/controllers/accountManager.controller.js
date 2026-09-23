const { AccountManager, Review } = require('../models');

// @desc    Get all account managers
// @route   GET /api/account-managers
// @access  Public
exports.getAccountManagers = async (req, res) => {
  try {
    const {
      search,
      tradingStyle,
      status = 'active',
      isFeatured,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { strategy: { $regex: search, $options: 'i' } },
      ];
    }

    if (tradingStyle) {
      query.tradingStyle = tradingStyle;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AccountManager.countDocuments(query);
    const managers = await AccountManager.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: managers.length,
      total,
      data: managers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single account manager by ID
// @route   GET /api/account-managers/:id
// @access  Public
exports.getAccountManagerById = async (req, res) => {
  try {
    const manager = await AccountManager.findById(req.params.id).lean();

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Account manager not found' });
    }

    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create account manager
// @route   POST /api/account-managers
// @access  Private (Admin)
exports.createAccountManager = async (req, res) => {
  try {
    const manager = await AccountManager.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Account manager created successfully',
      data: manager,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update account manager
// @route   PUT /api/account-managers/:id
// @access  Private (Admin)
exports.updateAccountManager = async (req, res) => {
  try {
    const manager = await AccountManager.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Account manager not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Account manager updated successfully',
      data: manager,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete account manager
// @route   DELETE /api/account-managers/:id
// @access  Private (Admin)
exports.deleteAccountManager = async (req, res) => {
  try {
    const manager = await AccountManager.findByIdAndDelete(req.params.id);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Account manager not found' });
    }

    // Cascade delete associated reviews
    await Review.deleteMany({ targetType: 'accountManager', targetId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Account manager and associated reviews deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
