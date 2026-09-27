'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function MechanicalGateExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const barrierY = typeof window !== 'undefined' ? window.innerHeight / 2 + 20 : 420;

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
        return;
      }

      if (!unlocked && e.clientY < barrierY) {
        registerFrictionEvent();
        posRef.current = { x: e.clientX, y: barrierY };
        setPos({ x: e.clientX, y: barrierY });
        recordMovement(e.clientX, barrierY);
        return;
      }

      posRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });
      recordMovement(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [unlocked, barrierY, telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (telemetry.isCompleted || !buttonRef.current || !posRef.current) return;
      const b = buttonRef.current.getBoundingClientRect();
      const curX = posRef.current.x;
      const curY = posRef.current.y;

      if (unlocked && curX >= b.left && curX <= b.right && curY >= b.top && curY <= b.bottom) {
        onSuccess();
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [telemetry.isCompleted, unlocked, onSuccess]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#e8ebe6]">
      {!unlocked && (
        <div
          style={{ top: `${barrierY}px` }}
          className="absolute w-full border-t-4 border-[#0e0f0c] transition-opacity duration-200"
        />
      )}

      <div className="absolute top-[28%] flex flex-col items-center">
        <StandardButton
          ref={buttonRef}
          isSuccess={telemetry.isCompleted}
        />
      </div>

      {!unlocked && (
        <div className="absolute bottom-[24%] flex flex-col items-center">
          <button
            onClick={() => setUnlocked(true)}
            className="rounded-[24px] bg-[#0e0f0c] text-[#9fe870] px-8 py-3.5 font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#163300] active:scale-95 transition pointer-events-auto"
          >
            UNLOCK GATE FIRST
          </button>
        </div>
      )}

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
