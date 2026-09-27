'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function ElasticTetherExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const velRef = useRef({ vx: 0, vy: 0 });
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const [anchor, setAnchor] = useState({ x: 500, y: 800 });
  const [tensionRate, setTensionRate] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAnchor({ x: window.innerWidth / 2, y: window.innerHeight - 30 });
    }
  }, []);

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

  const updateSpringPhysics = useCallback(() => {
    if (telemetry.isCompleted || !posRef.current || !mousePos.current) return;

    const cur = posRef.current;
    const target = mousePos.current;
    const anc = anchor;

    const distFromAnchor = Math.hypot(cur.x - anc.x, cur.y - anc.y);
    setTensionRate(Math.min(1, distFromAnchor / 400));

    const pullX = (target.x - cur.x) * 0.24;
    const pullY = (target.y - cur.y) * 0.24;

    const tetherX = (anc.x - cur.x) * 0.05;
    const tetherY = (anc.y - cur.y) * 0.05;

    const damping = 0.72;
    velRef.current.vx = (velRef.current.vx + pullX + tetherX) * damping;
    velRef.current.vy = (velRef.current.vy + pullY + tetherY) * damping;

    const nextX = cur.x + velRef.current.vx;
    const nextY = cur.y + velRef.current.vy;

    if (distFromAnchor > 120) {
      registerFrictionEvent();
    }

    posRef.current = { x: nextX, y: nextY };
    recordMovement(nextX, nextY);
    setPos({ x: nextX, y: nextY });
  }, [anchor, telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    if (telemetry.isCompleted) return;
    const id = setInterval(updateSpringPhysics, 16);
    return () => clearInterval(id);
  }, [updateSpringPhysics, telemetry.isCompleted]);

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
      {!telemetry.isCompleted && pos && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <line
            x1={anchor.x}
            y1={anchor.y}
            x2={pos.x}
            y2={pos.y}
            stroke={tensionRate > 0.5 ? '#0e0f0c' : '#454745'}
            strokeWidth={Math.max(2, 5 - tensionRate * 2.5)}
            strokeDasharray={tensionRate > 0.6 ? 'none' : '6 6'}
          />
          <circle cx={anchor.x} cy={anchor.y} r="7" fill="#0e0f0c" />
        </svg>
      )}

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
