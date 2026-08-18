import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface StrategyPlanRead {
  id: string;
  session_id: string;
  recommended_pit_lap: number | null;
  recommended_compound: string | null;
  reason: string | null;
  is_active: boolean;
  generated_at: string;
}

export function useActiveStrategy(sessionId: string) {
  return useQuery({
    queryKey: ["strategy", sessionId],
    queryFn: async () => {
      const response = await apiClient.get<StrategyPlanRead>(
        `/api/v1/strategy/${sessionId}/active`
      );
      return response.data;
    },
    enabled: !!sessionId,
    retry: false, // Will return 404 if no strategy exists, don't retry endlessly
  });
}

export interface StrategyRecomputeRequest {
  current_lap: number;
}

export function useRecomputeStrategy() {
  return useMutation({
    mutationFn: async ({ sessionId, payload }: { sessionId: string; payload: StrategyRecomputeRequest }) => {
      const response = await apiClient.post<StrategyPlanRead>(
        `/api/v1/strategy/${sessionId}/recompute`,
        payload
      );
      return response.data;
    },
  });
}
