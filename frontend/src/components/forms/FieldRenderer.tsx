'use client';

import React from 'react';
import { CategoryFormFieldItem } from '../../types';
import FileDropzone from './FileDropzone';
import RichTextEditor from './RichTextEditor';
import LocationSelect from './LocationSelect';
import CountryMultiSelect from './CountryMultiSelect';
import ScheduleInput from './ScheduleInput';
import MoneyInput from './MoneyInput';
import StatusOrValueInput from './StatusOrValueInput';
import ClaimBadge from './ClaimBadge';
import { Country } from 'country-state-city';

interface FieldRendererProps {
  field: CategoryFormFieldItem;
  value: any;
  onChange: (val: any) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  disabled?: boolean;
  isVerified?: boolean;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  otherValue = '',
  onOtherChange,
  disabled = false,
  isVerified = false,
}) => {
  const isRequired = field.required;
  const options = Array.isArray(field.options) ? field.options : [];
  const hasOther = field.allowOther;
  const isOtherSelected =
    value === 'OTHER' ||
    value === 'Other' ||
    (Array.isArray(value) && (value.includes('OTHER') || value.includes('Other')));

  const renderInput = () => {
    switch (field.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={field.helpText || 'Enter response...'}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            rows={3}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={field.helpText || 'Enter details...'}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          />
        );

      case 'RICH_TEXT':
        return (
          <RichTextEditor
            value={value ?? ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={field.helpText}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            step="any"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            disabled={disabled}
            placeholder="0"
            className="w-full sm:w-48 px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          />
        );

      case 'NUMBER_UNIT':
        return (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden w-full sm:w-72 bg-white focus-within:border-blue-500">
            <input
              type="number"
              step="any"
              value={value?.amount ?? value ?? ''}
              onChange={(e) =>
                onChange({
                  amount: e.target.value ? Number(e.target.value) : '',
                  unit: value?.unit || field.unitOptions?.[0] || '',
                })
              }
              disabled={disabled}
              placeholder="0"
              className="flex-1 px-3.5 py-2 text-sm text-slate-900 focus:outline-none disabled:bg-slate-50"
            />
            {field.unitOptions && field.unitOptions.length > 0 && (
              <select
                value={value?.unit || field.unitOptions[0]}
                onChange={(e) =>
                  onChange({
                    amount: value?.amount ?? value ?? '',
                    unit: e.target.value,
                  })
                }
                disabled={disabled}
                className="px-3 py-2 text-xs bg-slate-50 text-slate-700 font-semibold border-l border-slate-200 focus:outline-none"
              >
                {field.unitOptions.map((u: string) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            )}
          </div>
        );

      case 'PERCENT':
        return (
          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden w-36 bg-white focus-within:border-blue-500">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
              disabled={disabled}
              placeholder="0.00"
              className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-none disabled:bg-slate-50"
            />
            <span className="px-3 py-2 bg-slate-50 text-slate-500 text-xs font-bold border-l border-slate-200">
              %
            </span>
          </div>
        );

      case 'MONEY':
        return (
          <MoneyInput
            value={typeof value === 'object' ? value : { amount: value }}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case 'SINGLE_SELECT':
        return (
          <div className="space-y-2">
            <select
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
            >
              <option value="">Select option...</option>
              {options.map((opt: any) => {
                const optVal = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                return (
                  <option key={optVal} value={optVal}>
                    {optLabel}
                  </option>
                );
              })}
              {hasOther && <option value="OTHER">Other (Please specify)</option>}
            </select>
            {hasOther && isOtherSelected && (
              <input
                type="text"
                value={otherValue}
                onChange={(e) => onOtherChange?.(e.target.value)}
                disabled={disabled}
                placeholder="Please specify..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        );

      case 'MULTI_SELECT':
        const selectedArr: string[] = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50/60 rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
              {options.map((opt: any) => {
                const optVal = typeof opt === 'string' ? opt : opt.value;
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isChecked = selectedArr.includes(optVal);
                return (
                  <label
                    key={optVal}
                    className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={disabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onChange([...selectedArr, optVal]);
                        } else {
                          onChange(selectedArr.filter((item) => item !== optVal));
                        }
                      }}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{optLabel}</span>
                  </label>
                );
              })}
              {hasOther && (
                <label className="flex items-start gap-2 text-xs text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedArr.includes('OTHER')}
                    disabled={disabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedArr, 'OTHER']);
                      } else {
                        onChange(selectedArr.filter((item) => item !== 'OTHER'));
                      }
                    }}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Other (Please specify)</span>
                </label>
              )}
            </div>
            {hasOther && selectedArr.includes('OTHER') && (
              <input
                type="text"
                value={otherValue}
                onChange={(e) => onOtherChange?.(e.target.value)}
                disabled={disabled}
                placeholder="Please specify other option..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        );

      case 'YES_NO':
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                checked={value === true || value === 'Yes'}
                onChange={() => onChange(true)}
                disabled={disabled}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                checked={value === false || value === 'No'}
                onChange={() => onChange(false)}
                disabled={disabled}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span>No</span>
            </label>
          </div>
        );

      case 'YES_NO_DETAILS':
        const valObj = typeof value === 'object' ? value : { answer: value, details: '' };
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name={field.key}
                  checked={valObj.answer === true || valObj.answer === 'Yes'}
                  onChange={() => onChange({ ...valObj, answer: true })}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name={field.key}
                  checked={valObj.answer === false || valObj.answer === 'No'}
                  onChange={() => onChange({ ...valObj, answer: false })}
                  disabled={disabled}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>No</span>
              </label>
            </div>
            {valObj.answer && (
              <textarea
                rows={2}
                value={valObj.details || ''}
                onChange={(e) => onChange({ ...valObj, details: e.target.value })}
                disabled={disabled}
                placeholder="Please describe..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            )}
          </div>
        );

      case 'TRI_STATE':
        const triOptions = options.length > 0 ? options : ['Yes', 'No', 'On request'];
        return (
          <div className="flex flex-wrap gap-3">
            {triOptions.map((opt: any) => {
              const optVal = typeof opt === 'string' ? opt : opt.value;
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              return (
                <label key={optVal} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name={field.key}
                    value={optVal}
                    checked={value === optVal}
                    onChange={() => onChange(optVal)}
                    disabled={disabled}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{optLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'URL':
        return (
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder="https://..."
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          />
        );

      case 'COUNTRY_SINGLE':
        const countries = Country.getAllCountries();
        return (
          <select
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 disabled:bg-slate-50"
          >
            <option value="">Select country...</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        );

      case 'COUNTRY_MULTI':
        return (
          <CountryMultiSelect
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case 'LOCATION':
        return (
          <LocationSelect
            value={typeof value === 'object' ? value : {}}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case 'SCHEDULE':
        return (
          <ScheduleInput
            value={typeof value === 'object' ? value : {}}
            onChange={onChange}
            disabled={disabled}
          />
        );

      case 'FILE':
      case 'FILE_MULTI':
        return (
          <FileDropzone
            value={value}
            onFileSelect={onChange}
            onRemove={() => onChange(null)}
            disabled={disabled}
          />
        );

      case 'STATUS_OR_VALUE':
        return (
          <StatusOrValueInput
            value={typeof value === 'object' ? value : { mode: 'VALUE', value }}
            onChange={onChange}
            disabled={disabled}
            statuses={field.statuses}
          />
        );

      case 'REPEATABLE_GROUP':
        const items = Array.isArray(value) ? value : [{}];
        const subfields = field.repeatable?.fields || [];
        return (
          <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 relative">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Entry #{idx + 1}</span>
                  {items.length > 1 && !disabled && (
                    <button
                      type="button"
                      onClick={() => onChange(items.filter((_: any, i: number) => i !== idx))}
                      className="text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subfields.map((sf: any) => (
                    <div key={sf.key}>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">{sf.label}</label>
                      <input
                        type="text"
                        value={item[sf.key] || ''}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx] = { ...updated[idx], [sf.key]: e.target.value };
                          onChange(updated);
                        }}
                        disabled={disabled}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange([...items, {}])}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add another entry
              </button>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg"
          />
        );
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-800">
          {field.label} {isRequired && <span className="text-red-500">*</span>}
        </label>
        {field.claim === 'VERIFIABLE' ? (
          <ClaimBadge isVerified={isVerified} claimType="VERIFIABLE" size="sm" />
        ) : (
          <ClaimBadge isVerified={false} claimType="DECLARED" size="sm" />
        )}
      </div>

      {field.helpText && <p className="text-xs text-slate-500">{field.helpText}</p>}

      <div className="mt-1">{renderInput()}</div>
    </div>
  );
};

export default FieldRenderer;

