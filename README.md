# Digital Friction Laboratory: Investigating Micro-Friction in Cursor Dynamics

> Een academisch ontwerponderzoek naar het herintroduceren van tastbaarheid, vertraging en bewuste intentie in mens-computerinteractie (HCI).

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=flat-square)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Theoretical Basis](https://img.shields.io/badge/Theory-Designing%20Friction-emerald?style=flat-square)](https://designingfriction.com/)

---

## 1. Abstract & Theoretisch Kader

Hedendaags digitaal interactieontwerp is gedomineerd door het streven naar *frictionless design*: one-click buttons, oneindige feeds en hyper-geoptimaliseerde conversiefunnels. Hoewel dit de cognitieve belasting verlaagt, leidt het vaak tot mechanische onoplettendheid, impulsief gedrag en een verlies van materiële verbinding tussen gebruiker en interface.

Dit project bouwt voort op het ontwerpend onderzoek van **[Designing Friction](https://designingfriction.com/)**. Het doel is het onderzoeken van *bewuste micro-frictie*: het introduceren van fysieke weerstand, vertraging en dynamische tegenkrachten in cursorinteracties. Door de cursor los te koppelen van het lineaire hardware-pad en te onderwerpen aan natuurkundige vergelijkingen (demping, veerkracht, traagheid en afstoting), transformeren we de cursor van een passief richtinstrument naar een tastbaar verlengstuk van de gebruiker.

### Kernvraag
> *"Hoe beïnvloedt de introductie van gesimuleerde fysieke micro-frictie op een virtuele cursor de bewegingsefficiëntie, taakduur en de bewuste intentie van de gebruiker bij het voltooien van een discrete actie?"*

---

## 2. Technische Methodologie: De Virtuele Cursor

Binnen moderne webbrowsers is het om veiligheidsredenen onmogelijk voor JavaScript om de fysieke hardwarecursor van het besturingssysteem direct te verplaatsen (`mouse warp`). 

Om volledige controle over de vectorwiskunde te krijgen, maakt dit testlab gebruik van een **gesimuleerde virtuele cursor**:
1. De hardwarecursor wordt binnen het testoppervlak verborgen met CSS (`cursor: none`).
2. Muisverplaatsingen (`MouseEvent.movementX`, `movementY` of `clientX`, `clientY`) worden opgevangen en doorgegeven aan een discrete physics engine via `requestAnimationFrame`.
3. Er wordt een virtuele cursor gerenderd waarvan de positie $\vec{P}_{\text{virtual}}$ continu berekend wordt op basis van de geldende wrijvingsvectoren $\vec{F}_{\text{netto}}$.

---

## 3. Gestandaardiseerde Telemetrie & Meetwaarden

Ieder experiment bevat een identieke, gestandaardiseerde testbank en knop (`[ CONFIRM ACTION ]`). Zodra de gebruiker start met bewegen, meet de ingebouwde telemetrie-engine de volgende variabelen:

* **Time-to-Target (TTT):** De tijd in milliseconden ($ms$) vanaf de eerste cursorbeweging tot aan de succesvolle klik.
* **Cursor Distance Traveled ($D$):** De totale afgelegde afstand in pixels ($px$) van de virtuele cursor.
* **Movement Efficiency Ratio (MER):** 
  $$\text{MER} = \frac{\Vert{}\vec{P}_{\text{doel}} - \vec{P}_{\text{start}}\Vert{}}{D}$$
  Een waarde van $1.0$ representeert een volstrekt rechte lijn. Waarden $< 0.5$ wijzen op afstoting, aarzeling of verlies van controle.
* **Friction Events ($E_f$):** Het aantal drempeloverschrijdingen, overshoots of afstotingsincidenten gedurende de poging.

Alle telemetriedata kan direct vanuit de interface naar het klembord worden gekopieerd als JSON-object ten behoeve van data-analyse in Python/R of verwerking in het onderzoeksverslag.

---

## 4. Catalogus van Experimenten

| # | Map | Experiment | Fysisch Mechanisme | Ontwerpprincipe (*Designing Friction*) |
|---|---|---|---|---|
| **01** | `01-viscous-drag` | **Viscous Fluid** | Exponentiële demping ($\vec{v} \cdot \mu(r)$) naarmate de knop genaderd wordt. | Motorische vertraging; voorkomt achteloos doorklikken. |
| **02** | `02-magnetic-repulsion` | **Magnetic Field** | Inverse kwadratische afstoting ($\vec{F} = \frac{k}{r^2}\hat{r}$) rondom het doel. | Intentietest; dwingt actieve fysieke krachtinspanning af. |
| **03** | `03-ice-break-speed-limit` | **Fragile Ice** | Velocity threshold ($v > v_{\text{max}}$ reset de cursor naar nulpunt). | Behoedzaamheid; dwingt tot gecontroleerde, trage beweging. |
| **04** | `04-pressure-chamber` | **Pneumatic Press** | Tijdsintegratie onder muisdruk ($\int p \, dt$); leegloop bij voortijdig loslaten. | Deliberatiefase; belet overhaaste destructieve acties. |
| **05** | `05-decision-tremor` | **Anxiety Tremor** | Toevoeging van Brownse ruis / stochastische jitter nabij de actiezone. | Affectieve frictie; reflectie van innerlijke spanning/gewicht. |
| **06** | `06-surface-corrugation` | **Textured Grid** | Discrete kwantisering en micro-weerstandsstapjes over ribbels. | Haptische illusie; geeft het digitale scherm materiële textuur. |
| **07** | `07-inertia-mass` | **Heavy Momentum** | Massa- en versnellingswet van Newton ($\vec{F} = m\vec{a}$) met overshoot. | Fysieke zwaarte; vertaalt gewichtige beslissingen naar logge massa. |
| **08** | `08-elastic-tether` | **Elastic Snapping** | Hooke's wet ($\vec{F} = -k\vec{x}$) trekt de cursor terug naar de basis. | Voortdurende aanwezigheid; actie vereist constante spanning. |
| **09** | `09-evasive-target` | **Autonomous Evasion**| Knop wijkt actief terug van de naderende cursor. | Relationele frictie; de interface vertoont een 'eigen wil'. |
| **10** | `10-mechanical-gate` | **Two-Stage Detent** | Fysieke pal/veervergrendeling die eerst doorbroken moet worden. | Sequentiële verificatie; drempel voorafgaand aan finale validatie. |

---

## 5. Installatie & Uitvoeren

### Vereisten
* Node.js v18.17.0 of hoger
* pnpm, npm of yarn

### Installatiestappen
```bash
# 1. Clone de repository
git clone https://github.com/jouw-gebruikersnaam/friction-lab.git
cd friction-lab

# 2. Installeer dependencies
pnpm install
# of: npm install

# 3. Start de lokale ontwikkelserver
pnpm dev
# of: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in de browser.