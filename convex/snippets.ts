import { v } from "convex/values";
import { mutation, query } from "./_generated/server"; //This imports the functions you use to **define Convex backend logic** (read/write access).

//You're creating a new code snippet and saving it in the snippets table — but only if the user is logged in.
//ctx is your gateway to everything your server function needs — database and authentication.
export const createSnippet = mutation({
    args: {
      title: v.string(),
      language: v.string(),
      code: v.string(),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
  
      const user = await ctx.db
        .query("user")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first();
  
      if (!user) throw new Error("User not found");
  
      const snippetId = await ctx.db.insert("snippets", {
        userId: identity.subject,
        userName: user.name,
        title: args.title,
        language: args.language,
        code: args.code,
      });
  
      return snippetId;
    },
  });

//✅ Checks if the user is logged in
//✅ Checks if they own the snippet
//🧹 Deletes related comments
//🧹 Deletes related stars
//🧨 Deletes the snippet itself
//snippet.userId = who made it
//identity.subject = who's logged in//

  export const deleteSnippet = mutation({
    args: {
      snippetId: v.id("snippets"),
    },
  
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
  
      const snippet = await ctx.db.get(args.snippetId);
      if (!snippet) throw new Error("Snippet not found");
  
      if (snippet.userId !== identity.subject) {
        throw new Error("Not authorized to delete this snippet");
      }
  
      const comments = await ctx.db
        .query("snippetComments")
        .withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .collect();
  
      for (const comment of comments) {
        await ctx.db.delete(comment._id);
      }
  
      const stars = await ctx.db
        .query("stars")
        .withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .collect();
  
      for (const star of stars) {
        await ctx.db.delete(star._id);
      }
  
      await ctx.db.delete(args.snippetId);
    },
  });


  //Lets a user star a code snippet (like a "like")
  //If they’ve already starred it, it will unstar it instead (toggle behavior)
  export const starSnippet = mutation({
    args: {
      snippetId: v.id("snippets"),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
  
      const userId = identity.subject;
  
      // Check if the user already starred the snippet
      const existing = await ctx.db
        .query("stars")
        .withIndex("by_user_id_and_snippet_id")
        .filter(
          (q) =>
            q.eq(q.field("userId"), userId) && q.eq(q.field("snippetId"), args.snippetId)
        )
        .first();
  
      if (existing) {
        // User is unstarring their own snippet
        await ctx.db.delete(existing._id);
      } else {
        // User is starring the snippet
        await ctx.db.insert("stars", {
          userId, // Ensure this is saved
          snippetId: args.snippetId,
        });
      }
    },
  });
  
  
  //This function allows a logged-in user to leave a comment on a specific snippet.
  export const addComment = mutation({
    args: {
      snippetId: v.id("snippets"),
      content: v.string(),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
  
      const user = await ctx.db
        .query("user")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first();
  
      if (!user) throw new Error("User not found");
  
      return await ctx.db.insert("snippetComments", {
        snippetId: args.snippetId,
        userId: identity.subject,
        userName: user.name,
        content: args.content,
      });
    },
  });
  

  //It allows a user to delete their own comment
  export const deleteComment = mutation({
    args: { commentId: v.id("snippetComments") },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Not authenticated");
  
      const comment = await ctx.db.get(args.commentId);
      if (!comment) throw new Error("Comment not found");
  
      // Check if the user is the comment author
      if (comment.userId !== identity.subject) {
        throw new Error("Not authorized to delete this comment");
      }
  
      await ctx.db.delete(args.commentId);
    },
  });
  

  //It fetches all snippets from the database and returns them, ordered from newest to oldest.
  export const getSnippets = query({
    handler: async (ctx) => {
      const snippets = await ctx.db.query("snippets").order("desc").collect();
      return snippets;
    },
  });
  

  //It fetches one specific snippet by its ID from the database.
  export const getSnippetById = query({
    args: { snippetId: v.id("snippets") },
    handler: async (ctx, args) => {
      const snippet = await ctx.db.get(args.snippetId);
      if (!snippet) throw new Error("Snippet not found");
  
      return snippet;
    },
  });


  //Gets all the comments related to one specific snippet
  export const getComments = query({
    args: { snippetId: v.id("snippets") },
    handler: async (ctx, args) => {
      const comments = await ctx.db
        .query("snippetComments")
        .withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .order("desc")
        .collect();
  
      return comments;
    },
  });
  

  //“Has the currently logged-in user starred this snippet?”
  export const isSnippetStarred = query({
    args: {
      snippetId: v.id("snippets"),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return false; // User is not logged in
  
      const star = await ctx.db
        .query("stars")
        .withIndex("by_user_id_and_snippet_id")
        .filter(
          (q) =>
            q.eq(q.field("userId"), identity.subject) &&
            q.eq(q.field("snippetId"), args.snippetId)
        )
        .first();
  
      return !!star; // True if the current user has starred it
    },
  });
  
  
  //It counts how many users have starred a specific code snippet.
  export const getSnippetStarCount = query({
    args: {
      snippetId: v.id("snippets"),
    },
    handler: async (ctx, args) => {
      const stars = await ctx.db
        .query("stars")
        .withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .collect();
  
      return stars.length; // Count of stars for this snippet
    },
  });
  
  
  //When a user opens their profile, they can see all the snippets they liked/starred.
  export const getStarredSnippets = query({
    handler: async (ctx) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];
  
      const stars = await ctx.db
        .query("stars")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .collect();
  
      const snippets = await Promise.all(stars.map((star) => ctx.db.get(star.snippetId)));
  
      return snippets.filter((snippet) => snippet !== null);
    },
  });
  