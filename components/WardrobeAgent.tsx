"use client";

import { useAuth } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { activeTurn } from "eve/events";
import { Client } from "eve/client";
import { useEveAgent } from "eve/react";
import { FormEvent, useEffect, useMemo, useState } from "react";

function AgentChat() {
  const { getToken } = useAuth();
  const [draft, setDraft] = useState("");
  const [connection, setConnection] = useState<"checking" | "connected" | "unavailable">("checking");
  const client = useMemo(
    () =>
      new Client({
        baseUrl: "",
        auth: {
          bearer: async () => {
            const token = await getToken({ template: "convex" });
            if (!token) throw new Error("Sign in to continue.");
            return token;
          },
        },
        redirect: "error",
      }),
    [getToken],
  );

  useEffect(() => {
    let active = true;
    void client.info().then(
      () => active && setConnection("connected"),
      () => active && setConnection("unavailable"),
    );
    return () => {
      active = false;
    };
  }, [client]);

  const agent = useEveAgent({
    auth: {
      bearer: async () => {
        const token = await getToken({ template: "convex" });
        if (!token) throw new Error("Sign in to continue.");
        return token;
      },
    },
  });
  const busy = agent.status === "busy" || agent.status === "resuming";
  const turnIsOpen = activeTurn(agent.view) !== undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    setDraft("");
    void agent.send(message, turnIsOpen ? { turnPolicy: "steer" } : undefined).catch(() => {});
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <p aria-live="polite" className="text-xs text-zinc-500">
        {connection === "checking"
          ? "Checking Clerk-authenticated Eve connection…"
          : connection === "connected"
            ? "Eve connected · Clerk session verified"
            : "Eve connection unavailable · check the Clerk session and Eve runtime"}
      </p>
      <div className="min-h-48 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        {agent.messages.length === 0 ? (
          <p className="text-sm text-zinc-500">Ask for outfit ideas, styling help, or advice on what to wear.</p>
        ) : (
          agent.messages.map((message) => (
            <article key={message.id} className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{message.role}</p>
              {message.parts.map((part, index) =>
                part.type === "text" ? <p key={part.id ?? index} className="whitespace-pre-wrap text-sm leading-6">{part.text}</p> : null,
              )}
            </article>
          ))
        )}
      </div>
      {agent.error ? (
        <p role="alert" className="text-sm text-red-600">
          {agent.error instanceof Error ? agent.error.message : String(agent.error)}
        </p>
      ) : null}
      <form onSubmit={submit} className="flex gap-2">
        <input
          aria-label="Message your wardrobe assistant"
          className="min-w-0 flex-1 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="What should I wear today?"
          disabled={busy}
        />
        <button
          className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          type="submit"
          disabled={busy || !draft.trim()}
        >
          {busy ? "Thinking…" : "Send"}
        </button>
      </form>
    </div>
  );
}

export function WardrobeAgent() {
  return (
    <section className="w-full space-y-3">
      <h2 className="text-lg font-semibold">Wardrobe assistant</h2>
      <AuthLoading>
        <p className="text-sm text-zinc-500">Checking your secure session…</p>
      </AuthLoading>
      <Unauthenticated>
        <p className="text-sm text-zinc-500">Sign in to use your wardrobe assistant.</p>
      </Unauthenticated>
      <Authenticated>
        <AgentChat />
      </Authenticated>
    </section>
  );
}
