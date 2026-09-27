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
  const isHoldingRef = useRef(false);
  const successCalledRef = useRef(false);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPos({ x: e.clientX, y: e.clientY });

      if (!telemetry.isCompleted) {
        recordMovement(e.clientX, e.clientY);
      }
    };

    const handleDown = () => {
      isHoldingRef.current = true;
    };

    const handleUp = () => {
      isHoldingRef.current = false;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    // Hoofd game-loop op vaste interval
    const interval = setInterval(() => {
      if (telemetry.isCompleted || successCalledRef.current) return;

      const curPos = posRef.current;
      const btn = buttonRef.current;

      let isOver = false;
      if (btn && curPos) {
        const b = btn.getBoundingClientRect();
        isOver =
          curPos.x >= b.left - 15 &&
          curPos.x <= b.right + 15 &&
          curPos.y >= b.top - 15 &&
          curPos.y <= b.bottom + 15;
      }

      if (isHoldingRef.current && isOver) {
        pressureRef.current = Math.min(100, pressureRef.current + 2.5);
        setPressure(pressureRef.current);

        if (pressureRef.current >= 100 && !successCalledRef.current) {
          successCalledRef.current = true;
          onSuccess();
        }
      } else {
        if (pressureRef.current > 0) {
          registerFrictionEvent();
          pressureRef.current = Math.max(0, pressureRef.current - 4);
          setPressure(pressureRef.current);
        }
      }
    }, 25);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      clearInterval(interval);
    };
  }, [telemetry.isCompleted, onSuccess, registerFrictionEvent, recordMovement]);

  return (
    <div
      onPointerDown={() => { isHoldingRef.current = true; }}
      onPointerUp={() => { isHoldingRef.current = false; }}
      className="relative flex h-full w-full items-center justify-center bg-[#e8ebe6]"
    >
      <div className="flex flex-col items-center gap-4">
        <StandardButton
          ref={buttonRef}
          isSuccess={telemetry.isCompleted}
          label={
            pressure > 0
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
            : 'Click and hold down on the button to build pressure to 100%'}
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
