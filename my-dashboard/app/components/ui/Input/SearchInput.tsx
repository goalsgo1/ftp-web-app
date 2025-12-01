'use client';

import { InputHTMLAttributes } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Input } from './Input';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput = ({ 
  onSearch,
  className = '',
  ...props 
}: SearchInputProps) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        className="pl-10"
        onChange={(e) => {
          props.onChange?.(e);
          onSearch?.(e.target.value);
        }}
        {...props}
      />
    </div>
  );
};

