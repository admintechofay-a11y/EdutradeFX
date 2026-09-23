'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronLeft,
  Award,
  HelpCircle,
} from 'lucide-react';
import { MOCK_COURSES } from '@/lib/mockData';

export default function CourseLessonViewerPage({
  params,
}: {
  params: { enrollmentId: string };
}) {
  const course = MOCK_COURSES[0];
  const lessons = [
    {
      id: 'l1',
      title: '1. How Currencies Are Traded: The Base and Quote Pair',
      duration: '18 min',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      completed: true,
      content: `
### Understanding the Currency Pair Structure

In the Foreign Exchange (Forex) market, currencies are never traded in isolation. Whenever you make a trade, you are simultaneously **buying one currency while selling another**.

A standard forex quote looks like this:
\`\`\`text
EUR / USD = 1.08500
[Base] / [Quote] = [Price]
\`\`\`

#### 1. The Base Currency
- The first currency listed is the **Base currency** (here, the Euro).
- The base currency always equals **1 unit**.

#### 2. The Quote Currency
- The second currency listed is the **Quote currency** (here, the US Dollar).
- The quote currency indicates how much of the quote currency is required to purchase 1 unit of the base currency.

#### Real-World Example:
If you buy 1 standard lot (100,000 EUR) at **1.08500** and the price rises to **1.09200**:
- Price Difference: \`1.09200 - 1.08500 = +0.00700\` (70 pips)
- Profit: \`70 pips * $10 per pip = $700 USD\`
      `,
    },
    {
      id: 'l2',
      title: '2. Demystifying Pips, Pipettes, and Point Value',
      duration: '22 min',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      completed: true,
      content: `
### What is a Pip in Forex?

A **Pip** stands for *"Percentage in Point"* or *"Price Interest Point"*. It is the standardized unit of measurement representing the smallest standard price move in a currency pair.

#### How to Calculate Pips:
- For 4-decimal currency pairs (like EUR/USD, GBP/USD):
  - 1 Pip = **0.0001**
  - If EUR/USD moves from 1.0850 to 1.0851, that is a 1 Pip move.
- For 2-decimal currency pairs (like USD/JPY):
  - 1 Pip = **0.01**
  - If USD/JPY moves from 155.20 to 155.21, that is a 1 Pip move.

#### Pipette (Fractional Pip):
Most contemporary ECN brokers (like IC Markets and Pepperstone) quote to 5 decimal places. The 5th decimal place is a **pipette** (1/10th of a pip).
      `,
    },
    {
      id: 'l3',
      title: '3. Leverage vs Margin: Calculating Requirements',
      duration: '25 min',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      completed: false,
      content: `
### Leverage: Amplifying Purchasing Power Safely

Leverage allows a trader to control a large nominal contract value with a relatively small initial deposit known as **Margin**.

#### Key Leverage Ratios:
- **1:100 Leverage**: Requires 1% margin. To trade $100,000 (1 standard lot), you need $1,000 margin.
- **1:500 Leverage**: Requires 0.2% margin. To trade $100,000, you only need $200 margin.

#### The Danger of Over-Leveraging:
While high leverage reduces required margin, it multiplies risk if your position sizing is careless. Always calculate position size based on dollar risk per stop-loss rather than account margin.
      `,
    },
    {
      id: 'l4',
      title: '4. Executing Your First Trade on MT5 / cTrader',
      duration: '30 min',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      completed: false,
      content: `
### Placing Orders: Market vs Limit & Stop Orders

In this practical lesson, we explore how to enter orders through MetaTrader 5 and cTrader:
1. **Market Execution**: Instant execution at current interbank bid/ask.
2. **Buy Limit / Sell Limit**: Entering at a more favorable price after a pullback.
3. **Buy Stop / Sell Stop**: Entering on a breakout through support or resistance.
4. **Setting Stop Loss (SL) & Take Profit (TP)** before hitting execute.
      `,
    },
  ];

  const [currentLessonIndex, setCurrentLessonIndex] = useState(2);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({
    l1: true,
    l2: true,
  });

  const activeLesson = lessons[currentLessonIndex];
  const isComplete = !!completedMap[activeLesson.id];

  const toggleComplete = () => {
    setCompletedMap((prev) => ({
      ...prev,
      [activeLesson.id]: !prev[activeLesson.id],
    }));
  };

  const totalLessons = lessons.length;
  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-semibold block">Course Progress</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {completedCount}/{totalLessons} Completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-24 sm:w-32 h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Lesson Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="rounded-3xl overflow-hidden border border-slate-800 bg-black aspect-video relative shadow-2xl">
            <iframe
              src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1"
              title={activeLesson.title}
              className="w-full h-full"
              allowFullScreen
            />
          </div>

          {/* Lesson Header & Mark Complete */}
          <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <span className="badge-regulation text-[10px]">{course.title}</span>
                <h1 className="text-xl sm:text-2xl font-black text-white">{activeLesson.title}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeLesson.duration}</span>
                </div>
              </div>

              <button
                onClick={toggleComplete}
                className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
                  isComplete
                    ? 'bg-emerald-500 text-brand-darkest shadow-glow-green'
                    : 'bg-brand-surface border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {isComplete ? 'Lesson Completed' : 'Mark as Complete'}
              </button>
            </div>

            {/* Lecture Notes */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {activeLesson.content}
            </div>

            {/* Next / Previous Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <button
                onClick={() => setCurrentLessonIndex((i) => Math.max(0, i - 1))}
                disabled={currentLessonIndex === 0}
                className="px-4 py-2 rounded-xl bg-brand-surface border border-slate-700 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Lesson
              </button>

              <button
                onClick={() =>
                  setCurrentLessonIndex((i) => Math.min(lessons.length - 1, i + 1))
                }
                disabled={currentLessonIndex === lessons.length - 1}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-darkest text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 shadow-glow-gold"
              >
                Next Lesson
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Curriculum List */}
        <div className="space-y-6">
          <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Curriculum Lessons
            </h2>

            <div className="space-y-2">
              {lessons.map((les, idx) => {
                const isActive = idx === currentLessonIndex;
                const done = !!completedMap[les.id];

                return (
                  <button
                    key={les.id}
                    onClick={() => setCurrentLessonIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-brand-surface/40 border-slate-800/80 hover:bg-brand-surface text-slate-300'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <PlayCircle
                          className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}
                        />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className={`text-xs font-semibold line-clamp-1 ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {les.title}
                      </p>
                      <span className="text-[10px] text-slate-500">{les.duration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Course Certificate
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete all lessons to generate your verified EduTradeFX Forex Foundation certificate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
