'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Check, Save, Loader2 } from 'lucide-react';
import StickyActionBar from '../ui/StickyActionBar';
import Button from '../ui/Button';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  isComplete?: boolean;
}

interface WizardShellProps {
  steps: WizardStep[];
  activeStepIndex: number;
  onStepChange?: (index: number) => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  onSubmit?: () => void;
  children: React.ReactNode;
  canProceed?: boolean;
  completionPercent?: number;
  className?: string;
}

export const WizardShell: React.FC<WizardShellProps> = ({
  steps,
  activeStepIndex,
  onStepChange,
  onSaveDraft,
  isSavingDraft = false,
  onNext,
  onPrevious,
  isSubmitting = false,
  isLastStep = false,
  onSubmit,
  children,
  canProceed = true,
  completionPercent,
  className = '',
}) => {
  const currentStep = steps[activeStepIndex];

  return (
    <div className={`space-y-6 pb-28 ${className}`}>
      {/* Top Header & Progress */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Step {activeStepIndex + 1} of {steps.length}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {currentStep?.title}
            </h1>
            {currentStep?.description && (
              <p className="text-sm text-slate-500 mt-1">{currentStep.description}</p>
            )}
          </div>

          {completionPercent !== undefined && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-xs text-slate-500">Overall Progress</span>
                <p className="text-base font-bold text-slate-800">{completionPercent}%</p>
              </div>
              <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isDone = step.isComplete;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange?.(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div>{children}</div>

      {/* Sticky Bottom Action Bar */}
      <StickyActionBar>
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-3">
          <div className="flex items-center gap-2">
            {activeStepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
            )}

            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSaveDraft}
                disabled={isSavingDraft}
                className="flex items-center gap-1.5 text-slate-700"
              >
                {isSavingDraft ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Draft</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onNext}
                disabled={!canProceed}
                className="flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onSubmit}
                disabled={!canProceed || isSubmitting}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Submit Application</span>
              </Button>
            )}
          </div>
        </div>
      </StickyActionBar>
    </div>
  );
};

export default WizardShell;

