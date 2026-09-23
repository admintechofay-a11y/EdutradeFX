'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Award,
  RotateCcw,
  X,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mockData';

export default function LessonPlayerPage({
  params,
}: {
  params: { courseSlug: string; lessonId: string };
}) {
  const course = MOCK_COURSES.find((c) => c.slug === params.courseSlug) || MOCK_COURSES[0];
  const [activeTab, setActiveTab] = useState<'video' | 'guide'>('video');
  const [completed, setCompleted] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  // Quiz state
  const quizQuestions = [
    {
      question: 'In the currency pair GBP/USD = 1.3000, what is the base currency?',
      options: ['USD (US Dollar)', 'GBP (British Pound)', 'Both equally', 'Neither'],
      correctIndex: 1,
      explanation: 'The first currency in any forex pair is the base currency. In GBP/USD, GBP is the base currency.',
    },
    {
      question: 'If you believe the Japanese Yen will strengthen against the US Dollar, which action should you take on USD/JPY?',
      options: ['Buy (Go Long) USD/JPY', 'Sell (Go Short) USD/JPY', 'Hold USD/JPY', 'None of the above'],
      correctIndex: 1,
      explanation: 'If the quote currency (JPY) strengthens, it takes fewer USD to buy JPY, meaning USD/JPY will decline. Therefore, you should sell (short) USD/JPY.',
    },
    {
      question: 'What is 1 standard lot in currency units?',
      options: ['1,000 units', '10,000 units', '100,000 units', '1,000,000 units'],
      correctIndex: 2,
      explanation: 'A standard lot in forex represents 100,000 units of the base currency.',
    },
  ];

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[qIndex] = optIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score >= 70) {
      setCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          href={`/education/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {course.title}
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuizModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            Take Module Quiz
          </button>

          <button
            onClick={() => setCompleted(!completed)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
              completed
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-brand-surface border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {completed ? 'Lesson Completed' : 'Mark as Complete'}
          </button>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Video / Content Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'video'
                  ? 'bg-amber-500 text-brand-darkest'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Video Lesson
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-brand-darkest'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Written Lesson Guide
            </button>
          </div>

          {activeTab === 'video' ? (
            <div className="space-y-4">
              {/* Responsive 16:9 Video Embed */}
              <div className="rounded-2xl overflow-hidden aspect-video bg-black border border-slate-800 shadow-2xl relative">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&rel=0"
                  title="Lesson Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 rounded-xl bg-brand-card border border-slate-800 space-y-2">
                <h2 className="text-base font-bold text-white">
                  Lesson 1: How Currencies Are Traded — The Base and Quote Pair
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  In this session, we break down the structure of exchange rates, explaining why currencies trade in pairs, how spreads are quoted by ECN liquidity pools, and how to calculate profit using contract sizes.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl glass-card border border-slate-800 p-6 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
              <h2 className="text-xl font-bold text-white">
                Understanding the Currency Pair Structure
              </h2>

              <p>
                In the Foreign Exchange (Forex) market, currencies are never traded in isolation.
                Whenever you enter a position, you are simultaneously{' '}
                <strong className="text-amber-400">buying one currency while selling another</strong>.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs">
                <code>
                  EUR / USD = 1.08500<br />
                  [Base Currency] / [Quote Currency] = [Exchange Rate]
                </code>
              </div>

              <h3 className="text-base font-bold text-white pt-2">1. The Base Currency</h3>
              <p>
                The first currency listed is always the <strong>Base currency</strong>. In EUR/USD, the
                base currency is the Euro. The base currency always mathematically represents{' '}
                <strong>1 unit</strong>.
              </p>

              <h3 className="text-base font-bold text-white pt-2">2. The Quote Currency</h3>
              <p>
                The second currency listed is the <strong>Quote currency</strong> (or counter currency).
                It indicates how much of the quote currency is required to purchase 1 unit of the base
                currency.
              </p>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <span className="font-bold block">Worked Example:</span>
                <p>
                  You buy 1 standard lot (100,000 EUR) at <strong>1.08500</strong>. The price rallies to{' '}
                  <strong>1.09200</strong>.<br />
                  Price change: <code className="font-bold">+0.00700 (70 pips)</code><br />
                  Profit: <code className="font-bold">70 pips × $10 per pip = $700 USD</code>.
                </p>
              </div>
            </div>
          )}

          {/* Navigation between lessons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-800 cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Lesson
            </button>

            <button
              onClick={() => setQuizModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-brand-darkest hover:from-amber-400 transition-all flex items-center gap-1.5 shadow-glow-gold"
            >
              Take Quiz to Advance
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Course Curriculum Playlist */}
        <div className="space-y-6">
          <div className="rounded-2xl glass-card border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Course Syllabus</h3>
              <span className="badge-green text-[10px]">
                {completed ? '1/4 Completed' : '0/4 Completed'}
              </span>
            </div>

            <div className="space-y-3">
              {course.modules?.map((mod: any, mIdx: number) => (
                <div key={mIdx} className="space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {mod.title}
                  </span>

                  <div className="space-y-1.5 pl-2 border-l border-slate-800">
                    {mod.lessons?.map((les: any, lIdx: number) => (
                      <div
                        key={lIdx}
                        className={`p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          lIdx === 0
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {completed && lIdx === 0 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono ml-2">
                          {les.durationMinutes}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-brand-card border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="badge-gold text-[10px]">Module 1 Assessment</span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Currency Pairs & Mechanics Knowledge Check
                </h3>
              </div>
              <button
                onClick={() => setQuizModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-100">
                    {qIdx + 1}. {q.question}
                  </h4>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = 'border-slate-700 bg-brand-surface text-slate-300 hover:border-slate-500';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-300';
                        }
                      } else if (isSelected) {
                        btnStyle = 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${btnStyle}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quiz Result & Footer */}
            {quizSubmitted ? (
              <div className="p-5 rounded-2xl bg-brand-surface border border-slate-700 space-y-3 text-center">
                <span className="text-xs uppercase font-bold text-slate-400">Your Score:</span>
                <div
                  className={`text-3xl font-black ${
                    quizScore >= 70 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {quizScore}%{' '}
                  <span className="text-sm font-normal text-slate-400">
                    ({quizScore >= 70 ? 'PASSED' : 'TRY AGAIN'})
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {quizScore >= 70
                    ? 'You demonstrated a strong grasp of currency pairs. This lesson has been marked as complete.'
                    : 'Passing score is 70%. Review the explanations above and try again to unlock progress.'}
                </p>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetQuiz}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 hover:text-white flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry Quiz
                  </button>
                  <button
                    onClick={() => setQuizModalOpen(false)}
                    className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 text-brand-darkest shadow-glow-gold"
                  >
                    Continue Course
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuizSubmit}
                  disabled={selectedAnswers.filter((a) => a !== undefined).length < quizQuestions.length}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-brand-darkest disabled:opacity-50 transition-all shadow-glow-gold"
                >
                  Submit Answers
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
