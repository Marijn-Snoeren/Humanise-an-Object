'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { TelemetryData } from '@/experiments/types';

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    timeToTargetMs: 0,
    cursorDistancePx: 0,
    straightLineDistancePx: 0,
    movementEfficiencyRatio: 1.0,
    frictionEvents: 0,
    isCompleted: false,
    hasStarted: false,
  });

  const startTimeRef = useRef<number | null>(null);
  const totalDistanceRef = useRef(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const frictionEventsRef = useRef(0);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      if (startTimeRef.current && !isCompletedRef.current) {
        const elapsed = Math.round(performance.now() - startTimeRef.current);
        const dist = totalDistanceRef.current;
        const targetPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const straightLine = startPosRef.current
          ? Math.hypot(targetPos.x - startPosRef.current.x, targetPos.y - startPosRef.current.y)
          : 300;

        const mer = dist > 0 ? Math.min(1, straightLine / dist) : 1;

        setTelemetry((prev) => ({
          ...prev,
          timeToTargetMs: elapsed,
          cursorDistancePx: Math.round(dist),
          movementEfficiencyRatio: Number(mer.toFixed(3)),
          frictionEvents: frictionEventsRef.current,
          hasStarted: true,
        }));
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const recordMovement = useCallback((x: number, y: number) => {
    if (isCompletedRef.current) return;

    const now = performance.now();
    if (!startTimeRef.current) {
      startTimeRef.current = now;
      startPosRef.current = { x, y };
      lastPosRef.current = { x, y };
      return;
    }

    if (lastPosRef.current) {
      const step = Math.hypot(x - lastPosRef.current.x, y - lastPosRef.current.y);
      if (step > 0.5) {
        totalDistanceRef.current += step;
        lastPosRef.current = { x, y };
      }
    }
  }, []);

  const registerFrictionEvent = useCallback(() => {
    if (isCompletedRef.current) return;
    frictionEventsRef.current += 1;
  }, []);

  const completeExperiment = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;

    const finalElapsed = startTimeRef.current
      ? Math.round(performance.now() - startTimeRef.current)
      : 0;
    const finalDist = totalDistanceRef.current;
    const targetPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const straightLine = startPosRef.current
      ? Math.hypot(targetPos.x - startPosRef.current.x, targetPos.y - startPosRef.current.y)
      : 300;

    const finalMer =
      finalDist > 0 ? Number((straightLine / finalDist).toFixed(3)) : 1;

    setTelemetry((prev) => ({
      ...prev,
      timeToTargetMs: finalElapsed,
      cursorDistancePx: Math.round(finalDist),
      movementEfficiencyRatio: finalMer,
      frictionEvents: frictionEventsRef.current,
      isCompleted: true,
    }));
  }, []);

  const resetTelemetry = useCallback(() => {
    startTimeRef.current = null;
    totalDistanceRef.current = 0;
    lastPosRef.current = null;
    startPosRef.current = null;
    frictionEventsRef.current = 0;
    isCompletedRef.current = false;

    setTelemetry({
      timeToTargetMs: 0,
      cursorDistancePx: 0,
      straightLineDistancePx: 0,
      movementEfficiencyRatio: 1.0,
      frictionEvents: 0,
      isCompleted: false,
      hasStarted: false,
    });
  }, []);

  return {
    telemetry,
    recordMovement,
    registerFrictionEvent,
    completeExperiment,
    resetTelemetry,
  };
}
