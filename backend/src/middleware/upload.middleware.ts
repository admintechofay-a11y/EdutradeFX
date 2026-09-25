import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary';
import { AppError } from './error.middleware';
import { APP_CONSTANTS } from '../config/constants';

// Helper to configure Cloudinary storage per folder
export const createCloudinaryStorage = (folderName: string, resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto') => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      // Prevent path traversal by extracting only the base name
      const safeBasename = path.basename(file.originalname);
      const cleanName = safeBasename.replace(/[^a-zA-Z0-9]/g, '_');
      return {
        folder: `edutradefx/${folderName}`,
        public_id: `${cleanName}-${uniqueSuffix}`,
        resource_type: resourceType,
      };
    },
  });
};

export const imageStorage = createCloudinaryStorage('images', 'image');
export const documentStorage = createCloudinaryStorage('documents', 'raw');
export const videoStorage = createCloudinaryStorage('videos', 'video');
export const courseContentStorage = createCloudinaryStorage('course-content', 'auto');

// 1. Image Upload Middleware (jpg, png, webp <= 5MB)
export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: APP_CONSTANTS.MAX_FILE_SIZE.IMAGE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = APP_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isExtValid = APP_CONSTANTS.ALLOWED_IMAGE_EXTENSIONS.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP image formats are permitted.', StatusCodes.BAD_REQUEST));
    }
  },
});

// 2. Document Upload Middleware (pdf, doc, docx <= 10MB)
export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: APP_CONSTANTS.MAX_FILE_SIZE.DOCUMENT },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = APP_CONSTANTS.ALLOWED_DOC_TYPES.includes(file.mimetype);
    const isExtValid = APP_CONSTANTS.ALLOWED_DOC_EXTENSIONS.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF and Word documents are permitted.', StatusCodes.BAD_REQUEST));
    }
  },
});

// 3. Video Upload Middleware (mp4, mov, avi <= 500MB)
export const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: APP_CONSTANTS.MAX_FILE_SIZE.VIDEO },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = APP_CONSTANTS.ALLOWED_VIDEO_TYPES.includes(file.mimetype);
    const isExtValid = APP_CONSTANTS.ALLOWED_VIDEO_EXTENSIONS.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new AppError('Only MP4, MOV, and AVI video formats are permitted.', StatusCodes.BAD_REQUEST));
    }
  },
});

// 4. Course Content Upload Middleware (video + pdf <= 500MB)
export const uploadCourseContent = multer({
  storage: courseContentStorage,
  limits: { fileSize: APP_CONSTANTS.MAX_FILE_SIZE.VIDEO },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimes = [...APP_CONSTANTS.ALLOWED_VIDEO_TYPES, ...APP_CONSTANTS.ALLOWED_DOC_TYPES];
    const allowedExts = [...APP_CONSTANTS.ALLOWED_VIDEO_EXTENSIONS, ...APP_CONSTANTS.ALLOWED_DOC_EXTENSIONS];

    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Only video files (MP4/MOV) and PDF documents are supported for curriculum content.', StatusCodes.BAD_REQUEST));
    }
  },
});
