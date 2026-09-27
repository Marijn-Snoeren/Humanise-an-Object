export interface TelemetryData {
  timeToTargetMs: number;
  cursorDistancePx: number;
  straightLineDistancePx: number;
  movementEfficiencyRatio: number;
  frictionEvents: number;
  isCompleted: boolean;
  hasStarted: boolean;
}

export interface ExperimentMetadata {
  slug: string;
  id: string;
  title: string;
  subtitle: string;
  theoryCategory: 'Motoric' | 'Intentional' | 'Affective' | 'Deliberative';
  formula: string;
  description: string;
}

export interface ExperimentProps {
  onSuccess: () => void;
  registerFrictionEvent: () => void;
  recordMovement: (x: number, y: number) => void;
  telemetry: TelemetryData;
  onResetToGate?: () => void;
}
