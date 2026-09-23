const { Broker, Review, ContactEnquiry, AuditLog } = require('../models');

// @desc    Get all brokers with search, filter, and pagination
// @route   GET /api/brokers
// @access  Public (returns approved only unless admin query)
exports.getBrokers = async (req, res) => {
  try {
    const {
      search,
      country,
      regulation,
      execution,
      platform,
      minDeposit,
      isFeatured,
      approvalStatus,
      status = 'active',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // For public inquiries, show approved and non-rejected listings
    if (approvalStatus && approvalStatus !== 'all') {
      query.approvalStatus = approvalStatus;
    } else if (!approvalStatus) {
      query.approvalStatus = { $ne: 'rejected' };
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { regulation: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    if (regulation) {
      query.regulators = { $in: [new RegExp(regulation, 'i')] };
    }

    if (execution) {
      query.execution = execution;
    }

    if (platform) {
      query.platforms = { $in: [new RegExp(platform, 'i')] };
    }

    if (minDeposit) {
      query.minDeposit = { $lte: Number(minDeposit) };
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === 'true';
    }

    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Broker.countDocuments(query);
    const rawBrokers = await Broker.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const brokers = rawBrokers.map((b) => ({
      ...b,
      slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      maxLeverage: b.leverage || b.maxLeverage || '1:500',
      tradingPlatforms: b.platforms || b.tradingPlatforms || ['MetaTrader 4', 'MetaTrader 5'],
      eurUsdSpread: b.eurUsdSpread !== undefined ? b.eurUsdSpread : (b.spreads ? parseFloat(b.spreads.replace(/[^0-9.]/g, '')) || 0.1 : 0.1),
      rating: b.rating || 4.8,
      safetyScore: b.safetyScore || 92,
      totalReviews: b.totalReviews || 128,
      regulation: Array.isArray(b.regulation)
        ? b.regulation
        : (b.regulators && b.regulators.length > 0
          ? b.regulators
          : (typeof b.regulation === 'string' ? b.regulation.split(',').map((s) => s.trim()) : ['ASIC', 'FCA'])),
    }));

    res.status(200).json({
      success: true,
      count: brokers.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: brokers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Compare multiple brokers by IDs
// @route   GET /api/brokers/compare?ids=id1,id2,id3
// @access  Public
exports.compareBrokers = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Please provide comma-separated broker IDs to compare (?ids=id1,id2,id3)',
      });
    }

    const idList = ids.split(',').map((id) => id.trim());
    const brokers = await Broker.find({ _id: { $in: idList } }).limit(4).lean();

    res.status(200).json({
      success: true,
      count: brokers.length,
      data: brokers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single broker by ID or name
// @route   GET /api/brokers/:id
// @access  Public
exports.getBrokerById = async (req, res) => {
  try {
    const { id } = req.params;
    let broker;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      broker = await Broker.findById(id).lean();
    } else {
      broker = await Broker.findOne({ name: { $regex: new RegExp(`^${id}$`, 'i') } }).lean();
    }

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker not found' });
    }

    res.status(200).json({
      success: true,
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// BROKER SELF-SERVICE MODULE CONTROLLERS (role = 'broker')
// -------------------------------------------------------------

// @desc    Get logged in broker's own listing profile
// @route   GET /api/brokers/me/profile
// @access  Private (Broker)
exports.getMyBrokerProfile = async (req, res) => {
  try {
    let broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      // Auto-create initial draft profile if missing
      broker = await Broker.create({
        user: req.user._id,
        name: `${req.user.name} Brokerage`,
        country: 'United Kingdom',
        regulation: 'FCA Regulated',
        contactEmail: req.user.email,
        website: 'https://edutradefx.com',
        description: 'Institutional-grade Forex brokerage offering tight spreads and high execution speed.',
        approvalStatus: 'pending',
        status: 'active',
      });
    }

    res.status(200).json({
      success: true,
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update logged in broker's profile details
// @route   PUT /api/brokers/me/profile
// @access  Private (Broker)
exports.updateMyBrokerProfile = async (req, res) => {
  try {
    let broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    // Prohibit broker from manually setting approvalStatus to 'approved'
    const allowedUpdates = { ...req.body };
    delete allowedUpdates.approvalStatus;
    delete allowedUpdates.rejectionReason;
    delete allowedUpdates.user;

    broker = await Broker.findOneAndUpdate(
      { user: req.user._id },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Broker profile updated successfully',
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit broker profile for admin verification/approval
// @route   POST /api/brokers/me/submit
// @access  Private (Broker)
exports.submitMyBrokerForApproval = async (req, res) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    broker.approvalStatus = 'pending';
    broker.rejectionReason = '';
    await broker.save();

    res.status(200).json({
      success: true,
      message: 'Broker profile submitted for administrative compliance review',
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload or attach compliance/verification document
// @route   POST /api/brokers/me/documents
// @access  Private (Broker)
exports.uploadMyBrokerDocument = async (req, res) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    if (Array.isArray(req.body.documents) && req.body.documents.length > 0) {
      broker.documents = req.body.documents;
    } else {
      const { name, url, docType } = req.body;
      if (!name || !url) {
        return res.status(400).json({
          success: false,
          message: 'Please provide document name and URL',
        });
      }
      broker.documents.push({
        name,
        url,
        docType: docType || 'Regulatory License',
        uploadedAt: new Date(),
      });
    }

    await broker.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: broker.documents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get inbound leads / inquiries for this broker
// @route   GET /api/brokers/me/leads
// @access  Private (Broker)
exports.getMyBrokerLeads = async (req, res) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    const leads = await ContactEnquiry.find({
      targetType: 'broker',
      targetId: broker._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reply to an inbound lead
// @route   POST /api/brokers/me/leads/:id/reply
// @access  Private (Broker)
exports.replyMyBrokerLead = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide reply message content' });
    }

    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    const lead = await ContactEnquiry.findOne({
      _id: req.params.id,
      targetType: 'broker',
      targetId: broker._id,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead enquiry not found or not assigned to your brokerage' });
    }

    lead.reply = {
      message,
      repliedAt: new Date(),
      repliedBy: req.user._id,
    };
    lead.status = 'resolved';
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Reply sent to client successfully',
      data: lead,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get reviews for this broker
// @route   GET /api/brokers/me/reviews
// @access  Private (Broker)
exports.getMyBrokerReviews = async (req, res) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    const reviews = await Review.find({
      targetType: 'broker',
      targetId: broker._id,
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

// @desc    Reply to a broker review
// @route   POST /api/brokers/me/reviews/:id/reply
// @access  Private (Broker)
exports.replyMyBrokerReview = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Reply comment is required' });
    }

    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      targetType: 'broker',
      targetId: broker._id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found for this broker' });
    }

    review.reply = {
      comment,
      repliedAt: new Date(),
      authorRole: 'broker',
      authorName: broker.name,
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
// ADMIN MANAGEMENT CONTROLLERS (role = 'admin')
// -------------------------------------------------------------

// @desc    Admin: get all brokers across platform with approval states
// @route   GET /api/brokers/admin/all
// @access  Private (Admin)
exports.getAdminBrokers = async (req, res) => {
  try {
    const { approvalStatus, search } = req.query;
    const query = {};

    if (approvalStatus && approvalStatus !== 'all') {
      query.approvalStatus = approvalStatus;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { regulation: { $regex: search, $options: 'i' } },
      ];
    }

    const brokers = await Broker.find(query)
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: brokers.length,
      data: brokers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: approve, reject, or suspend a broker listing
// @route   PATCH /api/brokers/admin/:id/approval
// @access  Private (Admin)
exports.updateBrokerApproval = async (req, res) => {
  try {
    const { approvalStatus, rejectionReason } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status. Must be pending, approved, rejected, or suspended.',
      });
    }

    const broker = await Broker.findById(req.params.id);
    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker not found' });
    }

    broker.approvalStatus = approvalStatus;
    if (rejectionReason !== undefined) {
      broker.rejectionReason = rejectionReason;
    }
    await broker.save();

    // Log admin audit action
    await AuditLog.create({
      action: approvalStatus === 'approved' ? 'approve' : approvalStatus === 'rejected' ? 'reject' : 'suspend',
      module: 'broker',
      targetId: broker._id.toString(),
      targetName: broker.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: `Status set to ${approvalStatus}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Broker listing has been ${approvalStatus}`,
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: create a broker directly
// @route   POST /api/brokers
// @access  Private (Admin)
exports.createBroker = async (req, res) => {
  try {
    const broker = await Broker.create({
      ...req.body,
      approvalStatus: 'approved',
    });

    await AuditLog.create({
      action: 'edit',
      module: 'broker',
      targetId: broker._id.toString(),
      targetName: broker.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: 'Created broker directly from admin panel',
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Broker created successfully',
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: update a broker directly
// @route   PUT /api/brokers/:id
// @access  Private (Admin)
exports.updateBroker = async (req, res) => {
  try {
    const broker = await Broker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker not found' });
    }

    await AuditLog.create({
      action: 'edit',
      module: 'broker',
      targetId: broker._id.toString(),
      targetName: broker.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: 'Edited broker listing from admin panel',
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Broker updated successfully',
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: delete a broker
// @route   DELETE /api/brokers/:id
// @access  Private (Admin)
exports.deleteBroker = async (req, res) => {
  try {
    const broker = await Broker.findByIdAndDelete(req.params.id);

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker not found' });
    }

    // Cascade delete associated reviews
    await Review.deleteMany({ targetType: 'broker', targetId: req.params.id });

    await AuditLog.create({
      action: 'delete',
      module: 'broker',
      targetId: broker._id.toString(),
      targetName: broker.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: 'Permanently deleted broker listing and associated reviews',
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Broker and associated reviews deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: toggle featured status of broker
// @route   PATCH /api/brokers/:id/feature
// @access  Private (Admin)
exports.toggleFeatureBroker = async (req, res) => {
  try {
    const broker = await Broker.findById(req.params.id);

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker not found' });
    }

    broker.isFeatured = !broker.isFeatured;
    await broker.save();

    res.status(200).json({
      success: true,
      message: `Broker is now ${broker.isFeatured ? 'featured' : 'unfeatured'}`,
      data: broker,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
