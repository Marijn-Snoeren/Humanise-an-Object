'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function EvasiveTargetExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });

      if (telemetry.isCompleted) return;

      recordMovement(e.clientX, e.clientY);

      const btnCenter = {
        x: window.innerWidth / 2 + btnOffset.x,
        y: window.innerHeight / 2 + btnOffset.y,
      };

      const dist = Math.hypot(e.clientX - btnCenter.x, e.clientY - btnCenter.y);

      if (dist < 150) {
        registerFrictionEvent();
        const angle = Math.atan2(btnCenter.y - e.clientY, btnCenter.x - e.clientX);
        const push = (150 - dist) * 0.45;
        setBtnOffset((prev) => ({
          x: Math.max(-140, Math.min(140, prev.x + Math.cos(angle) * push)),
          y: Math.max(-100, Math.min(100, prev.y + Math.sin(angle) * push)),
        }));
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [btnOffset, telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (telemetry.isCompleted || !buttonRef.current || !posRef.current) return;
      const b = buttonRef.current.getBoundingClientRect();
      const curX = posRef.current.x;
      const curY = posRef.current.y;

      if (curX >= b.left && curX <= b.right && curY >= b.top && curY <= b.bottom) {
        onSuccess();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [telemetry.isCompleted, onSuccess]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#e8ebe6]">
      <div style={{ transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)` }}>
        <StandardButton
          ref={buttonRef}
          isSuccess={telemetry.isCompleted}
        />
      </div>

      <div
        style={{
          transform: cursorPos ? `translate(${cursorPos.x - 9}px, ${cursorPos.y - 9}px)` : 'translate(-100px, -100px)',
          opacity: cursorPos ? 1 : 0,
        }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999] transition-opacity duration-75"
      />
    </div>
  );
}
