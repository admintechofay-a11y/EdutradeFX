import { Request, Response, NextFunction } from 'express';

const cleanString = (value: string): string => {
  return value
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '');
};

const sanitizeRecursive = (obj: any, skipFields: string[] = ['description', 'content', 'resolution', 'adminNotes']): any => {
  if (typeof obj === 'string') {
    return cleanString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeRecursive(item, skipFields));
  }

  if (obj !== null && typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      if (skipFields.includes(key)) {
        // Only strip dangerous script elements for rich-text fields
        if (typeof obj[key] === 'string') {
          cleaned[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '');
        } else {
          cleaned[key] = obj[key];
        }
      } else {
        cleaned[key] = sanitizeRecursive(obj[key], skipFields);
      }
    }
    return cleaned;
  }

  return obj;
};

export const sanitizeBody = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeRecursive(req.body);
  }
  next();
};
