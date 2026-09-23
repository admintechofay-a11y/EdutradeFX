const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'edutradefx',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz',
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// File filter to strictly validate MIME type and block dangerous extensions
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WEBP, PDF.`
      ),
      false
    );
  }

  // Check file extension
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  const dangerousExtensions = [
    'exe', 'bat', 'cmd', 'sh', 'php', 'pl', 'cgi', 'js', 'vbs', 'jar', 'msi',
  ];

  if (dangerousExtensions.includes(extension)) {
    return cb(new Error(`File extension .${extension} is strictly forbidden for security reasons.`), false);
  }

  cb(null, true);
};

// Cloudinary-only storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edutradefx_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// Multer upload instances
exports.uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
});

exports.uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for dispute evidence / PDFs
  },
});

exports.uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
    files: 5, // Maximum 5 files per dispute
  },
});
