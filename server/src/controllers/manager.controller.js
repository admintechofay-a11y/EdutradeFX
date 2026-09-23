const Manager = require('../models/Manager');

// @desc    Get all account managers and signal providers
// @route   GET /api/managers
// @access  Public
exports.getAllManagers = async (req, res) => {
  try {
    const {
      category,
      tradingStyle,
      pricingModel,
      minWinRate,
      maxDrawdown,
      featured,
      search,
      sortBy = 'winRate',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { status: 'active' };

    if (category) {
      query.category = { $in: [category, 'both'] };
    }

    if (tradingStyle) {
      query.tradingStyle = tradingStyle;
    }

    if (pricingModel) {
      query.pricingModel = pricingModel;
    }

    if (minWinRate) {
      query.winRate = { $gte: Number(minWinRate) };
    }

    if (maxDrawdown) {
      query.maxDrawdown = { $lte: Number(maxDrawdown) };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj = {};
    if (sortBy === 'winRate') sortObj.winRate = order === 'asc' ? 1 : -1;
    else if (sortBy === 'monthlyRoi') sortObj.monthlyRoi = order === 'asc' ? 1 : -1;
    else if (sortBy === 'maxDrawdown') sortObj.maxDrawdown = order === 'asc' ? 1 : -1;
    else if (sortBy === 'totalPips') sortObj.totalPips = order === 'asc' ? 1 : -1;
    else sortObj.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Manager.countDocuments(query);
    const managers = await Manager.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: managers.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: managers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single manager by ID
// @route   GET /api/managers/:id
// @access  Public
exports.getManagerById = async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager / Signal Provider not found' });
    }

    res.status(200).json({
      success: true,
      data: manager,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create / Submit new manager profile
// @route   POST /api/managers
// @access  Private
exports.createManager = async (req, res) => {
  try {
    // If not admin, set status to pending_approval
    const status = req.user && req.user.role === 'admin' ? 'active' : 'pending_approval';

    const manager = await Manager.create({
      ...req.body,
      status,
    });

    res.status(201).json({
      success: true,
      data: manager,
      message: status === 'pending_approval' ? 'Profile submitted for admin verification' : 'Manager profile created',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update manager profile (Admin)
// @route   PUT /api/managers/:id
// @access  Private/Admin
exports.updateManager = async (req, res) => {
  try {
    const manager = await Manager.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    res.status(200).json({ success: true, data: manager });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete manager (Admin)
// @route   DELETE /api/managers/:id
// @access  Private/Admin
exports.deleteManager = async (req, res) => {
  try {
    const manager = await Manager.findByIdAndDelete(req.params.id);

    if (!manager) {
      return res.status(404).json({ success: false, message: 'Manager not found' });
    }

    res.status(200).json({ success: true, message: 'Manager deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
