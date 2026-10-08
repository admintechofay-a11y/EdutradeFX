'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2, Bot, Sparkles, User as UserIcon } from 'lucide-react';
import { api } from '../../lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem('edutrade_ai_session');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('edutrade_ai_session', sid);
    }
    setSessionId(sid);

    // Initial greeting
    setMessages([
      {
        role: 'assistant',
        content:
          '👋 Hello! I am your **EdutradeFX Trading Assistant**.\n\nAsk me about Forex terminology, broker comparisons, risk management, or our verified trading education courses!',
      },
    ]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: userText,
        sessionId,
      });

      if (res.data?.data?.message) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.data.message },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ I encountered a temporary connection issue. Please make sure the backend server is running and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (sessionId) {
      try {
        await api.delete(`/ai/history/${sessionId}`);
      } catch {}
    }
    setMessages([
      {
        role: 'assistant',
        content: 'Chat history cleared. How can I help you today?',
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue hover:bg-blue-hover text-white shadow-lift hover:scale-105 transition-all duration-300"
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={22} className="sm:hidden" />
          <MessageSquare size={24} className="hidden sm:block" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange"></span>
          </span>
        </button>
      )}

      {/* Slide-Up Chat Panel (Light Theme with Blue Header & Orange Send Button) */}
      {isOpen && (
        <div className="flex flex-col w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px] h-[min(520px,calc(100dvh-90px))] rounded-2xl bg-white shadow-lift border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Blue Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-blue text-white shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">Forex AI Mentor</h4>
                  <Sparkles size={13} className="text-orange-200" />
                </div>
                <p className="text-[11px] text-emerald-200 font-medium">Online & Ready</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Clear Chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed text-xs sm:text-sm shadow-sm ${
                    m.role === 'user'
                      ? 'bg-blue text-white rounded-br-none'
                      : 'bg-white text-text-heading border border-border rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-text-heading shrink-0 mt-0.5">
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-text-muted text-xs bg-white p-2.5 rounded-xl w-fit border border-border shadow-sm">
                <Bot size={14} className="text-blue animate-spin" />
                <span>Analyzing trading knowledge base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box with Orange Send Button */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about pips, spreads, brokers..."
              className="flex-1 bg-slate-50 border border-border rounded-full px-4 py-2 text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send Message"
              className="w-9 h-9 rounded-full bg-orange hover:bg-orange-hover text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
