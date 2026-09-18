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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-glow hover:scale-105 transition-all duration-300"
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
          </span>
        </button>
      )}

      {/* Slide-Up Chat Panel */}
      {isOpen && (
        <div className="flex flex-col w-[360px] sm:w-[400px] h-[520px] rounded-2xl glass-modal shadow-2xl border border-slate-700/80 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-gray-100">Forex AI Mentor</h4>
                  <Sparkles size={13} className="text-amber-400" />
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">Online & Ready</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                title="Clear Chat"
                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-md transition-colors"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-slate-800/80 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-800/90 text-gray-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs sm:text-sm">{m.content}</p>
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-gray-300 shrink-0 mt-0.5">
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-gray-400 text-xs bg-slate-800/50 p-2 rounded-lg w-fit border border-slate-700/40">
                <Bot size={14} className="text-blue-400 animate-spin" />
                <span>Analyzing trading knowledge base...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about pips, spreads, brokers..."
              className="flex-1 bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
