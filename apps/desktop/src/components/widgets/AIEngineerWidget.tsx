import { Button, Card, CardTitle } from "@racemind/ui";
import { Radio } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useSessionStore } from "@/store/sessionStore";
import { apiClient } from "@/lib/api/client";

interface AskResponse {
  answer: string;
}

export function AIEngineerWidget() {
  const [question, setQuestion] = useState("");
  
  // Extract all needed session state
  const addMessage = useSessionStore((s) => s.addMessage);
  const activeSessionId = useSessionStore((s) => s.activeSessionId);
  const currentLap = useSessionStore((s) => s.currentLap);
  const totalLaps = useSessionStore((s) => s.totalLaps);
  const position = useSessionStore((s) => s.position);
  const tyres = useSessionStore((s) => s.tyres);

  const { mutate, isPending } = useMutation({
    mutationFn: async (text: string) => {
      if (!activeSessionId) throw new Error("No active session");
      
      const payload = {
        session_id: activeSessionId,
        question: text,
        context: {
          current_lap: Math.max(1, currentLap),
          total_laps: Math.max(1, totalLaps),
          position: Math.max(1, position),
          tyre_compound: tyres.compound || "soft",
          tyre_age_laps: tyres.ageLaps || 0,
          gap_to_ahead_s: 0.0,
          gap_to_behind_s: 0.0,
          recent_events: [],
        },
      };

      const response = await apiClient.post<AskResponse>('/api/v1/ai/ask', payload);
      return response.data;
    },
    onSuccess: (data) => {
      addMessage({ from: "engineer", text: data.answer });
    },
    onError: (err) => {
      addMessage({ from: "engineer", text: "Radio check, I didn't copy that." });
      console.error("AI Error:", err);
    }
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || isPending) return;

    addMessage({ from: "driver", text: question.trim() });
    mutate(question.trim());
    setQuestion("");
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Radio className="h-4 w-4 text-electric" strokeWidth={1.75} />
        <CardTitle>AI Engineer</CardTitle>
      </div>
      <p className="mt-2 text-sm text-ink-secondary">Key the radio - ask anything about the race.</p>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isPending}
          placeholder={isPending ? "Waiting for engineer..." : "What's my gap to the car ahead?"}
          className="flex-1 rounded-md border border-border bg-carbon px-3 py-2 text-sm text-ink-primary outline-none focus-visible:ring-2 focus-visible:ring-electric disabled:opacity-50"
        />
        <Button type="submit" size="sm" disabled={isPending || !question.trim()}>
          Ask
        </Button>
      </form>
    </Card>
  );
}
