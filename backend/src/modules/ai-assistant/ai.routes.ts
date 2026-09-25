import { Router, Response } from 'express';
import crypto from 'crypto';
import { aiService } from './ai.service';
import { optionalAuth } from '../../middleware/auth.middleware';
import { aiLimiter } from '../../middleware/rateLimit.middleware';
import { validate } from '../../middleware/validate.middleware';
import { sendSuccess } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';
import { StatusCodes } from 'http-status-codes';
import { aiChatSchema } from './ai.schemas';

const router = Router();

router.post('/chat', aiLimiter, optionalAuth, validate(aiChatSchema), async (req: AuthenticatedRequest, res: Response) => {
  const { message, sessionId } = req.body;
  // Generate cryptographically unpredictable session ID if none provided
  const currentSessionId = sessionId || `session_${crypto.randomUUID()}`;
  const result = await aiService.sendMessage(message, currentSessionId, req.user?.userId);
  sendSuccess(res, result, 'AI response generated', StatusCodes.OK);
});

router.get('/history/:sessionId', aiLimiter, optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const history = await aiService.getChatHistory(sessionId as string, req.user?.userId);
  sendSuccess(res, history, 'Chat history retrieved', StatusCodes.OK);
});

router.delete('/history/:sessionId', aiLimiter, optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const result = await aiService.clearHistory(sessionId as string, req.user?.userId);
  sendSuccess(res, null, result.message, StatusCodes.OK);
});

export default router;
