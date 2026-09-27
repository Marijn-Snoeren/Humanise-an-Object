# Humanize an Object — Friction Lab

An empirical Human-Computer Interaction (HCI) research testbed on intentional interface friction.

---

## 1. General Information

Humanize an Object — Friction Lab is an experimental Human-Computer Interaction (HCI) research platform interrogating the dominant industry paradigm of frictionless design. Modern user interfaces prioritize immediate, effortless interactions, often reducing digital actions to thoughtless, automated habits.

This project investigates the reverse hypothesis: by embedding simulated physical friction, visceral resistance, and hesitation into pointer dynamics, the cursor transforms from a sterile screen coordinate into an embodied object with weight, vulnerability, and physical presence.

### Tech Stack
* Framework: Next.js (App Router)
* Language: TypeScript
* Styling: Tailwind CSS

### Design System
Inspired by the clean editorial aesthetic of the Wise design system:
* Soft Salie Canvas: #e8ebe6
* Ink Contrast: #0e0f0c
* Accent Vivid Lime: #9fe870
* Geometry: 24px pill radii, typographic clarity, and minimal chrome

---

## 2. Experimental Prototypes

Each trial implements a bottom-baseline calibration gate ([ CLICK TO START EXPERIMENT ]) to ensure hardware and virtual cursor coordinates synchronize with zero spatial offset before telemetry recording initiates. Upon target confirmation, all simulated friction deactivates immediately, returning the pointer to unconstrained 1:1 hardware control.

| ID | Title | Category | Physical Mechanism & Behavior |
| :--- | :--- | :--- | :--- |
| EXP-01 | Viscous Fluid | Motoric | The virtual cursor encounters exponential fluid drag as it nears the target button perimeter, requiring continuous forward effort. |
| EXP-02 | Magnetic Field | Intentional | The target emits an inverse-square repelling magnetic field. The user must consciously push against the outward repulsive force. |
| EXP-03 | Speed Limit | Motoric | Enforces a strict velocity ceiling. Moving the mouse too quickly exceeds the limit, immediately resetting the trial to the calibration gate. |
| EXP-04 | Pneumatic Press | Deliberative | A quick tap does not confirm the action. The user must maintain sustained cursor compression to charge a hydraulic threshold before firing. |
| EXP-05 | Anxiety Tremor | Affective | Inside the threshold perimeter, Brownian stochastic jitter is added to the cursor position to mirror visceral hesitation before a major choice. |
| EXP-06 | Textured Grid | Motoric | The cursor snaps along discrete textural detents, creating the illusion of moving across a corrugated surface on a flat display. |
| EXP-07 | Heavy Momentum | Deliberative | Simulates high physical mass (F = m * a). The cursor exhibits sluggish startup acceleration and significant kinetic overshoot. |
| EXP-08 | Elastic Snapping | Intentional | The cursor is tethered to a physical baseline anchor by a Hookean spring. Reaching and holding the button requires fighting continuous tension. |
| EXP-09 | Autonomous Evasion | Affective | The target displays its own agency and reluctance, gently dodging away when the cursor approaches too fast or aggressively. |
| EXP-10 | Two-Stage Detent | Deliberative | A physical detent barrier blocks direct vertical access to the button until an unlock gate lever is explicitly disengaged. |

---

## 3. Telemetry Analytics Dashboard (/dashboard)

Every completed trial automatically commits empirical motor metrics to client-side localStorage.

### Tracked Metrics
* Time-to-Target (ms): Total elapsed duration from gate confirmation to target acquisition.
* Path Distance (px): Cumulative trajectory length traveled by the cursor across the screen.
* Movement Efficiency Ratio (MER): Straight-line Euclidean distance divided by total actual distance (1.0 equals an ideal straight vector; lower scores reflect deflection, overshoot, and avoidance).
* Friction Events: Total count of resistance triggers, detents, boundary hits, or velocity resets.

### Dashboard Features
* Aggregate KPI summary cards (Total Runs, Average Time, Average MER, Total Friction).
* Filter bar to isolate runs per individual prototype or view all simultaneously.
* One-click CSV Export button to download the raw dataset for statistical analysis in R, Python, or SPSS.
* Reset button to purge stored test sessions between different study participants.

---

## 4. Installation & Setup

### Prerequisites
* Node.js 18.17+ or higher
* npm, pnpm, or yarn

### Quickstart

1. Clone the repository:
git clone https://github.com/Marijn-Snoeren/Humanise-an-Object.git

2. Navigate into the project folder:
cd Humanise-an-Object

3. Install all project dependencies:
npm install

4. Launch the local development server:
npm run dev

5. Open your browser and navigate to:
http://localhost:3000