import multer from 'multer';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary';
import { AppError } from './error.middleware';
import { APP_CONSTANTS } from '../config/constants';

// Helper to configure Cloudinary storage per folder
export const createCloudinaryStorage = (
  folderName: string,
  resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto',
  type: 'upload' | 'authenticated' = 'upload'
) => {
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
        type: type,
      };
    },
  });
};

export const imageStorage = createCloudinaryStorage('images', 'image');
export const documentStorage = createCloudinaryStorage('documents', 'raw');
export const sensitiveDocumentStorage = createCloudinaryStorage('sensitive-compliance', 'raw', 'authenticated');
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

// ─── 5. Broker Onboarding Dedicated Uploaders ─────────

export const uploadLicensePdf = multer({
  storage: sensitiveDocumentStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' && ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF files are accepted for regulatory license documents.', StatusCodes.BAD_REQUEST));
    }
  },
});

export const uploadLicenseProof = multer({
  storage: sensitiveDocumentStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF or image files (JPG, PNG) are accepted for regulatory proof.', StatusCodes.BAD_REQUEST));
    }
  },
});

export const uploadOfficeImages = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = APP_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isExtValid = APP_CONSTANTS.ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP images are permitted for office photos.', StatusCodes.BAD_REQUEST));
    }
  },
});

export const uploadBoardPhoto = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = APP_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isExtValid = APP_CONSTANTS.ALLOWED_IMAGE_EXTENSIONS.includes(ext);
    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP images are permitted for board member photos.', StatusCodes.BAD_REQUEST));
    }
  },
});

export const uploadPolicyPdf = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'application/pdf' && ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new AppError('Only official PDF documents are accepted for platform policies.', StatusCodes.BAD_REQUEST));
    }
  },
});

export const uploadStructureDoc = multer({
  storage: documentStorage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Only PDF or image files are accepted for fee and structure schedules.', StatusCodes.BAD_REQUEST));
    }
  },
});

export const verifyImageMagicBytes = (buffer: Buffer): boolean => {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP: RIFF .... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return true;
  }

  return false;
};

// Avatar upload middleware with 2MB limit in memory for magic-byte inspection
export const uploadAvatarMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // <= 2 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    const isExtValid = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPG, PNG, and WebP image formats up to 2MB are permitted.', StatusCodes.BAD_REQUEST));
    }
  },
});

export const uploadPromoVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const allowedExts = ['.mp4', '.webm', '.mov'];
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Only MP4, WebM, and MOV videos up to 100MB are permitted for promotional videos.', StatusCodes.BAD_REQUEST));
    }
  },
});
