'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { EXPERIMENTS_REGISTRY } from '@/experiments/registry';
import {
  getStoredTelemetryRuns,
  clearStoredTelemetryRuns,
  StoredTelemetryRun,
} from '@/lib/telemetry-storage';

export default function AnalyticsDashboardPage() {
  const [runs, setRuns] = useState<StoredTelemetryRun[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('all');

  useEffect(() => {
    setRuns(getStoredTelemetryRuns());
  }, []);

  const handleClear = () => {
    if (window.confirm('Clear all telemetry data?')) {
      clearStoredTelemetryRuns();
      setRuns([]);
    }
  };

  const handleExportCSV = () => {
    if (runs.length === 0) return;
    const headers = [
      'Date',
      'Experiment ID',
      'Experiment Title',
      'Time (ms)',
      'Distance (px)',
      'Efficiency (MER)',
      'Friction Events',
    ];

    const rows = runs.map((r) => [
      new Date(r.timestamp).toISOString(),
      r.experimentId,
      `"${r.experimentTitle}"`,
      r.timeToTargetMs,
      r.cursorDistancePx,
      r.movementEfficiencyRatio,
      r.frictionEvents,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `friction_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRuns = useMemo(() => {
    if (selectedSlug === 'all') return runs;
    return runs.filter((r) => r.experimentSlug === selectedSlug);
  }, [runs, selectedSlug]);

  const stats = useMemo(() => {
    if (filteredRuns.length === 0) {
      return { count: 0, avgTime: 0, avgMer: 0, totalFriction: 0 };
    }

    const totalTime = filteredRuns.reduce((acc, r) => acc + r.timeToTargetMs, 0);
    const totalMer = filteredRuns.reduce((acc, r) => acc + r.movementEfficiencyRatio, 0);
    const totalFriction = filteredRuns.reduce((acc, r) => acc + r.frictionEvents, 0);

    return {
      count: filteredRuns.length,
      avgTime: Math.round(totalTime / filteredRuns.length),
      avgMer: Number((totalMer / filteredRuns.length).toFixed(2)),
      totalFriction,
    };
  }, [filteredRuns]);

  return (
    <main className="min-h-screen bg-[#e8ebe6] text-[#0e0f0c] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[#0e0f0c] shadow-sm hover:bg-[#c5edab] transition mb-3"
            >
              &larr; Overview
            </Link>
            <h1 className="text-3xl font-black tracking-tight">Dashboard.</h1>
          </div>

          <div className="flex items-center gap-2">
            {runs.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="rounded-[24px] bg-[#9fe870] px-4 py-2 text-xs font-bold text-[#0e0f0c] hover:bg-[#cdffad] transition"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleClear}
                  className="rounded-[24px] bg-white px-4 py-2 text-xs font-bold text-[#868685] hover:text-[#d03238] transition"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="rounded-[20px] bg-white p-4 shadow-sm border border-[#e8ebe6]">
            <span className="text-[11px] font-semibold text-[#868685]">Runs</span>
            <p className="text-2xl font-black font-mono mt-1">{stats.count}</p>
          </div>
          <div className="rounded-[20px] bg-white p-4 shadow-sm border border-[#e8ebe6]">
            <span className="text-[11px] font-semibold text-[#868685]">Avg Time</span>
            <p className="text-2xl font-black font-mono mt-1">{stats.avgTime} <span className="text-xs font-normal">ms</span></p>
          </div>
          <div className="rounded-[20px] bg-white p-4 shadow-sm border border-[#e8ebe6]">
            <span className="text-[11px] font-semibold text-[#868685]">Avg MER</span>
            <p className="text-2xl font-black font-mono mt-1">{stats.avgMer}</p>
          </div>
          <div className="rounded-[20px] bg-white p-4 shadow-sm border border-[#e8ebe6]">
            <span className="text-[11px] font-semibold text-[#868685]">Friction</span>
            <p className="text-2xl font-black font-mono mt-1">{stats.totalFriction}</p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedSlug('all')}
            className={`rounded-full px-3 py-1 text-xs font-bold transition shrink-0 ${
              selectedSlug === 'all'
                ? 'bg-[#0e0f0c] text-[#9fe870]'
                : 'bg-white text-[#454745] hover:bg-[#c5edab]'
            }`}
          >
            All
          </button>
          {EXPERIMENTS_REGISTRY.map((exp) => (
            <button
              key={exp.slug}
              onClick={() => setSelectedSlug(exp.slug)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition shrink-0 ${
                selectedSlug === exp.slug
                  ? 'bg-[#0e0f0c] text-[#9fe870]'
                  : 'bg-white text-[#454745] hover:bg-[#c5edab]'
              }`}
            >
              {exp.id.replace('EXP-', '')}
            </button>
          ))}
        </div>

        <div className="rounded-[20px] bg-white shadow-sm border border-[#e8ebe6] overflow-hidden">
          {filteredRuns.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#868685]">
              No runs recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#e8ebe6] text-[11px] text-[#868685]">
                  <th className="py-3 px-5 font-semibold">Test</th>
                  <th className="py-3 px-5 font-semibold">Time</th>
                  <th className="py-3 px-5 font-semibold">Dist</th>
                  <th className="py-3 px-5 font-semibold">MER</th>
                  <th className="py-3 px-5 font-semibold">Friction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ebe6]/60">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-[#f9faf8] transition-colors">
                    <td className="py-2.5 px-5 font-bold">
                      <span className="font-mono text-[#868685] mr-2">{run.experimentId}</span>
                      {run.experimentTitle}
                    </td>
                    <td className="py-2.5 px-5 font-mono">{run.timeToTargetMs} ms</td>
                    <td className="py-2.5 px-5 font-mono">{run.cursorDistancePx} px</td>
                    <td className="py-2.5 px-5 font-mono">{run.movementEfficiencyRatio}</td>
                    <td className="py-2.5 px-5 font-mono font-bold text-[#0e0f0c]">{run.frictionEvents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
