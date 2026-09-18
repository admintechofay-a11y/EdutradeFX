import { Router, Request, Response } from 'express';
import { aiService } from './ai.service';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { aiLimiter } from '../../middleware/rateLimit.middleware';
import { sendSuccess } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';
import { StatusCodes } from 'http-status-codes';

const router = Router();

router.post('/chat', aiLimiter, optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { message, sessionId } = req.body;
  const currentSessionId = sessionId || `session_${Date.now()}`;
  const result = await aiService.sendMessage(message, currentSessionId, req.user?.userId);
  sendSuccess(res, result, 'AI response generated', StatusCodes.OK);
});

router.get('/history/:sessionId', aiLimiter, async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const history = await aiService.getChatHistory(sessionId as string);
  sendSuccess(res, history, 'Chat history retrieved', StatusCodes.OK);
});

router.delete('/history/:sessionId', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.params;
  const result = await aiService.clearHistory(sessionId as string);
  sendSuccess(res, null, result.message, StatusCodes.OK);
});

export default router;
