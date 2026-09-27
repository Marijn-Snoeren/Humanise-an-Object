'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function MagneticRepulsionExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const mousePos = useRef<{ x: number; y: number } | null>(null);

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

  const updatePhysics = useCallback(() => {
    if (!posRef.current || !mousePos.current) return;

    const hwX = mousePos.current.x;
    const hwY = mousePos.current.y;

    if (telemetry.isCompleted) {
      posRef.current = { x: hwX, y: hwY };
      setPos({ x: hwX, y: hwY });
      return;
    }

    if (!buttonRef.current) return;

    const b = buttonRef.current.getBoundingClientRect();
    const center = { x: b.left + b.width / 2, y: b.top + b.height / 2 };

    const dx = posRef.current.x - center.x;
    const dy = posRef.current.y - center.y;
    const dist = Math.hypot(dx, dy);
    const radius = 220;

    let fx = 0;
    let fy = 0;

    if (dist < radius && dist > 1) {
      registerFrictionEvent();
      const force = Math.pow((radius - dist) / radius, 1.8) * 85;
      fx = (dx / dist) * force;
      fy = (dy / dist) * force;
    }

    const nextX = hwX + fx;
    const nextY = hwY + fy;

    posRef.current = { x: nextX, y: nextY };
    recordMovement(nextX, nextY);
    setPos({ x: nextX, y: nextY });
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const id = setInterval(updatePhysics, 16);
    return () => clearInterval(id);
  }, [updatePhysics]);

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
