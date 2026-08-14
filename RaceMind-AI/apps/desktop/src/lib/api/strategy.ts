import { useQuery } from "@tanstack/react-query";
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
