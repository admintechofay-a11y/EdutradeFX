import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

/**
 * Normalizes a raw phone string into E.164 format (+[country code][number]).
 * Uses defaultCountry (default: 'IN') when no leading '+' is present.
 */
export function normalizeToE164(
  phone: string | null | undefined,
  defaultCountry: CountryCode = 'IN'
): string | null {
  if (!phone || typeof phone !== 'string') return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;

  try {
    const parsed = parsePhoneNumber(trimmed, defaultCountry);
    if (parsed && parsed.isValid()) {
      return parsed.number; // E.164 string (+...)
    }
  } catch {
    // Parsing error
  }

  // If already starts with + and contains only valid chars (+ and digits)
  if (/^\+[1-9]\d{6,14}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Validates whether the given phone string can be resolved to a valid E.164 phone number.
 */
export function validatePhoneE164(
  phone: string | null | undefined,
  defaultCountry: CountryCode = 'IN'
): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (!trimmed) return false;

  try {
    if (isValidPhoneNumber(trimmed, defaultCountry)) {
      return true;
    }
  } catch {
    // continue
  }

  return /^\+[1-9]\d{6,14}$/.test(trimmed);
}
