import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import type { SetupValues } from '../../data/setups';

export function mapBackendToSetupValues(backendSetup: Record<string, unknown>): SetupValues {
  return {
    frontWing: Number(backendSetup.front_wing),
    rearWing: Number(backendSetup.rear_wing),
    onThrottleDiff: Number(backendSetup.diff_on_throttle),
    offThrottleDiff: Number(backendSetup.diff_off_throttle),
    engineBraking: backendSetup.engine_braking ? Number(backendSetup.engine_braking) : 50,
    frontCamber: Number(backendSetup.front_camber),
    rearCamber: Number(backendSetup.rear_camber),
    frontToe: Number(backendSetup.front_toe),
    rearToe: Number(backendSetup.rear_toe),
    frontSuspension: Number(backendSetup.front_suspension),
    rearSuspension: Number(backendSetup.rear_suspension),
    frontARB: Number(backendSetup.front_anti_roll_bar),
    rearARB: Number(backendSetup.rear_anti_roll_bar),
    frontRideHeight: Number(backendSetup.front_ride_height),
    rearRideHeight: Number(backendSetup.rear_ride_height),
    brakePressure: Number(backendSetup.brake_pressure),
    brakeBias: Number(backendSetup.brake_bias),
    pressureFL: Number(backendSetup.tyre_pressure_fl),
    pressureFR: Number(backendSetup.tyre_pressure_fr),
    pressureRL: Number(backendSetup.tyre_pressure_rl),
    pressureRR: Number(backendSetup.tyre_pressure_rr),
  };
}

export function useSetupRecommendation(payload: unknown) {
  return useQuery({
    queryKey: ['setupRecommendation', payload],
    queryFn: () => apiClient.post<{ setup: Record<string, unknown> }>('/api/v1/setups/recommend', payload)
      .then((res: { data: { setup: Record<string, unknown> } }) => mapBackendToSetupValues(res.data.setup)),
    enabled: !!payload
  });
}

export function useCircuitSetups(circuitId?: string) {
  return useQuery({
    queryKey: ['circuitSetups', circuitId],
    queryFn: () => apiClient.get<{ items: any[] }>(`/api/v1/setups`)
      .then(res => circuitId ? res.data.items.filter((item: any) => item.track_name === circuitId) : res.data.items),
  });
}
