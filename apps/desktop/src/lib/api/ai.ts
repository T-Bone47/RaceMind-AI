import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface AskRequest {
  session_id: string;
  question: string;
  context: {
    track_name: string;
    weather: string;
    track_temp_c: number | null;
    current_lap: number | null;
  };
}

export interface AskResponse {
  answer: string;
}

export function useAskOllie() {
  return useMutation({
    mutationFn: async (payload: AskRequest) => {
      const response = await apiClient.post<AskResponse>("/api/v1/ai/ask", payload);
      return response.data;
    },
  });
}
