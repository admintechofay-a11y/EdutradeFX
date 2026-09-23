const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course tutor is required'],
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Forex Basics',
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      index: true,
    },
    durationHours: {
      type: Number,
      default: 2,
    },
    level: {
      type: String,
      lowercase: true,
      enum: {
        values: ['beginner', 'intermediate', 'advanced', 'masterclass'],
        message: '{VALUE} is not a valid course level',
      },
      default: 'beginner',
      index: true,
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: '{VALUE} is not a valid course status',
      },
      default: 'draft',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['draft', 'submitted', 'approved', 'rejected'],
        message: '{VALUE} is not a valid course approval status',
      },
      default: 'draft',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and sorting
courseSchema.index({ createdAt: -1 });
courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ category: 1, level: 1 });

// Cascade delete: when a Course is deleted, remove all associated Lessons and Enrollments
courseSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await mongoose.model('Lesson').deleteMany({ course: doc._id });
    await mongoose.model('Enrollment').deleteMany({ course: doc._id });
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);

