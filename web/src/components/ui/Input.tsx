"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            input
            bg-[var(--bg-elevated)]
            border-2 border-[var(--border-base)]
            text-[var(--text-primary)]
            rounded-[var(--radius-md)]
            px-4 py-3
            w-full
            min-h-[48px]
            text-base
            transition-all duration-[var(--transition-fast)]
            hover:border-[var(--primary-light)]
            focus:border-[var(--primary)]
            focus:outline-none
            focus:shadow-[var(--focus-ring)]
            ${error ? "border-[var(--error)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
