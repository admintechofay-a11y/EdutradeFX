import { z } from 'zod';

export const aiChatSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
    .transform((val) => val.trim()),
  sessionId: z
    .string()
    .max(64, 'Session ID cannot exceed 64 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid session identifier characters')
    .optional(),
});
