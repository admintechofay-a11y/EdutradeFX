const {
  User,
  Broker,
  AccountManager,
  SignalProvider,
  Review,
  Course,
  Lesson,
  Enrollment,
  Complaint,
  ContactEnquiry,
  Payout,
  AuditLog,
} = require('../models');

// @desc    Get counts & metrics across the platform
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBrokersUsers,
      totalSignalProviderUsers,
      totalTutors,
      totalAdmins,
      totalBrokers,
      pendingBrokers,
      approvedBrokers,
      totalSignalProviders,
      pendingSignalProviders,
      totalCourses,
      pendingCourses,
      totalComplaints,
      pendingComplaints,
      totalReviews,
      pendingPayouts,
      totalAuditLogs,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'broker' }),
      User.countDocuments({ role: 'signal_provider' }),
      User.countDocuments({ role: 'tutor' }),
      User.countDocuments({ role: 'admin' }),
      Broker.countDocuments(),
      Broker.countDocuments({ approvalStatus: 'pending' }),
      Broker.countDocuments({ approvalStatus: 'approved' }),
      SignalProvider.countDocuments(),
      SignalProvider.countDocuments({ approvalStatus: 'pending' }),
      Course.countDocuments(),
      Course.countDocuments({ approvalStatus: 'submitted' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Review.countDocuments(),
      Payout.countDocuments({ status: 'pending' }),
      AuditLog.countDocuments(),
    ]);

    const recentAudits = await AuditLog.find().sort({ createdAt: -1 }).limit(10).lean();

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers + totalBrokersUsers + totalSignalProviderUsers + totalTutors + totalAdmins,
          regularUsers: totalUsers,
          brokers: totalBrokersUsers,
          signalProviders: totalSignalProviderUsers,
          tutors: totalTutors,
          admins: totalAdmins,
        },
        brokers: {
          total: totalBrokers,
          pending: pendingBrokers,
          approved: approvedBrokers,
        },
        signalProviders: {
          total: totalSignalProviders,
          pending: pendingSignalProviders,
        },
        courses: {
          total: totalCourses,
          pending: pendingCourses,
        },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
        },
        reviews: {
          total: totalReviews,
        },
        payouts: {
          pending: pendingPayouts,
        },
        audits: {
          total: totalAuditLogs,
          recent: recentAudits,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all registered users across all 5 roles
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAdminUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update a user's role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ['user', 'broker', 'signal_provider', 'tutor', 'admin'];

    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid user role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      action: 'edit',
      module: 'user',
      targetId: user._id.toString(),
      targetName: user.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: `Role updated from '${oldRole}' to '${role}'`,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Suspend or activate a user account
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or suspended' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    await AuditLog.create({
      action: status === 'suspended' ? 'suspend' : 'activate',
      module: 'user',
      targetId: user._id.toString(),
      targetName: user.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: `User account set to '${status}'`,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `User account is now ${status}`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditLog.create({
      action: 'delete',
      module: 'user',
      targetId: user._id.toString(),
      targetName: user.name,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: `Deleted user ${user.email} (${user.role})`,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAdminAuditLogs = async (req, res) => {
  try {
    const { module, action, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (module && module !== 'all') {
      query.module = module;
    }

    if (action && action !== 'all') {
      query.action = action;
    }

    if (search) {
      query.$or = [
        { targetName: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { adminName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all tutor payouts
// @route   GET /api/admin/payouts
// @access  Private (Admin)
exports.getAdminPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate('tutor', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payouts.length,
      data: payouts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Process/approve tutor payout
// @route   PATCH /api/admin/payouts/:id
// @access  Private (Admin)
exports.updatePayoutStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['pending', 'approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid payout status' });
    }

    const payout = await Payout.findById(req.params.id).populate('tutor', 'name email');
    if (!payout) {
      return res.status(404).json({ success: false, message: 'Payout request not found' });
    }

    payout.status = status;
    if (adminNote) payout.adminNote = adminNote;
    if (status === 'paid') payout.processedAt = new Date();
    await payout.save();

    await AuditLog.create({
      action: 'payout_processed',
      module: 'payout',
      targetId: payout._id.toString(),
      targetName: `Payout $${payout.amount} for ${payout.tutor?.name || 'Tutor'}`,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: `Payout marked as '${status}'. Note: ${adminNote || 'None'}`,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Payout marked as ${status}`,
      data: payout,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
