'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

export interface ResponsiveImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
}

const aspectRatioMap = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  auto: '',
};

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className,
  containerClassName,
  aspectRatio = 'auto',
  fill,
  width,
  height,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  // Check if domain is allowed in next.config remotePatterns
  const isAllowedDomain =
    imgSrc.startsWith('/') ||
    imgSrc.startsWith('data:') ||
    imgSrc.includes('res.cloudinary.com') ||
    imgSrc.includes('images.unsplash.com');

  const handleError = () => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const imageElement = (
    <Image
      src={imgSrc}
      alt={alt || ''}
      sizes={sizes}
      fill={fill}
      width={!fill ? width || 400 : undefined}
      height={!fill ? height || 300 : undefined}
      unoptimized={!isAllowedDomain}
      onError={handleError}
      className={cn('transition-all duration-300 object-cover', className)}
      {...props}
    />
  );

  if (aspectRatio !== 'auto' || containerClassName) {
    return (
      <div
        className={cn(
          'relative overflow-hidden',
          aspectRatioMap[aspectRatio],
          containerClassName
        )}
      >
        {imageElement}
      </div>
    );
  }

  return imageElement;
};
