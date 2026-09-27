'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function InertiaMassExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const velocity = useRef({ vx: 0, vy: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

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

  const updateInertia = useCallback(() => {
    if (telemetry.isCompleted || !posRef.current || !mousePos.current) return;

    const k = 0.045;
    const friction = 0.88;

    const ax = (mousePos.current.x - posRef.current.x) * k;
    const ay = (mousePos.current.y - posRef.current.y) * k;

    velocity.current.vx = (velocity.current.vx + ax) * friction;
    velocity.current.vy = (velocity.current.vy + ay) * friction;

    if (Math.abs(velocity.current.vx) > 7 || Math.abs(velocity.current.vy) > 7) {
      registerFrictionEvent();
    }

    const nextX = posRef.current.x + velocity.current.vx;
    const nextY = posRef.current.y + velocity.current.vy;
    posRef.current = { x: nextX, y: nextY };
    recordMovement(nextX, nextY);
    setPos({ x: nextX, y: nextY });
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    if (telemetry.isCompleted) return;
    const id = setInterval(updateInertia, 16);
    return () => clearInterval(id);
  }, [updateInertia, telemetry.isCompleted]);

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
          transform: pos ? `translate(${pos.x - 11}px, ${pos.y - 11}px)` : 'translate(-100px, -100px)',
          opacity: pos ? 1 : 0,
        }}
        className="pointer-events-none fixed left-0 top-0 h-6 w-6 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-xl z-[9999] transition-opacity duration-75"
      />
    </div>
  );
}
