import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";  //This imports v, which is a helper object containing validators for data types (like v.string(), v.number(), etc.).These validators ensure that your table fields contain values of the correct type.

export default defineSchema({
  user: defineTable({
    userId: v.string(), // Clerk user ID
    email: v.string(), // Clerk user email
    name: v.string(), // Clerk user name
    isPro: v.boolean(),
    proSince: v.optional(v.number()),
    lemonSqueezyCustomerId: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
  }).index("by_user_id", ["userId"]), // ✅ Fixed index name

  codeExecutions: defineTable({
    userId: v.string(),
    language: v.string(),
    code: v.string(),
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  }).index("by_user_id", ["userId"]), // ✅ Fixed index name

  snippets: defineTable({
    userId: v.string(),
    title: v.string(),
    language: v.string(),
    code: v.string(),
    userName: v.string(), // Store username for easy access
  }).index("by_user_id", ["userId"]), // ✅ Fixed index name

  snippetComments: defineTable({
    snippetId: v.id("snippets"), // Reference to the snippet
    userId: v.string(),
    userName: v.string(),
    content: v.string(), // This will store HTML content
  }).index("by_snippet_id", ["snippetId"]), // ✅ Fixed index name

  stars: defineTable({
    userId: v.string(), // ✅ coming from covex
    snippetId: v.id("snippets"), // Reference to the snippet
  })
    .index("by_user_id", ["userId"]) // ✅ Fixed index name
    .index("by_snippet_id", ["snippetId"]) // ✅ Fixed index name
    .index("by_user_id_and_snippet_id", ["userId", "snippetId"]), // ✅ Fixed index name
});
