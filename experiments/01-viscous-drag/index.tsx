'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function ViscousDragExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const rawTarget = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!posRef.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
      rawTarget.current = { x: e.clientX, y: e.clientY };

      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted]);

  const updateLoop = useCallback(() => {
    if (!posRef.current || !rawTarget.current) return;

    const targetX = rawTarget.current.x;
    const targetY = rawTarget.current.y;

    if (telemetry.isCompleted) {
      posRef.current = { x: targetX, y: targetY };
      setPos({ x: targetX, y: targetY });
      return;
    }

    if (!buttonRef.current) return;

    const b = buttonRef.current.getBoundingClientRect();
    const btnCenterX = b.left + b.width / 2;
    const btnCenterY = b.top + b.height / 2;

    const currentDist = Math.hypot(posRef.current.x - btnCenterX, posRef.current.y - btnCenterY);
    const zoneRadius = 260;

    let lerp = 0.28;
    if (currentDist < zoneRadius) {
      registerFrictionEvent();
      const norm = currentDist / zoneRadius;
      lerp = 0.015 + (0.28 - 0.015) * Math.pow(norm, 2);
    }

    const nextX = posRef.current.x + (targetX - posRef.current.x) * lerp;
    const nextY = posRef.current.y + (targetY - posRef.current.y) * lerp;

    posRef.current = { x: nextX, y: nextY };
    recordMovement(nextX, nextY);
    setPos({ x: nextX, y: nextY });
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const id = setInterval(updateLoop, 16);
    return () => clearInterval(id);
  }, [updateLoop]);

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
