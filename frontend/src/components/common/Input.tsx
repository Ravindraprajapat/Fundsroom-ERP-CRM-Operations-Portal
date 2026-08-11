import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Input({ label, error, required, className = '', id, ...props }: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[#1F2933] mb-1">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:border-transparent ${
          error ? 'border-[#DC2626]' : 'border-[#D9DEE3]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Select({ label, error, required, className = '', id, children, ...props }: SelectProps) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-[#1F2933] mb-1">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:border-transparent ${
          error ? 'border-[#DC2626]' : 'border-[#D9DEE3]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function TextArea({ label, error, required, className = '', id, ...props }: TextAreaProps) {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-semibold text-[#1F2933] mb-1">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:border-transparent ${
          error ? 'border-[#DC2626]' : 'border-[#D9DEE3]'
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
}