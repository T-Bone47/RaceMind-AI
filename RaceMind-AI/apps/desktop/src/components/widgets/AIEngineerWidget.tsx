import { Button, Card, CardTitle } from "@racemind/ui";
import { Radio } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useSessionStore } from "@/store/sessionStore";

/** Canned responses for the dashboard mock - the real path is
 * ai.llm.LLMClient via POST /api/v1/ai/ask, wired once the desktop app
 * talks to a live backend session instead of the local mock store. */
const MOCK_REPLIES = [
  "Gap ahead is holding at 2 seconds. No need to push yet.",
  "Tyres are tracking on plan - cliff isn't until lap 24 at this rate.",
  "Box window opens in three laps if you want the undercut.",
  "Fuel's fine, you can lean on it through the next sector.",
];

export function AIEngineerWidget() {
  const [question, setQuestion] = useState("");
  const addMessage = useSessionStore((s) => s.addMessage);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;

    addMessage({ from: "driver", text: question.trim() });
    const reply = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)] ?? MOCK_REPLIES[0];
    window.setTimeout(() => addMessage({ from: "engineer", text: reply as string }), 500);
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
          placeholder="What's my gap to the car ahead?"
          className="flex-1 rounded-md border border-border bg-carbon px-3 py-2 text-sm text-ink-primary outline-none focus-visible:ring-2 focus-visible:ring-electric"
        />
        <Button type="submit" size="sm">
          Ask
        </Button>
      </form>
    </Card>
  );
}
