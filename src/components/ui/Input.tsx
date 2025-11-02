import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface InputProps {
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  pattern?: string;
  title?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  required = false,
  disabled = false,
  className = '',
  maxLength,
  pattern,
  title,
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          pattern={pattern}
          title={title}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${RightIcon ? 'pr-12' : 'pr-4'} py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all text-white placeholder-white/40 disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <RightIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;