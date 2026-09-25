import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../middleware/error.middleware';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-mock-key',
});

const SYSTEM_PROMPT = `You are an educational Forex assistant for EdutradeFX. Help users understand:
- Forex concepts and terminology (pips, leverage, lots, spreads, pairs)
- Trading strategies (technical and fundamental analysis)
- Risk management principles (stop-loss, risk-to-reward, drawdown control)
- How to read charts and indicators (RSI, MACD, Moving Averages, Support/Resistance)
- Broker comparison guidance
- Account management concepts
- Signal provider fundamentals
- EdutradeFX platform features and navigation

IMPORTANT RULES:
1. Never give specific financial advice or recommend specific trades.
2. Always include appropriate risk disclaimers regarding market volatility.
3. Never guarantee trading profits.
4. Keep responses educational, accurate, and informative.
5. If asked about specific brokers, direct users to the official EdutradeFX broker directory.
6. Be concise but thorough.
7. If asked anything completely unrelated to Forex, trading, financial markets, or EdutradeFX, politely redirect.`;

export class AIService {
  async sendMessage(message: string, sessionId: string, userId?: string) {
    // 1. Fetch conversation history for context (last 10 messages)
    const history = await prisma.aIChatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const messages = history.map((h) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: h.content,
    }));

    messages.push({ role: 'user', content: message });

    let assistantResponse = '';

    // Check if live Anthropic key is supplied
    const hasLiveKey = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes('placeholder') && !process.env.ANTHROPIC_API_KEY.includes('mock');

    if (hasLiveKey) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        });

        const firstBlock = response.content[0];
        if (firstBlock && 'text' in firstBlock) {
          assistantResponse = firstBlock.text;
        } else {
          assistantResponse = 'I am here to help you understand forex concepts and trading education.';
        }
      } catch (err: any) {
        logger.warn('Anthropic API query failed, falling back to simulated educational response:', err.message);
        assistantResponse = this.generateFallbackResponse(message);
      }
    } else {
      assistantResponse = this.generateFallbackResponse(message);
    }

    // 2. Persist user message and assistant reply to DB
    await prisma.$transaction([
      prisma.aIChatHistory.create({
        data: {
          sessionId,
          userId,
          role: 'user',
          content: message,
        },
      }),
      prisma.aIChatHistory.create({
        data: {
          sessionId,
          userId,
          role: 'assistant',
          content: assistantResponse,
        },
      }),
    ]);

    return {
      message: assistantResponse,
      sessionId,
    };
  }

  async getChatHistory(sessionId: string, userId?: string) {
    const history = await prisma.aIChatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    if (history.length > 0) {
      // If messages are tied to a user account, enforce strict ownership
      const sessionOwner = history.find((h) => h.userId)?.userId;
      if (sessionOwner && sessionOwner !== userId) {
        throw new AppError('Unauthorized: You do not have permission to view this chat history.', StatusCodes.FORBIDDEN);
      }
    }

    return history;
  }

  async clearHistory(sessionId: string, userId?: string) {
    const history = await prisma.aIChatHistory.findMany({
      where: { sessionId },
      take: 1,
    });

    if (history.length > 0) {
      const sessionOwner = history[0].userId;
      if (sessionOwner && sessionOwner !== userId) {
        throw new AppError('Unauthorized: You do not have permission to delete this chat session.', StatusCodes.FORBIDDEN);
      }
    }

    await prisma.aIChatHistory.deleteMany({
      where: { sessionId },
    });
    return { message: 'Chat history cleared successfully.' };
  }

  private generateFallbackResponse(query: string): string {
    const q = query.toLowerCase();
    if (q.includes('pip')) {
      return `A **pip** (percentage in point) is the smallest price move that a given exchange rate makes based on market convention. Most currency pairs are priced to four decimal places, where a single pip is 0.0001 (for JPY pairs, it is 0.01).\n\n*Disclaimer: Forex trading carries a high level of risk and may not be suitable for all investors.*`;
    }
    if (q.includes('leverage')) {
      return `**Leverage** allows you to control a larger trade size using a smaller margin deposit. For example, 1:100 leverage means for every $1 you deposit, you can trade $100 in market value. While leverage magnifies potential gains, it also equally magnifies risk of loss.\n\n*Risk Warning: High leverage can lead to rapid capital loss. Practice risk management using stop losses.*`;
    }
    if (q.includes('broker') || q.includes('spread')) {
      return `At **EdutradeFX**, you can compare institutional and retail brokers by regulation, minimum deposit, platforms (MT4/MT5/cTrader), and spreads. Check out our **Brokers** tab in the main menu to evaluate licensed providers.\n\n*EdutradeFX provides educational and comparative information only.*`;
    }
    return `Welcome to **EdutradeFX Assistant**! I can help guide you through Forex fundamentals, technical indicators (RSI, MACD), risk management frameworks, and our platform's educational courses and verified signal providers. What concept would you like to explore today?\n\n*Notice: Forex trading involves substantial risk of loss. Always practice disciplined risk control.*`;
  }
}

export const aiService = new AIService();
