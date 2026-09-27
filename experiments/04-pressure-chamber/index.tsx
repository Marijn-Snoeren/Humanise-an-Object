'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function PneumaticPressExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const [pressure, setPressure] = useState(0);
  const pressureRef = useRef(0);
  const isMouseDown = useRef(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!telemetry.isCompleted) {
        recordMovement(e.clientX, e.clientY);
      }
      setPos({ x: e.clientX, y: e.clientY });
    };

    const handleDown = () => {
      isMouseDown.current = true;
    };

    const handleUp = () => {
      isMouseDown.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [telemetry.isCompleted, recordMovement]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (telemetry.isCompleted || !buttonRef.current || !posRef.current) return;

      const b = buttonRef.current.getBoundingClientRect();
      const curX = posRef.current.x;
      const curY = posRef.current.y;

      const isOverButton =
        curX >= b.left && curX <= b.right && curY >= b.top && curY <= b.bottom;

      if (isMouseDown.current && isOverButton) {
        const next = pressureRef.current + 2.5;
        if (next >= 100) {
          pressureRef.current = 100;
          setPressure(100);
          onSuccess();
          return;
        }
        pressureRef.current = next;
        setPressure(next);
      } else {
        if (pressureRef.current > 0) {
          registerFrictionEvent();
          const decayed = Math.max(0, pressureRef.current - 6);
          pressureRef.current = decayed;
          setPressure(decayed);
        }
      }
    }, 20);

    return () => clearInterval(timer);
  }, [telemetry.isCompleted, onSuccess, registerFrictionEvent]);

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#e8ebe6]">
      <div className="flex flex-col items-center gap-4">
        <StandardButton
          ref={buttonRef}
          isSuccess={telemetry.isCompleted}
          label={`HOLD PRESSURE (${Math.round(pressure)}%)`}
        />
        <div className="h-2.5 w-64 rounded-full bg-white p-0.5 shadow-sm border border-[#c5edab]">
          <div
            style={{ width: `${pressure}%` }}
            className="h-full rounded-full bg-[#0e0f0c] transition-all duration-75"
          />
        </div>
      </div>

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
