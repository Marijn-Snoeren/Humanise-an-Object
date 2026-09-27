'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function DecisionTremorExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const rawPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      rawPos.current = { x: e.clientX, y: e.clientY };

      if (!posRef.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }

      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted]);

  const applyJitter = useCallback(() => {
    if (telemetry.isCompleted || !posRef.current || !rawPos.current) return;

    if (!buttonRef.current) return;

    const b = buttonRef.current.getBoundingClientRect();
    const center = { x: b.left + b.width / 2, y: b.top + b.height / 2 };

    const dist = Math.hypot(rawPos.current.x - center.x, rawPos.current.y - center.y);
    const zone = 220;

    let jx = 0;
    let jy = 0;

    if (dist < zone) {
      registerFrictionEvent();
      const intensity = (1 - dist / zone) * 18;
      jx = (Math.random() - 0.5) * intensity;
      jy = (Math.random() - 0.5) * intensity;
    }

    const nextX = rawPos.current.x + jx;
    const nextY = rawPos.current.y + jy;
    posRef.current = { x: nextX, y: nextY };
    recordMovement(nextX, nextY);
    setPos({ x: nextX, y: nextY });
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    if (telemetry.isCompleted) return;
    const id = setInterval(applyJitter, 16);
    return () => clearInterval(id);
  }, [applyJitter, telemetry.isCompleted]);

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
