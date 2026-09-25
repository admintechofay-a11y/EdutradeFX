export const APP_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  PLATFORM_COMMISSION_PERCENTAGE: 20,
  MINIMUM_PAYOUT_AMOUNT: 500, // in INR
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  PASSWORD_RESET_EXPIRY_HOURS: 1,
  EMAIL_VERIFY_EXPIRY_HOURS: 24,
  MAX_FILE_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 500 * 1024 * 1024, // 500MB
  },
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  ALLOWED_DOC_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_DOC_EXTENSIONS: ['.pdf', '.doc', '.docx'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  ALLOWED_VIDEO_EXTENSIONS: ['.mp4', '.mov', '.avi'],
};
