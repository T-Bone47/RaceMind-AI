import { Card, CardTitle } from "@racemind/ui";

import { useSessionStore } from "@/store/sessionStore";

export function MessagesWidget() {
  const messages = useSessionStore((s) => s.messages);

  return (
    <Card>
      <CardTitle>Messages</CardTitle>
      <div className="mt-2 max-h-48 space-y-3 overflow-y-auto">
        {messages
          .slice()
          .reverse()
          .map((message) => (
            <div key={message.id} className="flex gap-2">
              <span className="mt-0.5 shrink-0 font-mono text-[10px] tabular-nums text-ink-muted">
                {message.timestamp}
              </span>
              <p className="text-sm leading-relaxed text-ink-secondary">{message.text}</p>
            </div>
          ))}
        {messages.length === 0 && <p className="text-sm text-ink-muted">No messages yet.</p>}
      </div>
    </Card>
  );
}
