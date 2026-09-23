const { Course, Lesson, Enrollment, Review, Payout, AuditLog } = require('../models');

// @desc    Get all public courses (approved & submitted)
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      approvalStatus,
      status,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (approvalStatus && approvalStatus !== 'all') {
      query.approvalStatus = approvalStatus;
    } else if (!approvalStatus) {
      query.approvalStatus = { $ne: 'rejected' };
    }

    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = { $ne: 'archived' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (level && level !== 'All') {
      query.level = level.toLowerCase();
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('tutor', 'name email role')
      .populate({ path: 'lessons', select: 'title order duration', options: { sort: { order: 1 } } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const normalizedCourses = courses.map((c) => ({
      ...c,
      rating: c.rating !== undefined ? c.rating : 4.8,
      studentsEnrolled: c.studentsEnrolled || c.enrolledCount || 120,
      instructor: c.instructor || {
        name: c.tutor?.name || 'EduTradeFX Faculty',
        avatar: c.tutor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
    }));

    res.status(200).json({
      success: true,
      count: normalizedCourses.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: normalizedCourses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single course by ID or slug
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    let course = await Course.findOne(query)
      .populate('tutor', 'name email role')
      .populate({ path: 'lessons', options: { sort: { order: 1 } } })
      .lean();

    if (!course && !isObjectId) {
      course = await Course.findOne({ slug: new RegExp(req.params.id, 'i') })
        .populate('tutor', 'name email role')
        .populate({ path: 'lessons', options: { sort: { order: 1 } } })
        .lean();
    }

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.rating = course.rating !== undefined ? course.rating : 4.8;
    course.studentsEnrolled = course.studentsEnrolled || course.enrolledCount || 120;
    course.instructor = course.instructor || {
      name: course.tutor?.name || 'EduTradeFX Faculty',
      avatar: course.tutor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// TUTOR SELF-SERVICE MODULE CONTROLLERS (role = 'tutor')
// -------------------------------------------------------------

// @desc    Get all courses authored by the logged-in tutor
// @route   GET /api/courses/me/courses
// @access  Private (Tutor)
exports.getMyCourses = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { tutor: req.user._id };
    const courses = await Course.find(query)
      .populate('tutor', 'name email role')
      .populate({ path: 'lessons', select: 'title duration' })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a new course as published/approved
// @route   POST /api/courses
// @access  Private (Tutor / Admin)
exports.createCourse = async (req, res) => {
  try {
    const slug =
      req.body.slug ||
      (req.body.title || 'course')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const courseData = {
      ...req.body,
      slug,
      level: (req.body.level || 'beginner').toLowerCase(),
      durationHours: Number(req.body.durationHours || 2),
      price: Number(req.body.price || 0),
      tutor: req.user._id,
      status: req.body.status || 'published',
      approvalStatus: req.body.approvalStatus || 'approved',
      rejectionReason: '',
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Tutor / Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course',
      });
    }

    const updates = { ...req.body };
    // Only admin can change approvalStatus directly via this route
    if (req.user.role !== 'admin') {
      delete updates.approvalStatus;
      delete updates.tutor;
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit course for administrative compliance review
// @route   POST /api/courses/:id/submit
// @access  Private (Tutor)
exports.submitCourseForApproval = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    course.approvalStatus = 'submitted';
    course.rejectionReason = '';
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course submitted for admin review successfully',
      data: course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle published status (allowed only if approved)
// @route   POST /api/courses/:id/publish
// @access  Private (Tutor / Admin)
exports.togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (course.approvalStatus !== 'approved' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Course cannot be published until it has been approved by the platform administration.',
      });
    }

    course.status = course.status === 'published' ? 'draft' : 'published';
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course is now ${course.status}`,
      data: course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Tutor / Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.tutor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Lesson.deleteMany({ course: req.params.id });
    await Enrollment.deleteMany({ course: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Course and lessons deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get tutor earnings, sales & student metrics
// @route   GET /api/courses/me/earnings
// @access  Private (Tutor)
exports.getMyEarnings = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user._id });
    const courseIds = courses.map((c) => c._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    const totalStudents = enrollments.length;

    // Calculate total revenue ($49 average course price or custom price)
    const totalRevenue = courses.reduce((acc, c) => acc + (c.price || 49) * (c.enrolledCount || 0), 0);
    const netEarnings = Math.round(totalRevenue * 0.85); // 85% instructor payout rate

    const paidPayouts = await Payout.find({ tutor: req.user._id, status: 'paid' });
    const totalWithdrawn = paidPayouts.reduce((acc, p) => acc + p.amount, 0);
    const pendingBalance = Math.max(0, netEarnings - totalWithdrawn);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses: courses.length,
        grossSales: totalRevenue,
        commissionRate: '15%',
        netEarnings,
        totalWithdrawn,
        pendingBalance,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get tutor payout requests
// @route   GET /api/courses/me/payouts
// @access  Private (Tutor)
exports.getMyPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ tutor: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payouts.length,
      data: payouts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit a payout request
// @route   POST /api/courses/me/payouts
// @access  Private (Tutor)
exports.createPayoutRequest = async (req, res) => {
  try {
    const { amount, paymentMethod, accountDetails } = req.body;

    if (!amount || Number(amount) < 10) {
      return res.status(400).json({ success: false, message: 'Minimum payout request is $10' });
    }

    if (!paymentMethod || !accountDetails) {
      return res.status(400).json({ success: false, message: 'Please provide payment method and account details' });
    }

    const payout = await Payout.create({
      tutor: req.user._id,
      amount: Number(amount),
      currency: 'USD',
      paymentMethod,
      accountDetails,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully. Compliance processing takes 1-3 business days.',
      data: payout,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get course reviews for tutor's courses
// @route   GET /api/courses/me/reviews
// @access  Private (Tutor)
exports.getMyCourseReviews = async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.user._id }).select('_id title');
    const courseIds = courses.map((c) => c._id);

    const reviews = await Review.find({
      targetType: 'course',
      targetId: { $in: courseIds },
    })
      .populate('user', 'name avatar')
      .populate('targetId', 'title')
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

// @desc    Reply to a course review
// @route   POST /api/courses/me/reviews/:id/reply
// @access  Private (Tutor)
exports.replyCourseReview = async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Reply comment is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.reply = {
      comment,
      repliedAt: new Date(),
      authorRole: 'tutor',
      authorName: req.user.name,
    };
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Instructor response posted successfully',
      data: review,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------------
// ADMIN COURSE MANAGEMENT (role = 'admin')
// -------------------------------------------------------------

// @desc    Admin: get all courses across all tutors
// @route   GET /api/courses/admin/all
// @access  Private (Admin)
exports.getAdminCourses = async (req, res) => {
  try {
    const { approvalStatus, search } = req.query;
    const query = {};

    if (approvalStatus && approvalStatus !== 'all') {
      query.approvalStatus = approvalStatus;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('tutor', 'name email role')
      .populate('lessons', 'title duration')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin: approve or reject a course listing
// @route   PATCH /api/courses/admin/:id/approval
// @access  Private (Admin)
exports.updateCourseApproval = async (req, res) => {
  try {
    const { approvalStatus, rejectionReason } = req.body;

    if (!['draft', 'submitted', 'approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid approval status. Must be draft, submitted, approved, or rejected.',
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.approvalStatus = approvalStatus;
    if (rejectionReason !== undefined) {
      course.rejectionReason = rejectionReason;
    }

    // If approved, automatically publish it unless requested otherwise
    if (approvalStatus === 'approved') {
      course.status = 'published';
    }

    await course.save();

    await AuditLog.create({
      action: approvalStatus === 'approved' ? 'approve' : 'reject',
      module: 'course',
      targetId: course._id.toString(),
      targetName: course.title,
      admin: req.user._id,
      adminName: req.user.name,
      adminEmail: req.user.email,
      details: `Course status changed to ${approvalStatus}. ${rejectionReason ? `Reason: ${rejectionReason}` : ''}`,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Course has been ${approvalStatus}`,
      data: course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
