'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function SpeedLimitExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
  onResetToGate,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const lastMousePos = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
        return;
      }

      if (!posRef.current || !lastMousePos.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
        lastMousePos.current = { x: e.clientX, y: e.clientY, t: Date.now() };
        return;
      }

      const now = Date.now();
      const dt = Math.max(0.001, (now - lastMousePos.current.t) / 1000);
      const dist = Math.hypot(e.clientX - lastMousePos.current.x, e.clientY - lastMousePos.current.y);
      const speed = dist / dt;

      lastMousePos.current = { x: e.clientX, y: e.clientY, t: now };

      if (speed > 480 && dist > 12) {
        registerFrictionEvent();
        if (onResetToGate) {
          onResetToGate();
        }
        return;
      }

      posRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
      recordMovement(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement, onResetToGate]);

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
      <StandardButton
        ref={buttonRef}
        isSuccess={telemetry.isCompleted}
      />
      <div
        style={{
          transform: pos ? `translate(${pos.x - 9}px, ${pos.y - 9}px)` : 'translate(-100px, -100px)',
          opacity: pos ? 1 : 0,
        }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999] transition-opacity duration-75"
      />
    </div>
  );
}
