import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface TelemetryFrameRead {
  id: string;
  session_id: string;
  lap_id: string | null;
  timestamp_ms: number;
  speed_kph: number;
  throttle_pct: number;
  brake_pct: number;
  steering: number;
  gear: number;
  engine_rpm: number;
  drs_active: boolean;
}

export function useTelemetryFrames(sessionId: string) {
  return useQuery({
    queryKey: ["telemetry_frames", sessionId],
    queryFn: async () => {
      const response = await apiClient.get<TelemetryFrameRead[]>(
        `/api/v1/telemetry/${sessionId}/frames`,
        { params: { limit: 1000, offset: 0 } }
      );
      return response.data;
    },
    enabled: !!sessionId,
    refetchInterval: 1000, // Poll every second for new frames
  });
}
