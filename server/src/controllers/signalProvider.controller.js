const { SignalProvider, Signal, Review, ContactEnquiry, AuditLog } = require('../models');

// @desc    Get all signal providers (public: approved only)
// @route   GET /api/signal-providers
// @access  Public
exports.getSignalProviders = async (req, res) => {
  try {
    const {
      search,
      market,
      approvalStatus,
      status = 'active',
      isFeatured,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    } else {
      query.approvalStatus = 'approved';
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { strategy: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (market) {
      query.markets = { $in: [new RegExp(market, 'i')] };
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await SignalProvider.countDocuments(query);
    const providers = await SignalProvider.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: providers.length,
      total,
      data: providers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single signal provider by ID
// @route   GET /api/signal-providers/:id
// @access  Public
exports.getSignalProviderById = async (req, res) => {
  try {
    const provider = await SignalProvider.findById(req.params.id).lean();

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Signal provider not found' });
    }

    // Attach recent public signals if active
    const recentSignals = await Signal.find({
      provider: provider._id,
      status: { $in: ['active', 'closed'] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...provider,
        signals: recentSignals,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// SIGNAL PROVIDER SELF-SERVICE CONTROLLERS (role = 'signal_provider')
// -------------------------------------------------------------

// @desc    Get logged in signal provider's profile
// @route   GET /api/signal-providers/me/profile
// @access  Private (Signal Provider)
exports.getMySignalProviderProfile = async (req, res) => {
  try {
    let provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      provider = await SignalProvider.create({
        user: req.user._id,
        name: `${req.user.name} Signals`,
        strategy: 'Price Action & Breakout Momentum',
        contactEmail: req.user.email,
        description: 'Verified FX trade signals with systematic risk control and high win-rate setups.',
        approvalStatus: 'pending',
        status: 'active',
      });
    }

    // Calculate real stats from signals
    const signals = await Signal.find({ provider: provider._id });
    const closedSignals = signals.filter((s) => s.status === 'closed');
    const winningSignals = closedSignals.filter((s) => s.result === 'profit');
    const winRate = closedSignals.length > 0
      ? Math.round((winningSignals.length / closedSignals.length) * 100 * 10) / 10
      : (provider.historicalPerformance?.winRate || 78.5);
    const totalPips = closedSignals.reduce((acc, s) => acc + (s.resultPips || 0), 0);

    const providerObj = provider.toObject();
    providerObj.liveStats = {
      totalSignals: signals.length,
      activeSignals: signals.filter((s) => s.status === 'active').length,
      closedSignals: closedSignals.length,
      winRate,
      totalPips,
    };

    res.status(200).json({
      success: true,
      data: providerObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update logged in signal provider's profile
// @route   PUT /api/signal-providers/me/profile
// @access  Private (Signal Provider)
exports.updateMySignalProviderProfile = async (req, res) => {
  try {
    let provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Signal provider profile not found' });
    }

    const updates = { ...req.body };
    delete updates.approvalStatus;
    delete updates.rejectionReason;
    delete updates.user;

    provider = await SignalProvider.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Signal provider profile updated successfully',
      data: provider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit signal provider for admin approval
// @route   POST /api/signal-providers/me/submit
// @access  Private (Signal Provider)
exports.submitMySignalProviderForApproval = async (req, res) => {
  try {
    const provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    provider.approvalStatus = 'pending';
    provider.rejectionReason = '';
    await provider.save();

    res.status(200).json({
      success: true,
      message: 'Signal provider profile submitted for administrator verification',
      data: provider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all signals posted by logged in provider
// @route   GET /api/signal-providers/me/signals
// @access  Private (Signal Provider)
exports.getMySignals = async (req, res) => {
  try {
    const provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const signals = await Signal.find({ provider: provider._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: signals.length,
      data: signals,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Post a new trading signal
// @route   POST /api/signal-providers/me/signals
// @access  Private (Signal Provider)
exports.createMySignal = async (req, res) => {
  try {
    const { pair, type, timeframe, entryPrice, stopLoss, takeProfit1, takeProfit2, notes } = req.body;

    if (!pair || !type || !entryPrice || !stopLoss || !takeProfit1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide pair, type (BUY/SELL), entryPrice, stopLoss, and takeProfit1',
      });
    }

    let provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      provider = await SignalProvider.create({
        user: req.user._id,
        name: `${req.user.name} Signals`,
        strategy: 'Price Action & Breakout Momentum',
        contactEmail: req.user.email,
        description: 'Verified FX trade signals.',
        approvalStatus: 'pending',
      });
    }

    const signal = await Signal.create({
      provider: provider._id,
      user: req.user._id,
      pair: pair.toUpperCase().trim(),
      type: type.toUpperCase(),
      timeframe: timeframe || 'H1',
      entryPrice: Number(entryPrice),
      stopLoss: Number(stopLoss),
      takeProfit1: Number(takeProfit1),
      takeProfit2: takeProfit2 ? Number(takeProfit2) : undefined,
      notes: notes || '',
      status: 'active',
      result: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Trading signal published successfully',
      data: signal,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update or close a trading signal
// @route   PUT /api/signal-providers/me/signals/:id
// @access  Private (Signal Provider)
exports.updateMySignal = async (req, res) => {
  try {
    const signal = await Signal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!signal) {
      return res.status(404).json({ success: false, message: 'Signal not found or not owned by you' });
    }

    const { status, result, resultPips, closedPrice, notes, stopLoss, takeProfit1 } = req.body;

    if (status !== undefined) signal.status = status;
    if (result !== undefined) signal.result = result;
    if (resultPips !== undefined) signal.resultPips = Number(resultPips);
    if (closedPrice !== undefined) signal.closedPrice = Number(closedPrice);
    if (notes !== undefined) signal.notes = notes;
    if (stopLoss !== undefined) signal.stopLoss = Number(stopLoss);
    if (takeProfit1 !== undefined) signal.takeProfit1 = Number(takeProfit1);

    if (status === 'closed' && !signal.closedAt) {
      signal.closedAt = new Date();
    }

    await signal.save();

    res.status(200).json({
      success: true,
      message: 'Signal updated successfully',
      data: signal,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a trading signal
// @route   DELETE /api/signal-providers/me/signals/:id
// @access  Private (Signal Provider)
exports.deleteMySignal = async (req, res) => {
  try {
    const signal = await Signal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!signal) {
      return res.status(404).json({ success: false, message: 'Signal not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Signal deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get subscribers / lead enquiries for this signal provider
// @route   GET /api/signal-providers/me/subscribers
// @access  Private (Signal Provider)
exports.getMySubscribers = async (req, res) => {
  try {
    const provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const inquiries = await ContactEnquiry.find({
      targetType: 'signal_provider',
      targetId: provider._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get reviews for this signal provider
// @route   GET /api/signal-providers/me/reviews
// @access  Private (Signal Provider)
exports.getMyReviews = async (req, res) => {
  try {
    const provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const reviews = await Review.find({
      targetType: 'signalProvider',
      targetId: provider._id,
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reply to a signal provider review
// @route   POST /api/signal-providers/me/reviews/:id/reply
// @access  Private (Signal Provider)
exports.replyMyReview = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Reply comment is required' });
    }

    const provider = await SignalProvider.findOne({ user: req.user._id });
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider profile not found' });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      targetType: 'signalProvider',
      targetId: provider._id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found for this provider' });
    }

    review.reply = {
      comment,
      repliedAt: new Date(),
      authorRole: 'signal_provider',
      authorName: provider.name,
    };
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Official response posted to review',
      data: review,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// ADMIN SIGNAL PROVIDER MANAGEMENT (role = 'admin')
// -------------------------------------------------------------

// @desc    Admin: get all signal providers
// @route   GET /api/signal-providers/admin/all
// @access  Private (Admin)
exports.getAdminSignalProviders = async (req, res) => {
  try {
    const { approvalStatus, search } = req.query;
    const query = {};

    if (approvalStatus && approvalStatus !== 'all') {
      query.approvalStatus = approvalStatus;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { strategy: { $regex: search, $options: 'i' } },
      ];
    }

    const providers = await SignalProvider.find(query)
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: approve, reject, or suspend a signal provider
// @route   PATCH /api/signal-providers/admin/:id/approval
// @access  Private (Admin)
exports.updateSignalProviderApproval = async (req, res) => {
  try {
    const { approvalStatus, rejectionReason } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status. Must be pending, approved, rejected, or suspended.',
      });
    }

    const provider = await SignalProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Signal provider not found' });
    }

    provider.approvalStatus = approvalStatus;
    if (rejectionReason !== undefined) {
      provider.rejectionReason = rejectionReason;
    }
    await provider.save();

    await AuditLog.create({
      action: approvalStatus === 'approved' ? 'approve' : approvalStatus === 'rejected' ? 'reject' : 'suspend',
      module: 'signal_provider',
      targetId: provider._id.toString(),
      targetName: provider.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: `Status set to ${approvalStatus}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Signal provider listing has been ${approvalStatus}`,
      data: provider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: create signal provider
// @route   POST /api/signal-providers
// @access  Private (Admin)
exports.createSignalProvider = async (req, res) => {
  try {
    const provider = await SignalProvider.create({
      ...req.body,
      approvalStatus: 'approved',
    });

    await AuditLog.create({
      action: 'edit',
      module: 'signal_provider',
      targetId: provider._id.toString(),
      targetName: provider.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: 'Created signal provider directly from admin panel',
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Signal provider created successfully',
      data: provider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: update signal provider
// @route   PUT /api/signal-providers/:id
// @access  Private (Admin)
exports.updateSignalProvider = async (req, res) => {
  try {
    const provider = await SignalProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Signal provider not found' });
    }

    await AuditLog.create({
      action: 'edit',
      module: 'signal_provider',
      targetId: provider._id.toString(),
      targetName: provider.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: 'Updated signal provider from admin panel',
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Signal provider updated successfully',
      data: provider,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: delete signal provider
// @route   DELETE /api/signal-providers/:id
// @access  Private (Admin)
exports.deleteSignalProvider = async (req, res) => {
  try {
    const provider = await SignalProvider.findByIdAndDelete(req.params.id);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Signal provider not found' });
    }

    // Cascade delete associated reviews and signals
    await Promise.all([
      Review.deleteMany({ targetType: 'signalProvider', targetId: req.params.id }),
      Signal.deleteMany({ provider: req.params.id }),
    ]);

    await AuditLog.create({
      action: 'delete',
      module: 'signal_provider',
      targetId: provider._id.toString(),
      targetName: provider.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: 'Permanently deleted signal provider, signals, and associated reviews',
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Signal provider and associated signals deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
