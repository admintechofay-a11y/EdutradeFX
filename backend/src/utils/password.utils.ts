/**
 * Password strength rules and common password deny-list
 */

export const COMMON_PASSWORDS_DENYLIST = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password123',
  'password1',
  'p@ssword',
  'p@ssw0rd',
  'admin123',
  'admin1234',
  'qwerty123',
  'qwertyuiop',
  'welcome123',
  'welcome1',
  'changeme',
  'iloveyou',
  'monkey123',
  'dragon123',
  'master123',
  'football',
  'trustno1',
  'edutrade123',
  'edutradefx',
  'forex123',
  'trading123',
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS_DENYLIST.has(password.toLowerCase().trim());
}

export function evaluatePasswordStrength(password: string): {
  score: number; // 0 (weak) to 4 (very strong)
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isNotCommon: boolean;
  isAllowed: boolean;
} {
  const hasMinLength = (password || '').length >= 8 && (password || '').length <= 128;
  const hasUpper = /[A-Z]/.test(password || '');
  const hasLower = /[a-z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecial = /[^A-Za-z0-9]/.test(password || '');
  const isNotCommon = !isCommonPassword(password || '');

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (!isNotCommon) score = Math.min(score, 1);

  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  if (score >= 4) label = 'Strong';
  else if (score === 3) label = 'Good';
  else if (score === 2) label = 'Fair';

  const isAllowed = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && isNotCommon;

  return {
    score,
    label,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isNotCommon,
    isAllowed,
  };
}
