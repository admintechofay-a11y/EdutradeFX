'use client';

import React, { useMemo, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (isStrong: boolean, score: number) => void;
}

export function evaluatePasswordStrength(password: string) {
  const criteria = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', met: /[0-9]/.test(password) },
    { id: 'special', label: 'One special symbol (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let score = 0;
  let label = 'Very Weak';
  let color = 'bg-red-500';
  let textColor = 'text-red-600';

  if (!password) {
    score = 0;
    label = '';
  } else if (password.length < 8 || metCount <= 2) {
    score = 1;
    label = 'Weak';
    color = 'bg-red-500';
    textColor = 'text-red-500';
  } else if (metCount === 3) {
    score = 2;
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-500';
  } else if (metCount === 4) {
    score = 3;
    label = 'Good';
    color = 'bg-blue';
    textColor = 'text-blue';
  } else {
    score = 4;
    label = 'Strong';
    color = 'bg-green';
    textColor = 'text-green';
  }

  // A password is safe to submit if score >= 3 (Good or Strong, with length >= 8, uppercase, number, special)
  const isSufficient = score >= 3 && password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);

  return { criteria, metCount, score, label, color, textColor, isSufficient };
}

export default function PasswordStrengthMeter({ password, onStrengthChange }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(strength.isSufficient, strength.score);
    }
  }, [strength.isSufficient, strength.score, onStrengthChange]);

  if (!password) {
    return (
      <div className="mt-2 text-[11px] text-text-muted">
        Must contain 8+ characters with uppercase, lowercase, numbers & special symbols.
      </div>
    );
  }

  return (
    <div className="mt-2.5 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted text-[11px] font-medium">Password Strength:</span>
          <span className={`font-bold text-[11px] uppercase tracking-wider ${strength.textColor}`}>
            {strength.label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                strength.score >= step ? strength.color : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
        {strength.criteria.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-1.5 transition-colors ${
              c.met ? 'text-green font-medium' : 'text-text-muted'
            }`}
          >
            {c.met ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-green" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0 text-slate-300" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
