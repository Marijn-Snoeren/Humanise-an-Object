'use client';

import React, { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { EXPERIMENTS_REGISTRY } from '@/experiments/registry';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryHud } from '@/components/laboratory/telemetry-hud';
import { saveTelemetryRun } from '@/lib/telemetry-storage';

import ViscousDrag from '@/experiments/01-viscous-drag';
import MagneticRepulsion from '@/experiments/02-magnetic-repulsion';
import FragileIce from '@/experiments/03-ice-break-speed-limit';
import PneumaticPress from '@/experiments/04-pressure-chamber';
import DecisionTremor from '@/experiments/05-decision-tremor';
import SurfaceCorrugation from '@/experiments/06-surface-corrugation';
import InertiaMass from '@/experiments/07-inertia-mass';
import ElasticTether from '@/experiments/08-elastic-tether';
import EvasiveTarget from '@/experiments/09-evasive-target';
import MechanicalGate from '@/experiments/10-mechanical-gate';
import { ExperimentProps } from '@/experiments/types';

const COMPONENTS_MAP: Record<string, React.ComponentType<ExperimentProps>> = {
  '01-viscous-drag': ViscousDrag,
  '02-magnetic-repulsion': MagneticRepulsion,
  '03-ice-break-speed-limit': FragileIce,
  '04-pressure-chamber': PneumaticPress,
  '05-decision-tremor': DecisionTremor,
  '06-surface-corrugation': SurfaceCorrugation,
  '07-inertia-mass': InertiaMass,
  '08-elastic-tether': ElasticTether,
  '09-evasive-target': EvasiveTarget,
  '10-mechanical-gate': MechanicalGate,
};

export default function LabExperimentPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : '';

  const metadata = EXPERIMENTS_REGISTRY.find((e) => e.slug === slug);
  const ExperimentComponent = COMPONENTS_MAP[slug];

  const [isCalibrated, setIsCalibrated] = useState(false);
  const [initCursor, setInitCursor] = useState<{ x: number; y: number } | null>(null);

  const {
    telemetry,
    recordMovement,
    registerFrictionEvent,
    completeExperiment,
    resetTelemetry,
  } = useTelemetry();

  if (!metadata || !ExperimentComponent) {
    notFound();
  }

  const handlePointerUpdate = (e: React.PointerEvent) => {
    if (!isCalibrated) {
      setInitCursor({ x: e.clientX, y: e.clientY });
    }
  };

  const handleStartCalibration = (e: React.MouseEvent) => {
    setIsCalibrated(true);
    recordMovement(e.clientX, e.clientY);
  };

  const handleSuccess = () => {
    completeExperiment();
    saveTelemetryRun({
      experimentSlug: metadata.slug,
      experimentId: metadata.id,
      experimentTitle: metadata.title,
      timeToTargetMs: telemetry.timeToTargetMs,
      cursorDistancePx: telemetry.cursorDistancePx,
      movementEfficiencyRatio: telemetry.movementEfficiencyRatio,
      frictionEvents: telemetry.frictionEvents,
    });
  };

  const handleFullReset = () => {
    setIsCalibrated(false);
    resetTelemetry();
  };

  return (
    <main
      onPointerMove={handlePointerUpdate}
      onPointerDown={handlePointerUpdate}
      className="relative h-screen w-screen bg-[#e8ebe6] overflow-hidden select-none"
      style={{ cursor: 'none' }}
    >
      <style jsx global>{`
        *, *::before, *::after {
          cursor: none !important;
        }
      `}</style>

      <div className="absolute top-8 left-8 z-50 pointer-events-auto">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0e0f0c] shadow-sm hover:bg-[#c5edab] transition"
          >
            &larr; Overview
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0e0f0c] shadow-sm hover:bg-[#c5edab] transition"
          >
            Dashboard
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0e0f0c]">
            {metadata.title}
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#868685]">
            {metadata.subtitle}
          </p>
        </div>
      </div>

      <div className="absolute top-8 right-8 z-50 pointer-events-auto">
        <TelemetryHud
          telemetry={telemetry}
          onReset={handleFullReset}
        />
      </div>

      {!isCalibrated ? (
        <div className="relative flex h-full w-full flex-col items-center justify-end pb-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-semibold text-[#868685] uppercase tracking-wider">
              Move your cursor below to begin the trial from the calibrated baseline
            </p>
            <button
              onClick={handleStartCalibration}
              className="rounded-[24px] bg-[#0e0f0c] text-[#9fe870] px-10 py-5 font-bold text-sm tracking-tight shadow-md hover:bg-[#163300] active:scale-95 transition pointer-events-auto"
            >
              [ CLICK TO START EXPERIMENT ]
            </button>
          </div>

          <div
            style={{
              transform: initCursor
                ? `translate(${initCursor.x - 9}px, ${initCursor.y - 9}px)`
                : 'translate(-100px, -100px)',
              opacity: initCursor ? 1 : 0,
            }}
            className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999] transition-opacity duration-75"
          />
        </div>
      ) : (
        <div className="h-full w-full">
          <ExperimentComponent
            onSuccess={handleSuccess}
            registerFrictionEvent={registerFrictionEvent}
            recordMovement={recordMovement}
            telemetry={telemetry}
            onResetToGate={() => {
              setIsCalibrated(false);
              resetTelemetry();
            }}
          />
        </div>
      )}
    </main>
  );
}
