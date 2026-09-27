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
    const handleMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });

      if (!telemetry.isCompleted) {
        recordMovement(e.clientX, e.clientY);
      }
    };

    const handleDown = (e: MouseEvent | PointerEvent) => {
      isMouseDown.current = true;
      if (!posRef.current) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleUp = () => {
      isMouseDown.current = false;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [telemetry.isCompleted, recordMovement]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (telemetry.isCompleted) return;

      const curPos = posRef.current;
      const btn = buttonRef.current;

      let isOver = false;
      if (btn && curPos) {
        const b = btn.getBoundingClientRect();
        // Ruime hitbox rond de knop
        isOver =
          curPos.x >= b.left - 10 &&
          curPos.x <= b.right + 10 &&
          curPos.y >= b.top - 10 &&
          curPos.y <= b.bottom + 10;
      }

      if (isMouseDown.current && isOver) {
        const next = Math.min(100, pressureRef.current + 2.2);
        pressureRef.current = next;
        setPressure(next);

        if (next >= 100) {
          onSuccess();
        }
      } else {
        if (pressureRef.current > 0) {
          registerFrictionEvent();
          const decayed = Math.max(0, pressureRef.current - 4.5);
          pressureRef.current = decayed;
          setPressure(decayed);
        }
      }
    }, 20);

    return () => clearInterval(timer);
  }, [telemetry.isCompleted, onSuccess, registerFrictionEvent]);

  return (
    <div
      onPointerDown={() => {
        isMouseDown.current = true;
      }}
      onPointerUp={() => {
        isMouseDown.current = false;
      }}
      className="relative flex h-full w-full items-center justify-center bg-[#e8ebe6]"
    >
      <div className="flex flex-col items-center gap-4">
        <StandardButton
          ref={buttonRef}
          isSuccess={telemetry.isCompleted}
          label={
            isMouseDown.current && pressure > 0
              ? `COMPRESSING (${Math.round(pressure)}%)`
              : 'HOLD DOWN TO COMPRESS'
          }
        />
        <div className="h-3 w-72 rounded-full bg-white p-0.5 shadow-sm border border-[#c5edab] overflow-hidden">
          <div
            style={{ width: `${pressure}%` }}
            className="h-full rounded-full bg-[#0e0f0c] transition-all duration-75"
          />
        </div>
        <p className="text-[11px] font-semibold tracking-wider text-[#868685] uppercase">
          {telemetry.isCompleted
            ? 'HYDRAULIC PRESSURE DISCHARGED'
            : 'Click and hold down the button until charge reaches 100%'}
        </p>
      </div>

      <div
        style={{
          transform: pos
            ? `translate(${pos.x - 9}px, ${pos.y - 9}px)`
            : 'translate(-100px, -100px)',
          opacity: pos ? 1 : 0,
        }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999] transition-opacity duration-75"
      />
    </div>
  );
}
