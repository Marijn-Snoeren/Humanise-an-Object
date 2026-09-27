'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function SurfaceCorrugationExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const STEP = 28;

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
        return;
      }

      const snappedX = Math.round(e.clientX / STEP) * STEP;
      const snappedY = Math.round(e.clientY / STEP) * STEP;

      if (posRef.current && (snappedX !== posRef.current.x || snappedY !== posRef.current.y)) {
        registerFrictionEvent();
      }

      posRef.current = { x: snappedX, y: snappedY };
      recordMovement(snappedX, snappedY);
      setPos({ x: snappedX, y: snappedY });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

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
    <div
      style={{
        backgroundImage: 'radial-gradient(circle, #c5edab 1.5px, transparent 1.5px)',
        backgroundSize: `${STEP}px ${STEP}px`,
      }}
      className="relative flex h-full w-full items-center justify-center bg-[#e8ebe6]"
    >
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
