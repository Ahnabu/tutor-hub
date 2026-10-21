'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  hasError?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into an array of characters
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  // Auto-focus first empty box on mount if enabled
  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const inputValue = e.target.value;

    // Filter only digits
    const cleanDigits = inputValue.replace(/\D/g, '');

    if (!cleanDigits) {
      // User erased
      const newDigits = [...digits];
      newDigits[index] = '';
      const updatedValue = newDigits.join('').slice(0, length);
      onChange(updatedValue);
      return;
    }

    if (cleanDigits.length > 1) {
      // Multiple characters typed / autofilled
      const chars = cleanDigits.split('');
      const newDigits = [...digits];
      for (let i = 0; i < chars.length && index + i < length; i++) {
        newDigits[index + i] = chars[i];
      }
      const updatedValue = newDigits.join('').slice(0, length);
      onChange(updatedValue);

      const nextFocus = Math.min(index + cleanDigits.length, length - 1);
      inputRefs.current[nextFocus]?.focus();

      if (updatedValue.length === length) {
        onComplete?.(updatedValue);
      }
      return;
    }

    // Single digit entered
    const char = cleanDigits[cleanDigits.length - 1];
    const newDigits = [...digits];
    newDigits[index] = char;
    const updatedValue = newDigits.join('').slice(0, length);
    onChange(updatedValue);

    // Auto-advance to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when last digit is filled
    if (updatedValue.length === length) {
      onComplete?.(updatedValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Current is empty, delete previous and move back
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (digits[index]) {
        // Clear current
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const cleanNumbers = pastedText.replace(/\D/g, '').slice(0, length);

    if (cleanNumbers.length > 0) {
      onChange(cleanNumbers);
      const targetFocus = Math.min(cleanNumbers.length, length - 1);
      inputRefs.current[targetFocus]?.focus();

      if (cleanNumbers.length === length) {
        onComplete?.(cleanNumbers);
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 my-2">
      {digits.map((digit, index) => {
        const isFilled = !!digit;
        const showDivider = index === 3 && length === 6;

        return (
          <React.Fragment key={index}>
            {showDivider && (
              <div className="flex items-center justify-center px-0.5 text-slate-500 font-bold select-none text-sm opacity-60">
                •
              </div>
            )}
            <div className="relative group">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{1}"
                maxLength={1}
                value={digit}
                disabled={disabled}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl transition-all duration-200 outline-none select-none
                  ${
                    disabled
                      ? 'bg-slate-900/40 text-slate-500 border border-white/[0.04] cursor-not-allowed opacity-60'
                      : hasError
                      ? 'bg-rose-950/20 text-rose-300 border-2 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : isFilled
                      ? 'bg-emerald-950/20 text-emerald-300 border-2 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] scale-[1.02]'
                      : 'bg-slate-950/60 text-white border border-white/[0.1] hover:border-white/[0.2] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:scale-[1.05] focus:bg-slate-900/80'
                  }
                `}
                aria-label={`Digit ${index + 1} of ${length}`}
              />
              {/* Bottom active accent dot */}
              {isFilled && !hasError && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
