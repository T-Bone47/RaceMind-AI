"use client";

import { Button, Card } from "@racemind/ui";
import { type FormEvent, useState } from "react";

import { ApiError, login } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const tokens = await login(email, password);
      // Real desktop/website session storage wiring is a future pass -
      // for now this proves the round trip against the live API.
      window.localStorage.setItem("racemind_access_token", tokens.access_token);
      window.location.href = "/";
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof ApiError
          ? error.status === 401
            ? "Email or password didn't match."
            : error.message
          : "Couldn't reach the server. Check that the backend is running.",
      );
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-6 py-20">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold text-ink-primary">Log in</h1>
        <p className="mt-1 text-sm text-ink-secondary">Access your sessions and driver profile.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-carbon px-3 py-2 text-sm text-ink-primary outline-none focus-visible:ring-2 focus-visible:ring-electric"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-secondary">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-border bg-carbon px-3 py-2 text-sm text-ink-primary outline-none focus-visible:ring-2 focus-visible:ring-electric"
              placeholder="••••••••"
            />
          </div>

          {status === "error" && (
            <p className="rounded-md border border-signal-red/30 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
              {errorMessage}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Logging in..." : "Log in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
