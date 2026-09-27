const fs = require('fs');
const path = require('path');

function save(relPath, content) {
  const full = path.join(process.cwd(), relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trimStart(), 'utf8');
  console.log('✓ Updated:', relPath);
}

// Exp 02 - Magnetic Repulsion
save('experiments/02-magnetic-repulsion/index.tsx', `'use client';

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
  const [pos, setPos] = useState({ x: 500, y: 700 });
  const posRef = useRef({ x: 500, y: 700 });
  const mousePos = useRef({ x: 500, y: 700 });

  useEffect(() => {
    const handlePointerve = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted]);

  const updatePhysics = useCallback(() => {
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
      if (telemetry.isCompleted || !buttonRef.current) return;
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
        style={{ transform: "translate(" + (pos.x - 9) + "px, " + (pos.y - 9) + "px)" }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999]"
      />
    </div>
  );
}
`);

// Exp 04 - Pneumatic Press
save('experiments/04-pressure-chamber/index.tsx', `'use client';

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
  const [pos, setPos] = useState({ x: 500, y: 700 });
  const posRef = useRef({ x: 500, y: 700 });
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
      if (telemetry.isCompleted || !buttonRef.current) return;

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
          label={"HOLD PRESSURE (" + Math.round(pressure) + "%)"}
        />
        <div className="h-2.5 w-64 rounded-full bg-white p-0.5 shadow-sm border border-[#c5edab]">
          <div
            style={{ width: pressure + "%" }}
            className="h-full rounded-full bg-[#0e0f0c] transition-all duration-75"
          />
        </div>
      </div>

      <div
        style={{ transform: "translate(" + (pos.x - 9) + "px, " + (pos.y - 9) + "px)" }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999]"
      />
    </div>
  );
}
`);

// Exp 05 - Decision Tremor
save('experiments/05-decision-tremor/index.tsx', `'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function DecisionTremorExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 500, y: 700 });
  const posRef = useRef({ x: 500, y: 700 });
  const rawPos = useRef({ x: 500, y: 700 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      rawPos.current = { x: e.clientX, y: e.clientY };
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted]);

  const applyJitter = useCallback(() => {
    if (telemetry.isCompleted) {
      posRef.current = rawPos.current;
      setPos(rawPos.current);
      return;
    }

    if (!buttonRef.current) return;

    const b = buttonRef.current.getBoundingClientRect();
    const center = { x: b.left + b.width / 2, y: b.top + b.height / 2 };

    const dist = Math.hypot(rawPos.current.x - center.x, rawPos.current.y - center.y);
    const zone = 220;

    let jx = 0;
    let jy = 0;

    if (dist < zone) {
      registerFrictionEvent();
      const intensity = (1 - dist / zone) * 18;
      jx = (Math.random() - 0.5) * intensity;
      jy = (Math.random() - 0.5) * intensity;
    }

    const nextX = rawPos.current.x + jx;
    const nextY = rawPos.current.y + jy;
    posRef.current = { x: nextX, y: nextY };
    recordMovement(nextX, nextY);
    setPos({ x: nextX, y: nextY });
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const id = setInterval(applyJitter, 16);
    return () => clearInterval(id);
  }, [applyJitter]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (telemetry.isCompleted || !buttonRef.current) return;
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
        style={{ transform: "translate(" + (pos.x - 9) + "px, " + (pos.y - 9) + "px)" }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999]"
      />
    </div>
  );
}
`);

// Exp 06 - Surface Corrugation
save('experiments/06-surface-corrugation/index.tsx', `'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function SurfaceCorrugationExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 500, y: 700 });
  const posRef = useRef({ x: 500, y: 700 });
  const STEP = 28;

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
        return;
      }

      const snappedX = Math.round(e.clientX / STEP) * STEP;
      const snappedY = Math.round(e.clientY / STEP) * STEP;

      if (snappedX !== posRef.current.x || snappedY !== posRef.current.y) {
        registerFrictionEvent();
      }

      posRef.current = { x: snappedX, y: snappedY };
      recordMovement(snappedX, snappedY);
      setPos({ x: snappedX, y: snappedY });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (telemetry.isCompleted || !buttonRef.current) return;
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
    <div
      style={{
        backgroundImage: 'radial-gradient(circle, #c5edab 1.5px, transparent 1.5px)',
        backgroundSize: STEP + 'px ' + STEP + 'px',
      }}
      className="relative flex h-full w-full items-center justify-center bg-[#e8ebe6]"
    >
      <StandardButton
        ref={buttonRef}
        isSuccess={telemetry.isCompleted}
      />
      <div
        style={{ transform: "translate(" + (pos.x - 9) + "px, " + (pos.y - 9) + "px)" }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999]"
      />
    </div>
  );
}
`);

// Exp 07 - Inertia Mass
save('experiments/07-inertia-mass/index.tsx', `'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function InertiaMassExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 500, y: 700 });
  const posRef = useRef({ x: 500, y: 700 });
  const mousePos = useRef({ x: 500, y: 700 });
  const velocity = useRef({ vx: 0, vy: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted]);

  const updateInertia = useCallback(() => {
    if (telemetry.isCompleted) {
      posRef.current = mousePos.current;
      setPos(mousePos.current);
      return;
    }

    const k = 0.045;
    const friction = 0.88;

    const ax = (mousePos.current.x - posRef.current.x) * k;
    const ay = (mousePos.current.y - posRef.current.y) * k;

    velocity.current.vx = (velocity.current.vx + ax) * friction;
    velocity.current.vy = (velocity.current.vy + ay) * friction;

    if (Math.abs(velocity.current.vx) > 7 || Math.abs(velocity.current.vy) > 7) {
      registerFrictionEvent();
    }

    const nextX = posRef.current.x + velocity.current.vx;
    const nextY = posRef.current.y + velocity.current.vy;
    posRef.current = { x: nextX, y: nextY };
    recordMovement(nextX, nextY);
    setPos({ x: nextX, y: nextY });
  }, [telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const id = setInterval(updateInertia, 16);
    return () => clearInterval(id);
  }, [updateInertia]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (telemetry.isCompleted || !buttonRef.current) return;
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
        style={{ transform: "translate(" + (pos.x - 11) + "px, " + (pos.y - 11) + "px)" }}
        className="pointer-events-none fixed left-0 top-0 h-6 w-6 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-xl z-[9999]"
      />
    </div>
  );
}
`);

// Exp 08 - Elastic Tether (Gekalibreerde veerspanning: goed voelbaar EN bereikbaar)
save('experiments/08-elastic-tether/index.tsx', `'use client';

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
  const [pos, setPos] = useState({ x: 500, y: 700 });
  const posRef = useRef({ x: 500, y: 700 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const mousePos = useRef({ x: 500, y: 700 });
  const [anchor, setAnchor] = useState({ x: 500, y: 800 });
  const [tensionRate, setTensionRate] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const a = { x: window.innerWidth / 2, y: window.innerHeight - 30 };
      setAnchor(a);
      setPos(a);
      posRef.current = a;
      mousePos.current = a;
    }
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (telemetry.isCompleted) {
        posRef.current = { x: e.clientX, y: e.clientY };
        setPos({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [telemetry.isCompleted]);

  const updateSpringPhysics = useCallback(() => {
    if (telemetry.isCompleted) {
      posRef.current = mousePos.current;
      setPos(mousePos.current);
      return;
    }

    const cur = posRef.current;
    const target = mousePos.current;
    const anc = anchor;

    const distFromAnchor = Math.hypot(cur.x - anc.x, cur.y - anc.y);
    setTensionRate(Math.min(1, distFromAnchor / 400));

    // Trekkracht van de gebruiker (krachtig genoeg om de knop te bereiken)
    const pullX = (target.x - cur.x) * 0.22;
    const pullY = (target.y - cur.y) * 0.22;

    // Elastische weerstand: trekt terug, maar vlakt subtiel af nabij maximum rek
    const tetherX = (anc.x - cur.x) * 0.055;
    const tetherY = (anc.y - cur.y) * 0.055;

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
    const id = setInterval(updateSpringPhysics, 16);
    return () => clearInterval(id);
  }, [updateSpringPhysics]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (telemetry.isCompleted || !buttonRef.current) return;
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

      <StandardButton
        ref={buttonRef}
        isSuccess={telemetry.isCompleted}
      />

      <div
        style={{ transform: "translate(" + (pos.x - 9) + "px, " + (pos.y - 9) + "px)" }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999]"
      />
    </div>
  );
}
`);

// Exp 09 - Evasive Target
save('experiments/09-evasive-target/index.tsx', `'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ExperimentProps } from '../types';
import { StandardButton } from '@/components/laboratory/standard-button';

export default function EvasiveTargetExperiment({
  onSuccess,
  registerFrictionEvent,
  recordMovement,
  telemetry,
}: ExperimentProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 500, y: 700 });
  const posRef = useRef({ x: 500, y: 700 });
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setCursorPos({ x: e.clientX, y: e.clientY });

      if (telemetry.isCompleted) return;

      recordMovement(e.clientX, e.clientY);

      const btnCenter = {
        x: window.innerWidth / 2 + btnOffset.x,
        y: window.innerHeight / 2 + btnOffset.y,
      };

      const dist = Math.hypot(e.clientX - btnCenter.x, e.clientY - btnCenter.y);

      if (dist < 150) {
        registerFrictionEvent();
        const angle = Math.atan2(btnCenter.y - e.clientY, btnCenter.x - e.clientX);
        const push = (150 - dist) * 0.45;
        setBtnOffset((prev) => ({
          x: Math.max(-140, Math.min(140, prev.x + Math.cos(angle) * push)),
          y: Math.max(-100, Math.min(100, prev.y + Math.sin(angle) * push)),
        }));
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [btnOffset, telemetry.isCompleted, registerFrictionEvent, recordMovement]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (telemetry.isCompleted || !buttonRef.current) return;
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
      <div style={{ transform: "translate(" + btnOffset.x + "px, " + btnOffset.y + "px)" }}>
        <StandardButton
          ref={buttonRef}
          isSuccess={telemetry.isCompleted}
        />
      </div>

      <div
        style={{ transform: "translate(" + (cursorPos.x - 9) + "px, " + (cursorPos.y - 9) + "px)" }}
        className="pointer-events-none fixed left-0 top-0 h-4 w-4 rounded-full bg-[#0e0f0c] ring-4 ring-[#9fe870] shadow-md z-[9999]"
      />
    </div>
  );
}
`);

console.log('\n✨ Klaar! Alle experimenten hebben nu 1-op-1 besturing na succes en het elastiek is perfect bereikbaar.');
