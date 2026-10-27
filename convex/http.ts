import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

function constantTimeEqual(candidate: string, expected: string) {
  const left = new TextEncoder().encode(candidate);
  const right = new TextEncoder().encode(expected);
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) mismatch |= left[i] ^ right[i];
  return mismatch === 0;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

http.route({
  path: "/eve/ingest",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const expectedSecret = process.env.EVE_SESSION_REGISTRATION_SECRET;
    const authorization = request.headers.get("authorization") ?? "";
    const candidate = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : "";

    if (!expectedSecret || !candidate || !constantTimeEqual(candidate, expectedSecret)) {
      return json({ error: "Unauthorized" }, 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (!body || typeof body !== "object") return json({ error: "Invalid body" }, 400);
    const input = body as Record<string, unknown>;
    if (
      typeof input.eveSessionId !== "string" ||
      typeof input.userId !== "string" ||
      typeof input.issuer !== "string"
    ) {
      return json({ error: "Invalid session identity" }, 400);
    }

    await ctx.runMutation(internal.eveSessions.register, {
      eveSessionId: input.eveSessionId,
      userId: input.userId,
      issuer: input.issuer,
    });

    if (input.kind === "session") return json({ ok: true });

    if (
      input.kind !== "message" ||
      (input.role !== "user" && input.role !== "assistant") ||
      typeof input.text !== "string" ||
      input.text.length === 0 ||
      input.text.length > 20_000 ||
      !Number.isSafeInteger(input.line) ||
      !Number.isSafeInteger(input.eventIndex) ||
      (input.line as number) < 0 ||
      (input.eventIndex as number) < 0
    ) {
      return json({ error: "Invalid message" }, 400);
    }

    await ctx.runMutation(internal.eveSessions.saveMessage, {
      eveSessionId: input.eveSessionId,
      userId: input.userId,
      issuer: input.issuer,
      role: input.role,
      text: input.text,
      line: input.line as number,
      eventIndex: input.eventIndex as number,
    });

    return json({ ok: true });
  }),
});

export default http;
