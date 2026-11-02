import { z } from 'zod';
import { CategoryFormField, FormFieldType } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

export interface ValidationModeOptions {
  mode: 'draft' | 'submit';
}

export interface CompletionResult {
  percentage: number;
  totalRequired: number;
  completedRequired: number;
  missingFields: string[];
}

/**
 * Evaluates whether a conditional visibility rule is satisfied based on current answers.
 */
export function evaluateCondition(condition: any, answers: Record<string, any> = {}): boolean {
  if (!condition || typeof condition !== 'object') return true;

  // Handle logical AND
  if (Array.isArray(condition.and)) {
    return condition.and.every((c: any) => evaluateCondition(c, answers));
  }

  // Handle logical OR
  if (Array.isArray(condition.or)) {
    return condition.or.some((c: any) => evaluateCondition(c, answers));
  }

  const { field, op = 'eq', value } = condition;
  if (!field) return true;

  const currentVal = answers[field];

  switch (op) {
    case 'eq':
      return currentVal === value;
    case 'neq':
      return currentVal !== value;
    case 'truthy':
      return !!currentVal;
    case 'falsy':
      return !currentVal;
    case 'in':
      if (Array.isArray(value)) {
        return Array.isArray(currentVal)
          ? currentVal.some((v) => value.includes(v))
          : value.includes(currentVal);
      }
      return false;
    case 'notIn':
      if (Array.isArray(value)) {
        return Array.isArray(currentVal)
          ? !currentVal.some((v) => value.includes(v))
          : !value.includes(currentVal);
      }
      return true;
    case 'includes':
      return Array.isArray(currentVal) && currentVal.includes(value);
    default:
      return true;
  }
}

/**
 * Checks if a value is non-empty for completion and submission purposes.
 */
export function isValueFilled(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === 'boolean') return true;
  if (typeof val === 'number') return !isNaN(val);
  if (typeof val === 'object') {
    if ('amount' in val) return val.amount !== null && val.amount !== undefined;
    if ('value' in val) return val.value !== null && val.value !== undefined;
    if ('status' in val) return !!val.status || (val.value !== null && val.value !== undefined);
    if ('start' in val) return !!val.start;
    if ('country' in val) return !!val.country;
    return Object.values(val).some(isValueFilled);
  }
  return false;
}

/**
 * Sanitizes rich text content.
 */
export function cleanRichText(input: string): string {
  if (!input) return '';
  return sanitizeHtml(input, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
      'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      '*': ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

/**
 * Dynamically builds a Zod schema from category field definitions.
 */
export function buildAnswerSchema(
  fields: CategoryFormField[],
  options: ValidationModeOptions = { mode: 'draft' }
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  const isSubmit = options.mode === 'submit';

  for (const field of fields) {
    if (!field.isActive) continue;

    let fieldValidator: z.ZodTypeAny = z.any();

    switch (field.type) {
      case FormFieldType.TEXT: {
        let v = z.string().trim();
        const min = (field.validation as any)?.min;
        const max = (field.validation as any)?.max;
        if (isSubmit && min) v = v.min(min, `${field.label} must be at least ${min} characters`);
        if (max) v = v.max(max, `${field.label} cannot exceed ${max} characters`);
        fieldValidator = v;
        break;
      }

      case FormFieldType.TEXTAREA:
      case FormFieldType.RICH_TEXT: {
        let v = z.string().trim();
        const max = (field.validation as any)?.max || 10000;
        v = v.max(max, `${field.label} cannot exceed ${max} characters`);
        fieldValidator = v.transform(cleanRichText);
        break;
      }

      case FormFieldType.NUMBER:
      case FormFieldType.PERCENT: {
        let v = z.coerce.number();
        const min = (field.validation as any)?.min;
        const max = (field.validation as any)?.max ?? (field.type === FormFieldType.PERCENT ? 100 : undefined);
        if (isSubmit && min !== undefined) v = v.min(min, `${field.label} must be at least ${min}`);
        if (isSubmit && max !== undefined) v = v.max(max, `${field.label} cannot exceed ${max}`);
        fieldValidator = v;
        break;
      }

      case FormFieldType.NUMBER_UNIT: {
        fieldValidator = z.object({
          value: z.coerce.number(),
          unit: z.string().trim().min(1, 'Unit is required'),
        });
        break;
      }

      case FormFieldType.MONEY: {
        fieldValidator = z.object({
          amount: z.coerce.number().min(0, 'Amount must be non-negative'),
          currency: z.string().trim().min(1, 'Currency is required'),
        });
        break;
      }

      case FormFieldType.SINGLE_SELECT:
      case FormFieldType.TRI_STATE:
      case FormFieldType.COUNTRY_SINGLE: {
        fieldValidator = z.string().trim();
        break;
      }

      case FormFieldType.MULTI_SELECT:
      case FormFieldType.COUNTRY_MULTI: {
        fieldValidator = z.array(z.string().trim());
        break;
      }

      case FormFieldType.YES_NO: {
        fieldValidator = z.boolean();
        break;
      }

      case FormFieldType.YES_NO_DETAILS: {
        fieldValidator = z.object({
          value: z.boolean(),
          details: z.string().trim().optional().nullable(),
        });
        break;
      }

      case FormFieldType.URL: {
        fieldValidator = isSubmit
          ? z.string().trim().url(`${field.label} must be a valid URL`)
          : z.string().trim().optional().nullable();
        break;
      }

      case FormFieldType.DATE: {
        fieldValidator = z.string().trim();
        break;
      }

      case FormFieldType.DATE_RANGE: {
        fieldValidator = z.object({
          start: z.string().trim(),
          end: z.string().trim().optional().nullable(),
        });
        break;
      }

      case FormFieldType.LOCATION: {
        fieldValidator = z.object({
          country: z.string().trim(),
          state: z.string().trim().optional().nullable(),
          city: z.string().trim().optional().nullable(),
        });
        break;
      }

      case FormFieldType.SCHEDULE: {
        fieldValidator = z.object({
          days: z.array(z.string()).default([]),
          startHour: z.string().optional().nullable(),
          endHour: z.string().optional().nullable(),
          timezone: z.string().optional().nullable(),
        });
        break;
      }

      case FormFieldType.REPEATABLE_GROUP: {
        fieldValidator = z.array(z.record(z.any())).default([]);
        break;
      }

      case FormFieldType.STATUS_OR_VALUE: {
        fieldValidator = z.object({
          status: z.string().optional().nullable(),
          value: z.coerce.number().optional().nullable(),
        });
        break;
      }

      case FormFieldType.FILE:
      case FormFieldType.FILE_MULTI: {
        fieldValidator = z.any();
        break;
      }

      default:
        fieldValidator = z.any();
    }

    // In draft mode, all fields are optional & nullable
    if (!isSubmit) {
      shape[field.key] = fieldValidator.optional().nullable();
      if (field.allowOther) {
        shape[`${field.key}__other`] = z.string().trim().optional().nullable();
      }
    } else {
      // In submit mode, check if required
      if (field.required) {
        shape[field.key] = fieldValidator;
      } else {
        shape[field.key] = fieldValidator.optional().nullable();
      }
      if (field.allowOther) {
        shape[`${field.key}__other`] = z.string().trim().optional().nullable();
      }
    }
  }

  let schema = z.object(shape).passthrough();

  if (isSubmit) {
    schema = schema.superRefine((data, ctx) => {
      for (const field of fields) {
        if (!field.isActive) continue;

        // Conditional visibility check
        const isVisible = evaluateCondition(field.visibleWhen, data);
        if (!isVisible) continue;

        const val = data[field.key];

        // Required check
        if (field.required && !isValueFilled(val)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${field.label} is required`,
            path: [field.key],
          });
        }

        // Allow 'Other' check
        if (field.allowOther) {
          const isOtherSelected =
            val === 'OTHER' ||
            (Array.isArray(val) && val.includes('OTHER'));
          if (isOtherSelected) {
            const otherVal = data[`${field.key}__other`];
            if (!otherVal || typeof otherVal !== 'string' || !otherVal.trim()) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Please specify other for ${field.label}`,
                path: [`${field.key}__other`],
              });
            }
          }
        }

        // Disjoint check
        if (field.disjointWith && Array.isArray(val)) {
          const otherArr = data[field.disjointWith];
          if (Array.isArray(otherArr)) {
            const intersection = val.filter((item: any) => otherArr.includes(item));
            if (intersection.length > 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${field.label} cannot overlap with ${field.disjointWith} (${intersection.join(', ')})`,
                path: [field.key],
              });
            }
          }
        }
      }
    }) as any;
  }

  return schema;
}

/**
 * Calculates completion percentage and returns missing required fields.
 */
export function calculateCategoryCompletion(
  answers: Record<string, any> = {},
  fields: CategoryFormField[]
): CompletionResult {
  let totalRequired = 0;
  let completedRequired = 0;
  const missingFields: string[] = [];

  for (const field of fields) {
    if (!field.isActive || !field.required) continue;

    // Check visibility condition
    const isVisible = evaluateCondition(field.visibleWhen, answers);
    if (!isVisible) continue;

    totalRequired++;
    const filled = isValueFilled(answers[field.key]);

    if (filled) {
      // If 'OTHER' is selected and allowOther is true, ensure other value is provided
      if (field.allowOther) {
        const val = answers[field.key];
        const isOther = val === 'OTHER' || (Array.isArray(val) && val.includes('OTHER'));
        if (isOther && !isValueFilled(answers[`${field.key}__other`])) {
          missingFields.push(`${field.key}__other`);
          continue;
        }
      }
      completedRequired++;
    } else {
      missingFields.push(field.key);
    }
  }

  const percentage = totalRequired === 0 ? 100 : Math.round((completedRequired / totalRequired) * 100);

  return {
    percentage,
    totalRequired,
    completedRequired,
    missingFields,
  };
}

