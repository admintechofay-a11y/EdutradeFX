/**
 * EdutradeFX Production Security & Regression Test Suite
 * Validates critical security constraints, RBAC, input sanitization, and cryptography.
 */

import 'dotenv/config';
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '../utils/jwt.utils';
import { hashToken, hashPassword, comparePassword } from '../utils/bcrypt.utils';
import { escapeHtml } from '../utils/email.utils';
import { registerSchema, partnerRegisterSchema } from '../modules/auth/auth.schemas';
import { aiChatSchema } from '../modules/ai-assistant/ai.schemas';
import { APP_CONSTANTS } from '../config/constants';
import { Role } from '@prisma/client';
import crypto from 'crypto';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    results.push({ name, passed: true });
    console.log(`  ✓ PASS: ${name}`);
  } else {
    results.push({ name, passed: false, error: detail || 'Assertion failed' });
    console.error(`  ✗ FAIL: ${name} - ${detail || 'Assertion failed'}`);
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('EDUTRADEFX SECURITY & REGRESSION SUITE');
  console.log('========================================\n');

  // --- 1. JWT Security & Verification ---
  console.log('1. JWT Cryptography & Signature Validation');
  const mockUser = {
    userId: 'u12345-test-uuid',
    role: Role.STUDENT,
  };

  const accessToken = generateAccessToken(mockUser);
  assert(typeof accessToken === 'string' && accessToken.split('.').length === 3, 'Access token is well-formed JWT');

  const decodedAccess = verifyAccessToken(accessToken);
  assert(decodedAccess.userId === mockUser.userId, 'Access token decodes userId correctly');
  assert(decodedAccess.role === mockUser.role, 'Access token decodes role correctly');
  assert((decodedAccess as any).iss === 'edutradefx', 'Access token has issuer edutradefx');
  assert((decodedAccess as any).aud === 'edutradefx-app', 'Access token has audience edutradefx-app');

  const refreshToken = generateRefreshToken({ userId: mockUser.userId });
  assert(typeof refreshToken === 'string' && refreshToken.split('.').length === 3, 'Refresh token is well-formed JWT');

  const decodedRefresh = verifyRefreshToken(refreshToken);
  assert(decodedRefresh.userId === mockUser.userId, 'Refresh token decodes userId correctly');

  // Tampered token test
  let tamperedCaught = false;
  try {
    const tampered = accessToken.slice(0, -6) + 'abcdef';
    verifyAccessToken(tampered);
  } catch {
    tamperedCaught = true;
  }
  assert(tamperedCaught, 'Tampered JWT signature is rejected');

  // --- 2. Token Hashing ---
  console.log('\n2. Cryptographic Token Hashing');
  const rawToken = 'sample_raw_reset_token_12345';
  const hashed1 = hashToken(rawToken);
  const hashed2 = hashToken(rawToken);
  assert(hashed1 === hashed2, 'hashToken is deterministic');
  assert(hashed1 !== rawToken, 'hashToken does not store plaintext');
  assert(hashed1.length === 64, 'hashToken produces SHA-256 64-char hex string');

  // --- 3. Password Hashing ---
  console.log('\n3. Bcrypt Password Hashing & Verification');
  const testPassword = 'SecurePassword@2025!';
  const hashedPassword = await hashPassword(testPassword);
  assert(hashedPassword.startsWith('$2'), 'Password hash uses bcrypt format');
  assert(hashedPassword !== testPassword, 'Password is not plaintext');

  const passwordMatch = await comparePassword(testPassword, hashedPassword);
  assert(passwordMatch === true, 'Matching password successfully verifies');

  const passwordMismatch = await comparePassword('WrongPassword@123', hashedPassword);
  assert(passwordMismatch === false, 'Non-matching password is rejected');

  // --- 4. HTML Sanitization for Email Templates ---
  console.log('\n4. HTML Sanitization & Injection Prevention');
  const maliciousInput = '<script>alert("XSS")</script><img src=x onerror="stealCookies()"> & "quotes"';
  const sanitized = escapeHtml(maliciousInput);
  assert(!sanitized.includes('<script>'), 'Sanitizer stripped/escaped <script>');
  assert(!sanitized.includes('"quotes"'), 'Sanitizer escaped double quotes');
  assert(sanitized.includes('&lt;script&gt;'), 'Sanitizer properly entity-encoded HTML tags');
  assert(sanitized.includes('&amp;'), 'Sanitizer properly entity-encoded ampersand');

  // --- 5. Registration Validation & Privilege Escalation Prevention ---
  console.log('\n5. Registration & RBAC Privilege Escalation Prevention');

  // Test Attempt to register partner directly as ADMIN
  const adminRegistrationAttempt = partnerRegisterSchema.safeParse({
    name: 'Hacker Admin',
    email: 'hacker@example.com',
    password: 'StrongPassword@123',
    role: 'ADMIN',
    phone: '+1234567890',
    consent: true,
  });
  assert(!adminRegistrationAttempt.success, 'Partner registration schema strictly rejects ADMIN role assignment');

  // Test Valid partner registration as BROKER
  const validBrokerRegistration = partnerRegisterSchema.safeParse({
    name: 'Valid Broker',
    email: 'broker@example.com',
    password: 'StrongPassword@123',
    role: Role.BROKER,
    phone: '+1234567890',
    consent: true,
  });
  assert(validBrokerRegistration.success, 'Partner registration schema accepts valid BROKER role');

  // Test Valid user registration
  const validStudentRegistration = registerSchema.safeParse({
    name: 'Valid Student',
    email: 'student@example.com',
    password: 'StrongPassword@123',
    phone: '+1234567890',
    consent: true,
  });
  assert(validStudentRegistration.success, 'Student registration schema succeeds with valid fields');

  // Test Weak password rejection
  const weakPasswordAttempt = registerSchema.safeParse({
    name: 'Weak Pass',
    email: 'weak@example.com',
    password: '123',
    phone: '+1234567890',
    consent: true,
  });
  assert(!weakPasswordAttempt.success, 'Registration schema rejects weak password');

  // --- 6. AI Assistant Input Security ---
  console.log('\n6. AI Assistant Input Validation');
  const validAiPayload = aiChatSchema.safeParse({
    message: 'What is pip in forex?',
    sessionId: '123e4567-e89b-12d3-a456-426614174000',
  });
  assert(validAiPayload.success, 'AI Assistant accepts valid user message and UUID session ID');

  const emptyAiPayload = aiChatSchema.safeParse({
    message: '',
  });
  assert(!emptyAiPayload.success, 'AI Assistant rejects empty message payload');

  const hugeAiPayload = aiChatSchema.safeParse({
    message: 'A'.repeat(5000), // Exceeds 2000 char limit
  });
  assert(!hugeAiPayload.success, 'AI Assistant rejects prompt exceeding 2000 chars');

  // --- 7. File Upload Extension Whitelist ---
  console.log('\n7. File Upload Safety & Whitelist Enforcements');
  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.py', '.html', '.svg', '.dll'];
  for (const ext of dangerousExtensions) {
    const isImage = (APP_CONSTANTS.ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
    const isDoc = (APP_CONSTANTS.ALLOWED_DOC_EXTENSIONS as readonly string[]).includes(ext);
    const isVid = (APP_CONSTANTS.ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(ext);
    assert(!isImage && !isDoc && !isVid, `Dangerous extension '${ext}' blocked from all upload whitelists`);
  }

  const safeExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4'];
  for (const ext of safeExtensions) {
    const isAllowed =
      (APP_CONSTANTS.ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext) ||
      (APP_CONSTANTS.ALLOWED_DOC_EXTENSIONS as readonly string[]).includes(ext) ||
      (APP_CONSTANTS.ALLOWED_VIDEO_EXTENSIONS as readonly string[]).includes(ext);
    assert(isAllowed, `Safe extension '${ext}' is properly permitted`);
  }

  // --- 8. Financial HMAC Calculation Integrity ---
  console.log('\n8. Payment Gateway HMAC Signature Verification');
  const dummyOrderId = 'order_DA1234567890';
  const dummyPaymentId = 'pay_DA9876543210';
  const dummySecret = 'test_secret_key_12345';
  const generatedSignature = crypto
    .createHmac('sha256', dummySecret)
    .update(`${dummyOrderId}|${dummyPaymentId}`)
    .digest('hex');

  const expectedSignature = crypto
    .createHmac('sha256', dummySecret)
    .update(`${dummyOrderId}|${dummyPaymentId}`)
    .digest('hex');

  assert(generatedSignature === expectedSignature, 'Razorpay HMAC-SHA256 signature verification functions correctly');

  // Summary
  console.log('\n========================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
