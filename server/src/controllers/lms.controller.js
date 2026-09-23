const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// @desc    Get all LMS courses
// @route   GET /api/lms/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
  try {
    const { level, category, search, featured } = req.query;
    const query = { published: true };

    if (level) query.level = level;
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('modules.lessons', 'title slug durationMinutes order')
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

// @desc    Get single course by slug
// @route   GET /api/lms/courses/:slug
// @access  Public
exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate({
        path: 'modules.lessons',
        select: 'title slug durationMinutes order summary quiz',
      });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single lesson by ID
// @route   GET /api/lms/lessons/:id
// @access  Public
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('courseId', 'title slug level modules')
      .populate('quiz');

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Enroll user in course
// @route   POST /api/lms/courses/:id/enroll
// @access  Private
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const user = await User.findById(req.user.id);
    const alreadyEnrolled = user.enrolledCourses.some(
      (ec) => ec.course.toString() === course._id.toString()
    );

    if (!alreadyEnrolled) {
      user.enrolledCourses.push({
        course: course._id,
        progress: 0,
        completedLessons: [],
        quizScores: [],
      });
      course.studentsEnrolled += 1;
      await Promise.all([user.save(), course.save()]);
    }

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully',
      data: user.enrolledCourses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Complete lesson & update progress
// @route   POST /api/lms/lessons/:id/complete
// @access  Private
exports.completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const user = await User.findById(req.user.id);
    const enrollment = user.enrolledCourses.find(
      (ec) => ec.course.toString() === lesson.courseId.toString()
    );

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Please enroll in the course before completing lessons.',
      });
    }

    if (!enrollment.completedLessons.includes(lesson._id)) {
      enrollment.completedLessons.push(lesson._id);

      // Recalculate progress
      const course = await Course.findById(lesson.courseId);
      const totalLessons = course.totalLessons || 1;
      enrollment.progress = Math.min(
        100,
        Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      );

      await user.save();
    }

    res.status(200).json({
      success: true,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Submit quiz answers and calculate score
// @route   POST /api/lms/quizzes/:id/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctCount = 0;
    const feedback = quiz.questions.map((q, idx) => {
      const selected = answers ? answers[idx] : null;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        selected,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = scorePercentage >= (quiz.passingScorePercentage || 70);

    // Update user quiz record if authenticated
    if (req.user) {
      const user = await User.findById(req.user.id);
      const enrollment = user.enrolledCourses.find(
        (ec) => ec.course.toString() === quiz.courseId.toString()
      );

      if (enrollment) {
        enrollment.quizScores.push({
          quizId: quiz._id,
          score: scorePercentage,
          passed,
          completedAt: new Date(),
        });
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      score: scorePercentage,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      feedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create course (Admin)
// @route   POST /api/lms/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
