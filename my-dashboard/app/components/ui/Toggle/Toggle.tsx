'use client';

import { useState } from 'react';
import { toggleSizes } from '@/styles/variants';
import { ToggleSize } from '@/types/ui.types';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: ToggleSize;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const Toggle = ({ 
  checked,
  onChange,
  size = 'md',
  disabled = false,
  label,
  className = '' 
}: ToggleProps) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const sizeClasses = toggleSizes[size];
  const thumbSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const thumbTranslate = checked 
    ? (size === 'sm' ? 'translate-x-5' : size === 'md' ? 'translate-x-6' : 'translate-x-7')
    : 'translate-x-0';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          {label}
        </label>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        className={`
          ${sizeClasses}
          ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
          relative inline-flex items-center rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span
          className={`
            ${thumbSize}
            ${thumbTranslate}
            bg-white rounded-full shadow-sm
            transform transition-transform duration-200
          `}
        />
      </button>
    </div>
  );
};

