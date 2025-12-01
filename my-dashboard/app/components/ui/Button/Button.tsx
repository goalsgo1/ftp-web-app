'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { buttonVariants, buttonSizes } from '@/styles/variants';
import { ButtonVariant, ButtonSize } from '@/types/ui.types';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props 
}: ButtonProps) => {
  return (
    <button
      className={`
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
};

