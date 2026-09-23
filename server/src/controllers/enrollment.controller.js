const { Enrollment, Course } = require('../models');

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private (Auth User)
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide courseId to enroll',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });

    if (enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
        data: enrollment,
      });
    }

    enrollment = await Enrollment.create({
      user: req.user.id,
      course: courseId,
      progress: 0,
      completedLessons: [],
    });

    // Increment enrolled count on course
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully',
      data: enrollment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's own enrollments
// @route   GET /api/enrollments/me
// @access  Private (Auth User)
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate({
        path: 'course',
        select: 'title description thumbnail category level price tutor',
        populate: { path: 'tutor', select: 'name email' },
      })
      .populate('completedLessons', 'title order duration')
      .sort({ enrolledAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update course progress and completed lessons
// @route   PATCH /api/enrollments/:id/progress
// @access  Private (Auth User)
exports.updateProgress = async (req, res) => {
  try {
    const { progress, completedLessonId } = req.body;

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment record not found or unauthorized',
      });
    }

    if (progress !== undefined) {
      enrollment.progress = Math.min(100, Math.max(0, Number(progress)));
    }

    if (completedLessonId && !enrollment.completedLessons.includes(completedLessonId)) {
      enrollment.completedLessons.push(completedLessonId);
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Course progress updated successfully',
      data: enrollment,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
