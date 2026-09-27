export interface StoredTelemetryRun {
  id: string;
  experimentSlug: string;
  experimentId: string;
  experimentTitle: string;
  timestamp: number;
  timeToTargetMs: number;
  cursorDistancePx: number;
  movementEfficiencyRatio: number;
  frictionEvents: number;
}

const STORAGE_KEY = 'friction_lab_telemetry_runs';

export function saveTelemetryRun(run: Omit<StoredTelemetryRun, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;

  const current = getStoredTelemetryRuns();
  const newEntry: StoredTelemetryRun = {
    ...run,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...current]));
  } catch (e) {
    console.error('Failed to store telemetry:', e);
  }
}

export function getStoredTelemetryRuns(): StoredTelemetryRun[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearStoredTelemetryRuns() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
