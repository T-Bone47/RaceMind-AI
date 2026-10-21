import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface SessionRead {
  id: string;
  user_id: string;
  game: string;
  track_name: string;
  session_type: string;
  weather: string | null;
  air_temp_c: number | null;
  track_temp_c: number | null;
  total_laps: number | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await apiClient.get<SessionRead[]>("/api/v1/sessions");
      return response.data;
    },
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const response = await apiClient.get<SessionRead>(`/api/v1/sessions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
