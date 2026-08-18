import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface ConfidenceRead {
  value: number;
  reason: string;
}

export interface CornerEventRead {
  index: number;
  entry_distance_m: number;
  apex_distance_m: number;
  exit_distance_m: number;
  entry_speed_kph: number;
  min_speed_kph: number;
  exit_speed_kph: number;
}

export interface PhaseFeedbackRead {
  phase: string;
  message: string;
  confidence: ConfidenceRead;
}

export interface CornerCoachingTipRead {
  corner: CornerEventRead;
  entry: PhaseFeedbackRead;
  mid: PhaseFeedbackRead;
  exit: PhaseFeedbackRead;
  steering_smoothness_note: string;
  steering_corrections: number;
  potential_gain_kph: number | null;
}

export interface ConsistencyScoreRead {
  score_0_100: number;
  lap_time_stdev_ms: number;
  lap_count: number;
  confidence: ConfidenceRead;
}

export interface TyrePreservationTipRead {
  message: string;
  reasoning: string;
  confidence: ConfidenceRead;
}

export interface CoachingReportRead {
  corner_tips: CornerCoachingTipRead[];
  consistency: ConsistencyScoreRead;
  tyre_preservation: TyrePreservationTipRead[];
}

export function useCoachingReport(sessionId: string) {
  return useQuery({
    queryKey: ["coaching", sessionId],
    queryFn: async () => {
      const response = await apiClient.get<CoachingReportRead>(
        `/api/v1/coaching/${sessionId}/report`
      );
      return response.data;
    },
    enabled: !!sessionId,
    retry: false,
  });
}
