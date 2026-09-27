'use client';

import React from 'react';
import { TelemetryData } from '@/experiments/types';

interface TelemetryHudProps {
  telemetry: TelemetryData;
  onReset: () => void;
  metadataFormula?: string;
}

export function TelemetryHud({ telemetry, onReset }: TelemetryHudProps) {
  return (
    <aside className="w-64 rounded-[24px] bg-white p-6 text-xs text-[#0e0f0c] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#e8ebe6]">
      <div className="flex items-center justify-between border-b border-[#e8ebe6] pb-3">
        <span className="font-extrabold tracking-wider text-[11px] text-[#454745] uppercase">TELEMETRY</span>
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            telemetry.isCompleted
              ? 'bg-[#2ead4b]'
              : telemetry.hasStarted
              ? 'bg-[#9fe870] animate-pulse'
              : 'bg-[#c5edab]'
          }`}
        />
      </div>

      <div className="mt-4 space-y-3 font-medium">
        <div className="flex justify-between border-b border-[#e8ebe6]/70 pb-1.5">
          <span className="text-[#868685]">Status</span>
          <span className="font-bold">
            {telemetry.isCompleted ? 'Completed' : telemetry.hasStarted ? 'Active' : 'Ready'}
          </span>
        </div>

        <div className="flex justify-between border-b border-[#e8ebe6]/70 pb-1.5">
          <span className="text-[#868685]">Time</span>
          <span className="font-bold font-mono">{telemetry.timeToTargetMs} ms</span>
        </div>

        <div className="flex justify-between border-b border-[#e8ebe6]/70 pb-1.5">
          <span className="text-[#868685]">Distance</span>
          <span className="font-bold font-mono">{telemetry.cursorDistancePx} px</span>
        </div>

        <div className="flex justify-between border-b border-[#e8ebe6]/70 pb-1.5">
          <span className="text-[#868685]">Efficiency</span>
          <span className="font-bold font-mono">{telemetry.movementEfficiencyRatio} MER</span>
        </div>

        <div className="flex justify-between pb-1">
          <span className="text-[#868685]">Friction</span>
          <span className="font-bold font-mono text-[#0e0f0c]">{telemetry.frictionEvents}</span>
        </div>
      </div>

      <div className="mt-5 pt-2">
        <button
          onClick={onReset}
          className="w-full rounded-[24px] bg-[#e8ebe6] py-2.5 font-bold text-xs text-[#0e0f0c] transition hover:bg-[#c5edab] active:scale-[0.98]"
        >
          Reset test
        </button>
      </div>
    </aside>
  );
}
