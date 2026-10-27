import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  eveSessions: defineTable({
    eveSessionId: v.string(),
    userId: v.string(),
    issuer: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_eve_session_id", ["eveSessionId"])
    .index("by_owner", ["issuer", "userId"]),
  eveMessages: defineTable({
    eveSessionId: v.string(),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    text: v.string(),
    line: v.number(),
    eventIndex: v.number(),
    createdAt: v.number(),
  }).index("by_source_position", ["eveSessionId", "line", "eventIndex"])
    .index("by_session", ["eveSessionId"]),
});
