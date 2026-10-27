import { defineHook, type HookContext } from "eve/hooks";

type BridgeMessage = {
  kind: "message";
  role: "user" | "assistant";
  text: string;
  line: number;
  eventIndex: number;
};

async function postToConvex(
  identity: { eveSessionId: string; userId: string; issuer: string },
  payload: { kind: "session" } | BridgeMessage,
) {
  const secret = process.env.EVE_SESSION_REGISTRATION_SECRET;
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.replace(/\/+$/, "");

  if (!secret || !convexSiteUrl) {
    throw new Error("EVE_SESSION_REGISTRATION_SECRET and NEXT_PUBLIC_CONVEX_SITE_URL are required.");
  }

  const response = await fetch(`${convexSiteUrl}/eve/ingest`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ ...identity, ...payload }),
  });

  if (!response.ok) {
    throw new Error(`Convex Eve bridge rejected the event (${response.status}).`);
  }
}

function getClerkOwner(ctx: HookContext) {
  const { current, initiator } = ctx.session.auth;
  if (
    current?.authenticator !== "clerk" ||
    current.principalType !== "user" ||
    !current.principalId ||
    typeof current.issuer !== "string" ||
    current.principalId !== initiator?.principalId ||
    current.issuer !== initiator?.issuer
  ) {
    throw new Error("An authenticated Clerk conversation owner is required.");
  }

  return {
    eveSessionId: ctx.session.id,
    userId: current.principalId,
    issuer: current.issuer,
  };
}

export default defineHook({
  events: {
    async "session.started"(_event, ctx) {
      await postToConvex(getClerkOwner(ctx), { kind: "session" });
    },
    async "delivery.consumed"(event, ctx) {
      const text = event.data.parts
        .filter((part) => part.kind === "text")
        .map((part) => part.text)
        .join("\n")
        .trim();
      if (!text) return;

      await postToConvex(getClerkOwner(ctx), {
        kind: "message",
        role: "user",
        text,
        line: ctx.position.line,
        eventIndex: ctx.position.index,
      });
    },
    async "content.completed"(event, ctx) {
      if (event.data.kind !== "text" || event.data.phase !== "reply") return;
      if (typeof event.data.value !== "string" || !event.data.value.trim()) return;

      await postToConvex(getClerkOwner(ctx), {
        kind: "message",
        role: "assistant",
        text: event.data.value,
        line: ctx.position.line,
        eventIndex: ctx.position.index,
      });
    },
  },
});
