'use client';

import React from 'react';

interface StandardButtonProps {
  isSuccess: boolean;
  label?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const StandardButton = React.forwardRef<HTMLButtonElement, StandardButtonProps>(
  ({ isSuccess, label = 'CONFIRM ACTION', onClick, style }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        style={style}
        className={`h-16 px-10 rounded-[24px] font-bold text-base tracking-tight transition-all duration-200 select-none ${
          isSuccess
            ? 'bg-[#0e0f0c] text-[#9fe870] shadow-sm'
            : 'bg-[#9fe870] text-[#0e0f0c] hover:bg-[#cdffad] active:scale-[0.98]'
        }`}
      >
        {isSuccess ? 'ACTION COMPLETED' : label}
      </button>
    );
  }
);

StandardButton.displayName = 'StandardButton';
