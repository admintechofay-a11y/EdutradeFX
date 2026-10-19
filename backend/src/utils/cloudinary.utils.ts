import cloudinary from '../config/cloudinary';
import { logger } from './logger';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
}

/**
 * Uploads an in-memory Buffer to Cloudinary using upload_stream.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    publicIdPrefix?: string;
    resourceType?: 'image' | 'raw' | 'auto';
    type?: 'upload' | 'authenticated';
    transformation?: any[];
  }
): Promise<CloudinaryUploadResult> {
  const resourceType = options.resourceType || 'auto';
  const type = options.type || 'upload';
  const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
  const publicId = options.publicIdPrefix
    ? `${options.publicIdPrefix}_${uniqueSuffix}`
    : `asset_${uniqueSuffix}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `edutradefx/${options.folder}`,
        public_id: publicId,
        resource_type: resourceType,
        type: type,
        ...(options.transformation && { transformation: options.transformation }),
      },
      (error, result) => {
        if (error || !result) {
          logger.error('Cloudinary buffer upload error:', error);
          return reject(error || new Error('Upload failed with no result from Cloudinary'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Deletes an asset from Cloudinary by its public ID.
 */
export async function deleteCloudinaryAsset(
  publicId?: string | null,
  resourceType: 'image' | 'raw' | 'video' = 'raw'
): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
  } catch (err) {
    logger.warn(`Failed to destroy Cloudinary asset ${publicId}:`, err);
  }
}

/**
 * Generates a signed, temporary URL for an authenticated or private asset expiring in <= 5 minutes (default 300s).
 */
export function generateSignedDocumentUrl(
  publicId: string,
  resourceType: 'image' | 'raw' = 'raw',
  expiresInSeconds = 300
): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  try {
    // Generate signed download URL
    return cloudinary.utils.private_download_url(publicId, '', {
      resource_type: resourceType,
      type: 'authenticated',
      expires_at: expiresAt,
    });
  } catch {
    // Fallback using sign_url
    return cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
      resource_type: resourceType,
      expires_at: expiresAt,
      secure: true,
    });
  }
}
