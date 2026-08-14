import type { Circuit, SetupValues } from '../data/setups';
import { clamp } from './format';

export interface SetupScore {
  overall: number;
  topSpeed: number;
  cornering: number;
  highSpeedStability: number;
  lowSpeedGrip: number;
  acceleration: number;
  braking: number;
  tyreDeg: number;
  racePace: number;
  qualiPace: number;
  fuelUse: number;
  ersEfficiency: number;
  traction: number;
  balance: number;
  lapTime: number;
  confidence: number;
  driverConfidence: number;
}

const norm = (v: number, min: number, max: number) => clamp((v - min) / (max - min), 0, 1);

export function scoreSetup(s: SetupValues, circuit: Circuit): SetupScore {
  const wing = (s.frontWing + s.rearWing) / 2;
  const wingNorm = norm(wing, 0, 50);
  const rake = s.rearRideHeight - s.frontRideHeight;
  const stiffness = norm((s.frontSuspension + s.rearSuspension) / 2, 1, 41);
  const arbBalance = (s.frontARB - s.rearARB) / 20;
  const camber = norm(-(s.frontCamber + s.rearCamber) / 2, 1.75, 2.75);
  const frontPressure = (s.pressureFL + s.pressureFR) / 2;
  const rearPressure = (s.pressureRL + s.pressureRR) / 2;

  const downforceTarget = { Low: 0.14, Medium: 0.24, High: 0.36, Maximum: 0.44 }[circuit.downforce];
  const wingFit = 1 - Math.min(1, Math.abs(wingNorm - downforceTarget) / 0.34);

  const topSpeed = Math.round(clamp(100 - wingNorm * 165 - norm(rake, 0, 26) * 12 + 34, 20, 99));
  const cornering = Math.round(clamp(38 + wingNorm * 118 + camber * 22 + norm(rake, 0, 26) * 10, 20, 99));
  const highSpeedStability = Math.round(
    clamp(34 + wingNorm * 96 + stiffness * 26 + (s.offThrottleDiff - 50) * 0.34 - Math.abs(arbBalance) * 14, 20, 99)
  );
  const lowSpeedGrip = Math.round(
    clamp(96 - stiffness * 46 - (rearPressure - 20) * 12 + (100 - s.onThrottleDiff) * 0.32, 20, 99)
  );
  const traction = Math.round(
    clamp(30 + (100 - s.onThrottleDiff) * 0.42 + (41 - s.rearSuspension) * 0.68 + (23 - rearPressure) * 9 + wingNorm * 34, 20, 99)
  );
  const acceleration = Math.round(clamp(traction * 0.52 + topSpeed * 0.48, 20, 99));
  const braking = Math.round(
    clamp(28 + (s.brakePressure - 80) * 2.2 + (s.brakeBias - 50) * 1.4 + wingNorm * 42 - stiffness * 8, 20, 99)
  );
  const tyreDeg = Math.round(
    clamp(
      100 - (camber * 26 + circuit.tyreStress / 100 * 34 + stiffness * 18 + (24 - frontPressure) * 6 + Math.abs(arbBalance) * 12),
      15,
      98
    )
  );
  const fuelUse = Math.round(clamp(96 - wingNorm * 62 - s.engineBraking / 100 * 14, 25, 99));
  const ersEfficiency = Math.round(clamp(46 + s.engineBraking / 100 * 34 + (s.brakeBias - 50) * 1.1 + wingNorm * 22, 25, 99));
  const balance = Math.round(clamp(50 + (s.rearARB - s.frontARB) * 2.6 + (s.frontWing - s.rearWing) * 1.9, 0, 100));

  const qualiPace = Math.round(clamp(cornering * 0.4 + topSpeed * 0.26 + braking * 0.18 + traction * 0.16, 20, 99));
  const racePace = Math.round(clamp(qualiPace * 0.58 + tyreDeg * 0.3 + fuelUse * 0.12, 20, 99));

  const overall = Math.round(
    clamp(
      racePace * 0.3 + qualiPace * 0.22 + highSpeedStability * 0.16 + traction * 0.16 + tyreDeg * 0.16 + wingFit * 10,
      20,
      99
    )
  );

  const balancePenalty = Math.abs(balance - 50) / 50;
  const confidence = Math.round(clamp(wingFit * 62 + (1 - balancePenalty) * 30 + 8, 22, 98));
  const driverConfidence = Math.round(clamp(highSpeedStability * 0.42 + lowSpeedGrip * 0.3 + (1 - balancePenalty) * 34, 20, 99));

  const baseLap = circuit.lengthKm * 13.6;
  const lapTime = baseLap * (1 + (99 - qualiPace) / 620) + circuit.brakeDemand / 100 * 0.4;

  return {
    overall,
    topSpeed,
    cornering,
    highSpeedStability,
    lowSpeedGrip,
    acceleration,
    braking,
    tyreDeg,
    racePace,
    qualiPace,
    fuelUse,
    ersEfficiency,
    traction,
    balance,
    lapTime,
    confidence,
    driverConfidence
  };
}

export function balanceLabel(balance: number): {text: string;color: string;} {
  if (balance > 62) return { text: 'Oversteer', color: '#E10600' };
  if (balance > 54) return { text: 'Light oversteer', color: '#FF7A29' };
  if (balance < 38) return { text: 'Understeer', color: '#3D8BFF' };
  if (balance < 46) return { text: 'Light understeer', color: '#00E5FF' };
  return { text: 'Neutral', color: '#00D68F' };
}

export function aiSetupFor(base: SetupValues, circuit: Circuit): SetupValues {
  return {
    ...base,
    frontWing: circuit.aero[0],
    rearWing: circuit.aero[1],
    onThrottleDiff: clamp(Math.round(84 - circuit.tyreStress * 0.18), 55, 92),
    offThrottleDiff: clamp(Math.round(48 + circuit.brakeDemand * 0.12), 50, 72),
    engineBraking: clamp(Math.round(circuit.brakeDemand * 0.6), 20, 90),
    frontRideHeight: circuit.downforce === 'Maximum' ? 33 : 28,
    rearRideHeight: circuit.downforce === 'Maximum' ? 48 : 43,
    frontSuspension: circuit.downforce === 'Maximum' ? 14 : Math.round(18 + circuit.avgSpeed / 14),
    rearSuspension: circuit.downforce === 'Maximum' ? 6 : Math.round(6 + circuit.avgSpeed / 30),
    frontARB: circuit.downforce === 'Maximum' ? 6 : 13,
    rearARB: circuit.downforce === 'Maximum' ? 3 : 6,
    brakePressure: clamp(Math.round(88 + circuit.brakeDemand * 0.1), 88, 100),
    brakeBias: clamp(Number((52 + circuit.brakeDemand * 0.05).toFixed(1)), 52, 60)
  };
}