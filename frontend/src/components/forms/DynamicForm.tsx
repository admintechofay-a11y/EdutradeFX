'use client';

import React, { useMemo } from 'react';
import { CategoryFormSectionItem, CategoryFormFieldItem } from '../../types';
import FieldRenderer from './FieldRenderer';

interface DynamicFormProps {
  sections: CategoryFormSectionItem[];
  answers: Record<string, any>;
  onAnswerChange: (key: string, value: any) => void;
  onOtherChange?: (key: string, otherVal: string) => void;
  disabled?: boolean;
  verifiedClaims?: string[];
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  sections,
  answers = {},
  onAnswerChange,
  onOtherChange,
  disabled = false,
  verifiedClaims = [],
}) => {
  // Evaluates visibleWhen rule
  const isFieldVisible = (field: CategoryFormFieldItem): boolean => {
    if (!field.visibleWhen) return true;
    const rule = field.visibleWhen;
    const targetVal = answers[rule.field];

    switch (rule.op) {
      case 'EQUALS':
        return targetVal === rule.value;
      case 'NOT_EQUALS':
        return targetVal !== rule.value;
      case 'IN':
        return Array.isArray(rule.value) && rule.value.includes(targetVal);
      case 'NOT_IN':
        return Array.isArray(rule.value) && !rule.value.includes(targetVal);
      case 'TRUTHY':
        return !!targetVal;
      case 'FALSY':
        return !targetVal;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const activeFields = (section.fields || []).filter(
          (f) => f.isActive && isFieldVisible(f)
        );

        if (activeFields.length === 0) return null;

        return (
          <div
            key={section.id || section.letter}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
          >
            {/* Section Header */}
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {section.letter}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {section.name}
                </h3>
              </div>
              {section.description && (
                <p className="text-xs text-slate-500 mt-1 ml-8">{section.description}</p>
              )}
            </div>

            {/* Field Grid */}
            <div className="grid grid-cols-1 gap-5">
              {activeFields.map((field) => {
                const isVerified = verifiedClaims.includes(field.key);
                return (
                  <div key={field.id || field.key} className="pt-1">
                    <FieldRenderer
                      field={field}
                      value={answers[field.key]}
                      onChange={(val) => onAnswerChange(field.key, val)}
                      otherValue={answers[`${field.key}__other`]}
                      onOtherChange={(val) => onOtherChange?.(`${field.key}__other`, val)}
                      disabled={disabled}
                      isVerified={isVerified}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DynamicForm;

