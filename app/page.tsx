'use client';

import React from 'react';
import Link from 'next/link';
import { EXPERIMENTS_REGISTRY } from '@/experiments/registry';

export default function LabOverviewPage() {
  return (
    <main className="min-h-screen bg-[#e8ebe6] text-[#0e0f0c] px-6 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              Humanize an object.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-[#454745] font-normal leading-relaxed">
              By embedding simulated friction, visceral resistance, and hesitation into the interface, the cursor is transformed from a sterile pointer into an embodied object with weight, vulnerability, and human-like physics.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-[24px] bg-white px-6 py-3 text-xs font-bold text-[#0e0f0c] shadow-sm hover:bg-[#c5edab] transition self-start md:self-auto shrink-0"
          >
            Dashboard
          </Link>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {EXPERIMENTS_REGISTRY.map((exp) => (
            <Link
              key={exp.slug}
              href={`/experiments/${exp.slug}`}
              className="group relative flex flex-col justify-between rounded-[24px] bg-white p-8 transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 border border-transparent hover:border-[#c5edab]"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#868685] uppercase tracking-wider">
                  Experiment {exp.id.replace('EXP-', '')}
                </span>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-[#0e0f0c]">
                  {exp.title}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#868685]">
                  {exp.subtitle}
                </p>
                <p className="mt-3 text-sm text-[#454745] leading-relaxed">
                  {exp.description}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-[#e8ebe6]/70">
                <span className="w-full block text-center rounded-[24px] bg-[#9fe870] py-3.5 text-sm font-bold text-[#0e0f0c] transition group-hover:bg-[#cdffad]">
                  Start test &rarr;
                </span>
              </div>
            </Link>
          ))}
        </section>

        <footer className="mt-20 border-t border-[#c5edab]/60 pt-8 text-xs font-medium text-[#868685]">
          Designing Friction Framework &bull; Academic HCI Research &bull; Humanize an object
        </footer>
      </div>
    </main>
  );
}
