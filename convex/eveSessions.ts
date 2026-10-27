import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const register = internalMutation({
  args: {
    eveSessionId: v.string(),
    userId: v.string(),
    issuer: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("eveSessions")
      .withIndex("by_eve_session_id", (q) => q.eq("eveSessionId", args.eveSessionId))
      .unique();

    if (existing) {
      if (existing.userId !== args.userId || existing.issuer !== args.issuer) {
        throw new Error("Eve session is already registered to another Clerk user.");
      }
      await ctx.db.patch(existing._id, { updatedAt: Date.now() });
      return;
    }

    const now = Date.now();
    await ctx.db.insert("eveSessions", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const saveMessage = internalMutation({
  args: {
    eveSessionId: v.string(),
    userId: v.string(),
    issuer: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
    line: v.number(),
    eventIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("eveSessions")
      .withIndex("by_eve_session_id", (q) => q.eq("eveSessionId", args.eveSessionId))
      .unique();

    if (!session || session.userId !== args.userId || session.issuer !== args.issuer) {
      throw new Error("Eve session ownership could not be verified.");
    }

    const duplicate = await ctx.db
      .query("eveMessages")
      .withIndex("by_source_position", (q) =>
        q
          .eq("eveSessionId", args.eveSessionId)
          .eq("line", args.line)
          .eq("eventIndex", args.eventIndex),
      )
      .unique();

    if (duplicate) return;

    await ctx.db.insert("eveMessages", {
      eveSessionId: args.eveSessionId,
      userId: args.userId,
      role: args.role,
      text: args.text,
      line: args.line,
      eventIndex: args.eventIndex,
      createdAt: Date.now(),
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("eveSessions")
      .withIndex("by_owner", (q) =>
        q.eq("issuer", identity.issuer).eq("userId", identity.subject),
      )
      .order("desc")
      .take(50);
  },
});

export const messagesForSession = query({
  args: { eveSessionId: v.string() },
  handler: async (ctx, { eveSessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const session = await ctx.db
      .query("eveSessions")
      .withIndex("by_eve_session_id", (q) => q.eq("eveSessionId", eveSessionId))
      .unique();

    if (
      !session ||
      session.userId !== identity.subject ||
      session.issuer !== identity.issuer
    ) {
      return [];
    }

    return await ctx.db
      .query("eveMessages")
      .withIndex("by_session", (q) => q.eq("eveSessionId", eveSessionId))
      .order("asc")
      .take(500);
  },
});
